const bridge = require("./gemini-bridge");

/**
 * setupGeminiWebSocket
 * Handles real-time chat communication for the Gemini CLI.
 */
function setupGeminiWebSocket(geminiWss) {
  geminiWss.on("connection", (ws, req) => {
    console.log(
      `[WS-Gemini] New connection attempt from ${req.socket.remoteAddress}`,
    );

    // Auth check (matches Antigravity Deck's pattern)
    const authKey = process.env.AUTH_KEY || "";
    if (authKey) {
      const url = new URL(req.url, "http://localhost");
      const key = url.searchParams.get("auth_key");

      if (!key) {
        console.warn("[WS-Gemini] Rejecting connection: No auth_key provided");
        ws.close(4401, "Unauthorized");
        return;
      }

      if (key !== authKey) {
        console.warn("[WS-Gemini] Rejecting connection: Invalid auth_key");
        ws.close(4401, "Unauthorized");
        return;
      }
    }

    console.log("[WS-Gemini] Connection authorized");

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

            proc.stdout.on("data", (data) => {
              const text = data.toString();
              // Catch session ID in the stream if it's a new chat
              const idMatch = text.match(/Session ID: ([a-zA-Z0-9_-]+)/);
              const discoveredId = idMatch ? idMatch[1] : null;

              _send(ws, {
                type: "response",
                text: text,
                sessionId: discoveredId || bridge.sessionId,
              });
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
                sessionId: bridge.sessionId,
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

module.exports = { setupGeminiWebSocket };
