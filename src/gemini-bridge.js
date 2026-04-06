const { spawn } = require("child_process");
const os = require("os");

/**
 * GeminiBridge
 * Logic for spawning and controlling the Gemini CLI as a subprocess.
 * Adapted for Antigravity Deck from the Gemini-CLI-UI project.
 */
class GeminiBridge {
  constructor() {
    this.process = null;
    this.sessionId = null;
  }

  /**
   * Spawn the gemini CLI.
   * @param {Object} options
   * @param {string} [options.prompt] The prompt to send.
   * @param {string} [options.sessionId] The session ID to resume.
   * @param {string} [options.model] The model to use (flash, pro, etc).
   * @param {string} [options.cwd] Current working directory for the CLI.
   */
  async spawn(options = {}) {
    const { prompt, sessionId, model, cwd } = options;
    const args = [];

    // Kill any existing process before starting a new one in this bridge instance
    this.kill();

    if (sessionId) {
      args.push("--resume", sessionId);
    }

    if (model) {
      args.push("--model", model);
    }

    if (prompt) {
      // Escape and wrap prompt in double quotes for safe shell execution on any platform
      const escaped = prompt.replace(
        /"/g,
        os.platform() === "win32" ? '""' : '\\"',
      );
      args.push("--prompt", `"${escaped}"`);
    }

    // Always use --yolo for non-interactive server-side automation
    args.push("--yolo");

    // Use stream-json to get the session ID and other metadata reliably
    args.push("--output-format", "stream-json");

    const executable = "gemini";

    console.log(`[Gemini Bridge] Spawning: ${executable} ${args.join(" ")}`);

    this.process = spawn(executable, args, {
      cwd: cwd || os.homedir(),
      shell: true,
      env: {
        ...process.env,
        PYTHONIOENCODING: "utf-8",
        // Ensure output is unbuffered so we get it in real-time
        PYTHONUNBUFFERED: "1",
      },
    });

    this.process.on("error", (err) => {
      console.error(`[Gemini Bridge] FAILED TO SPAWN: ${err.message}`);
    });

    // Handle process exit to clean up
    this.process.on("exit", (code) => {
      console.log(`[Gemini Bridge] Process exited with code ${code}`);
      this.process = null;
    });

    // Track session ID from JSON stdout
    const idListener = (data) => {
      const out = data.toString();
      // Since it's stream-json, we might have multiple JSON objects or partials
      const lines = out.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const json = JSON.parse(line);
          if (json.type === "init" && json.session_id) {
            this.sessionId = json.session_id;
            console.log(
              `[Gemini Bridge] Detected Session ID: ${this.sessionId}`,
            );
          }
        } catch (e) {
          // Might be a partial line or non-JSON (like extension logs)
        }
      }
    };
    this.process.stdout.on("data", idListener);

    return this.process;
  }

  /**
   * Terminate the current Gemini session.
   */
  kill() {
    if (this.process) {
      console.log(
        `[Gemini Bridge] Terminating active session ${this.sessionId || "unknown"}`,
      );
      try {
        // Use taskkill on Windows to ensure the entire tree is cleaned up
        if (os.platform() === "win32") {
          // Use /pid and /t (tree) and /f (force)
          // Note: we use this.process.pid which is the shell's PID if shell: true
          spawn("taskkill", ["/pid", this.process.pid, "/f", "/t"]);
        } else {
          this.process.kill("SIGTERM");
        }
      } catch (e) {
        console.error(`[Gemini Bridge] Kill failed: ${e.message}`);
      }
      this.process = null;
    }
  }
}

// Export a singleton instance
module.exports = new GeminiBridge();
