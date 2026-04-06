const bridge = require("./gemini-bridge");
const { handleWsAuth, setupWsHeartbeat } = require("./ws-utils");

/**
 * setupGeminiWebSocket
 * Handles real-time chat communication for the Gemini CLI.
 */
function setupGeminiWebSocket(geminiWss) {
  geminiWss.on("connection", (ws, req) => {
    console.log(
      `[WS-Gemini] New connection attempt from ${req.socket.remoteAddress}`,
    );

    if (!handleWsAuth(ws, req, "[WS-Gemini]")) return;

    setupWsHeartbeat(ws);
    console.log("[WS-Gemini] Connection authorized and heartbeat started");

    ws.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        _send(ws, { type: "error", message: "Invalid JSON" });
        return;
      }

      console.log(`[WS-Gemini] Message received: ${msg.type}`);
      try {
        switch (msg.type) {
          case "gemini-command": {
            console.log(
              `[WS-Gemini] Spawning command for prompt: "${msg.options.prompt.substring(0, 30)}..."`,
            );
            const proc = await bridge.spawn(msg.options);

            let discoveredId = null;
            let stdoutBuffer = "";
            let hasStreamedContent = false;

            proc.stdout.on("data", (data) => {
              stdoutBuffer += data.toString();
              const lines = stdoutBuffer.split("\n");
              // Keep the last partial line in the buffer
              stdoutBuffer = lines.pop();

              for (const line of lines) {
                if (!line.trim()) continue;
                try {
                  const event = JSON.parse(line);
                  // Extract session ID from init event (CLI uses snake_case)
                  if (event.type === "init" && event.session_id) {
                    discoveredId = event.session_id;
                  }
                  // Stream assistant text directly as modifiedResponse so it
                  // appears in the agent response bubble (not the processing group)
                  if (event.type === "message" && event.role === "assistant") {
                    hasStreamedContent = true;
                    _send(ws, {
                      type: "step-update",
                      isStreamingChunk: true,
                      step: {
                        type: "CORTEX_STEP_TYPE_PLANNER_RESPONSE",
                        status: "streaming",
                        plannerResponse: { modifiedResponse: event.content || "" },
                        metadata: { createdAt: new Date().toISOString() },
                      },
                      sessionId: discoveredId || bridge.sessionId,
                    });
                    continue;
                  }
                  // Skip result event if we already streamed content (it's a duplicate)
                  if (event.type === "result" && hasStreamedContent) {
                    continue;
                  }
                  _handleGeminiEvent(ws, event, discoveredId || bridge.sessionId);
                } catch (e) {
                  // If not JSON, treat as raw log
                  _send(ws, { type: "log", message: line });
                }
              }
            });

            proc.stderr.on("data", (data) => {
              const text = data.toString();
              console.log(`[Gemini CLI Log] ${text.trim()}`);
              _send(ws, {
                type: "log",
                message: text,
              });
            });

            proc.on("error", (err) => {
              console.error("[WS-Gemini] Process Spawn Error:", err);
              _send(ws, {
                type: "error",
                message: `Spawn failed: ${err.message}`,
              });
            });

            proc.on("close", (code) => {
              console.log(`[WS-Gemini] Process closed with code ${code}`);
              _send(ws, {
                type: "complete",
                code,
                sessionId: discoveredId || bridge.sessionId,
              });
            });
            break;
          }

          case "abort-session": {
            console.log("[WS-Gemini] Aborting session");
            bridge.kill();
            _send(ws, { type: "aborted" });
            break;
          }

          default:
            _send(ws, { type: "error", message: `Unknown type: ${msg.type}` });
        }
      } catch (e) {
        console.error("[WS-Gemini] Handler Error:", e);
        _send(ws, { type: "error", message: e.message });
      }
    });

    ws.on("close", () => {
      console.log("[WS-Gemini] Connection closed");
      bridge.kill(); // Kill the CLI if the browser/mobile disconnects
    });
  });
}

function _send(ws, data) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

/**
 * _handleGeminiEvent
 * Maps raw JSON events from the Gemini CLI to Antigravity Step objects.
 */
function _handleGeminiEvent(ws, event, sessionId) {
  const step = {
    type: "CORTEX_STEP_TYPE_EPHEMERAL_MESSAGE",
    status: "done",
    metadata: { createdAt: new Date().toISOString() },
  };

  switch (event.type) {
    case "init":
      return; // Handled in message loop to catch session_id

    case "message":
      return; // Handled inline in message loop (streaming chunks)

    case "tool_use":
      step.type = "CORTEX_STEP_TYPE_PLANNER_RESPONSE";
      step.plannerResponse = {
        toolCalls: [
          {
            id: event.callId || event.call_id,
            name: event.tool || event.name,
            argumentsJson: JSON.stringify(event.arguments || event.args || {}),
          },
        ],
      };
      break;

    case "tool_result":
      step.type = "CORTEX_STEP_TYPE_EPHEMERAL_MESSAGE";
      step.ephemeralMessage = {
        content: `Tool Result [${event.callId || event.call_id}]: ${JSON.stringify(event.result || event.output || "")}`,
      };
      break;

    case "error":
      step.type = "CORTEX_STEP_TYPE_ERROR_MESSAGE";
      step.errorMessage = event.message || event.error || "Unknown error";
      break;

    case "result":
      // Fallback: only reached if no message events were streamed
      step.type = "CORTEX_STEP_TYPE_PLANNER_RESPONSE";
      step.plannerResponse = {
        modifiedResponse: event.response || event.content || event.text || "",
      };
      break;

    default:
      return;
  }

  _send(ws, {
    type: "step-update",
    step,
    sessionId,
  });
}

module.exports = { setupGeminiWebSocket };
