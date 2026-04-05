const { spawn } = require("child_process");
const fs = require("fs").promises;
const https = require("https");
const os = require("os");
const path = require("path");
const discovery = require("../gemini-discovery");

// Google OAuth credentials from the Gemini CLI
const OAUTH_CLIENT_ID =
  process.env.OAUTH_CLIENT_ID ||
  "681255809395-oo8ft2oprdrnp9e3aqf6av3hmdib135j.apps.googleusercontent.com";
const OAUTH_CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET || "";
const CODE_ASSIST_HOST = "cloudcode-pa.googleapis.com";
const CODE_ASSIST_BASE = "/v1internal";

// Cache project ID in memory — it never changes for a given OAuth account
let _cachedProjectId = null;

async function getOAuthToken() {
  const credsPath = path.join(os.homedir(), ".gemini", "oauth_creds.json");
  const creds = JSON.parse(await fs.readFile(credsPath, "utf8"));

  // Refresh if expired (with 60s buffer)
  if (creds.expiry_date && Date.now() > creds.expiry_date - 60_000) {
    const refreshed = await refreshAccessToken(creds.refresh_token);
    const updated = {
      ...creds,
      ...refreshed,
      expiry_date: Date.now() + refreshed.expires_in * 1000,
    };
    await fs.writeFile(credsPath, JSON.stringify(updated, null, 2));
    return updated.access_token;
  }
  return creds.access_token;
}

function refreshAccessToken(refreshToken) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: OAUTH_CLIENT_ID,
      client_secret: OAUTH_CLIENT_SECRET,
    }).toString();
    const req = https.request(
      {
        hostname: "oauth2.googleapis.com",
        path: "/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => {
          d += c;
        });
        res.on("end", () => resolve(JSON.parse(d)));
      },
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function codeAssistPost(method, body, token) {
  return new Promise((resolve, reject) => {
    const raw = JSON.stringify(body);
    const req = https.request(
      {
        hostname: CODE_ASSIST_HOST,
        path: `${CODE_ASSIST_BASE}:${method}`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(raw),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (c) => {
          d += c;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(d));
          } catch (e) {
            reject(new Error(`Non-JSON response: ${d.substring(0, 200)}`));
          }
        });
      },
    );
    req.on("error", reject);
    req.write(raw);
    req.end();
  });
}

async function getProjectId(token) {
  if (_cachedProjectId) return _cachedProjectId;
  const res = await codeAssistPost(
    "loadCodeAssist",
    { cloudaicompanionProject: "" },
    token,
  );
  _cachedProjectId = res.cloudaicompanionProject;
  return _cachedProjectId;
}

/**
 * Gemini API Routes
 * Exposed at /api/gemini/
 */
module.exports = function (app) {
  /**
   * GET /api/gemini/stats?cwd=<path>
   * Run `gemini --prompt "/stats" --output-format json` and return the parsed result.
   */
  app.get("/api/gemini/stats", async (req, res) => {
    const cwd = req.query.cwd || os.homedir();
    try {
      const data = await new Promise((resolve, reject) => {
        const args = [
          "--prompt",
          "/stats",
          "--output-format",
          "json",
          "--yolo",
        ];
        // Use cmd.exe on Windows so bash doesn't expand /stats as a file path
        const shell = os.platform() === "win32" ? "cmd.exe" : true;
        const proc = spawn("gemini", args, {
          cwd,
          shell,
          env: { ...process.env },
        });

        let stdout = "";
        proc.stdout.on("data", (d) => {
          stdout += d.toString();
        });
        proc.on("close", () => {
          if (!stdout.trim())
            return reject(new Error("No output from stats command"));
          try {
            resolve(JSON.parse(stdout));
          } catch (e) {
            reject(
              new Error(
                `Failed to parse stats JSON: ${stdout.substring(0, 200)}`,
              ),
            );
          }
        });
        proc.on("error", reject);
      });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  /**
   * GET /api/gemini/quota
   * Fetch per-model quota from Google's Code Assist API using stored OAuth creds.
   * Returns: { buckets: [{ modelId, remainingFraction, resetTime, tokenType }] }
   */
  app.get("/api/gemini/quota", async (_req, res) => {
    try {
      const token = await getOAuthToken();
      const projectId = await getProjectId(token);
      if (!projectId)
        return res
          .status(503)
          .json({ error: "Could not resolve Gemini project ID" });
      const data = await codeAssistPost(
        "retrieveUserQuota",
        { project: projectId },
        token,
      );
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/gemini/projects
   * List all discovered Gemini projects from ~/.gemini/
   */
  app.get("/api/gemini/projects", async (req, res) => {
    try {
      const projects = await discovery.getGeminiProjects();
      res.json({ projects });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/gemini/projects/:projectId/sessions
   * List all sessions for a specific Gemini project.
   */
  app.get("/api/gemini/projects/:projectId/sessions", async (req, res) => {
    try {
      const sessions = await discovery.getGeminiSessions(req.params.projectId);
      res.json({ sessions });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  /**
   * GET /api/gemini/projects/:projectId/sessions/:sessionId
   * Get messages/history for a specific Gemini session.
   */
  app.get(
    "/api/gemini/projects/:projectId/sessions/:sessionId",
    async (req, res) => {
      try {
        const messages = await discovery.getGeminiHistory(
          req.params.projectId,
          req.params.sessionId,
        );
        res.json({ messages });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    },
  );

  /**
   * DELETE /api/gemini/projects/:projectId/sessions/:sessionId
   * Delete a specific Gemini session history file.
   */
  app.delete(
    "/api/gemini/projects/:projectId/sessions/:sessionId",
    async (req, res) => {
      try {
        const deleted = await discovery.deleteGeminiSession(
          req.params.projectId,
          req.params.sessionId,
        );
        res.json({ deleted });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    },
  );
};
