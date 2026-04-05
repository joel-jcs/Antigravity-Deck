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
      args.push("--prompt", prompt);
    }

    // Always use --yolo for non-interactive server-side automation
    args.push("--yolo");

    // Plain text output — no ANSI codes in the streamed response
    args.push("--output-format", "text");

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

    // Track session ID from stdout if it's a new session
    if (!sessionId) {
      const idListener = (data) => {
        const out = data.toString();
        // The CLI prints "Session ID: <id>" on startup
        const match = out.match(/Session ID: ([a-zA-Z0-9_-]+)/);
        if (match) {
          this.sessionId = match[1];
          console.log(
            `[Gemini Bridge] Detected new Session ID: ${this.sessionId}`,
          );
          this.process.stdout.removeListener("data", idListener);
        }
      };
      this.process.stdout.on("data", idListener);
    } else {
      this.sessionId = sessionId;
      console.log(`[Gemini Bridge] Resuming session: ${this.sessionId}`);
    }

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
