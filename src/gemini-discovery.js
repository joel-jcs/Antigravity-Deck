const fs = require("fs").promises;
const path = require("path");
const os = require("os");

/**
 * GeminiDiscovery
 * Logic for finding Gemini projects and sessions on the host machine.
 */
async function getGeminiProjects() {
  const geminiDir = path.join(os.homedir(), ".gemini");
  const projectsJsonPath = path.join(geminiDir, "projects.json");
  const tmpDir = path.join(geminiDir, "tmp");

  const projects = [];
  const discoveredPaths = new Set();

  // 1. Try to load from projects.json
  try {
    const data = await fs.readFile(projectsJsonPath, "utf8");
    const { projects: projectMap } = JSON.parse(data);
    if (projectMap) {
      for (const [absPath, name] of Object.entries(projectMap)) {
        projects.push({
          id: name,
          displayName: name,
          path: absPath,
          isNative: false,
        });
        discoveredPaths.add(name);
      }
    }
  } catch (e) {
    console.log("[Gemini Discovery] projects.json not found or invalid");
  }

  // 2. Discover from tmp directory (native chats or projects not in JSON)
  try {
    const entries = await fs.readdir(tmpDir, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.isDirectory() &&
        !discoveredPaths.has(entry.name) &&
        entry.name !== "bin"
      ) {
        projects.push({
          id: entry.name,
          displayName: entry.name,
          path: path.join(tmpDir, entry.name),
          isNative: true,
        });
      }
    }
  } catch (e) {
    console.log("[Gemini Discovery] tmp directory not found");
  }

  return projects;
}

async function getGeminiSessions(projectId) {
  if (!projectId) return [];
  const geminiDir = path.join(os.homedir(), ".gemini");
  const projectTmpDir = path.join(geminiDir, "tmp", projectId);
  const chatsDir = path.join(projectTmpDir, "chats");

  try {
    const exists = await fs
      .access(chatsDir)
      .then(() => true)
      .catch(() => false);
    if (!exists) return [];
    const files = await fs.readdir(chatsDir);
    const sessions = [];

    for (const file of files) {
      if (file.startsWith("session-") && file.endsWith(".json")) {
        const filePath = path.join(chatsDir, file);
        const stats = await fs.stat(filePath);

        try {
          // Read just the beginning of the file to get the summary
          const content = await fs.readFile(filePath, "utf8");
          const sessionData = JSON.parse(content);

          let summary = "Untitled Session";
          const firstUserMsg = sessionData.messages?.find(
            (m) => m.type === "user",
          );
          if (firstUserMsg) {
            const textContent = Array.isArray(firstUserMsg.content)
              ? firstUserMsg.content.map((c) => c.text).join(" ")
              : firstUserMsg.content;
            summary =
              textContent.length > 50
                ? textContent.substring(0, 50) + "..."
                : textContent;
          }

          sessions.push({
            id: sessionData.sessionId || path.basename(file, ".json"), // UUID for CLI --resume
            displayId: path.basename(file, ".json"),
            summary,
            lastModified: sessionData.lastUpdated || stats.mtime.toISOString(),
            messageCount: sessionData.messages?.length || 0,
          });
        } catch (e) {
          // Fallback if JSON parse fails
          sessions.push({
            id: path.basename(file, ".json"),
            summary: "Recovery Session",
            lastModified: stats.mtime.toISOString(),
            messageCount: 0,
          });
        }
      }
    }

    // Sort by most recent
    return sessions.sort(
      (a, b) => new Date(b.lastModified) - new Date(a.lastModified),
    );
  } catch (e) {
    return [];
  }
}

async function getGeminiHistory(projectId, sessionId) {
  if (!projectId || !sessionId) return [];
  const geminiDir = path.join(os.homedir(), ".gemini");
  const projectTmpDir = path.join(geminiDir, "tmp", projectId);
  const chatsDir = path.join(projectTmpDir, "chats");

  // Session IDs are now UUIDs (for --resume). Find the matching file by
  // scanning for a JSON file whose sessionId field equals the passed UUID.
  let resolvedPath = null;
  try {
    const files = await fs.readdir(chatsDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const fp = path.join(chatsDir, file);
      try {
        const content = await fs.readFile(fp, "utf8");
        const data = JSON.parse(content);
        if (data.sessionId === sessionId) {
          resolvedPath = fp;
          break;
        }
      } catch (_) {
        // skip unparseable files
      }
    }
  } catch (e) {
    console.error(
      `[Gemini Discovery] History read failed for ${sessionId}:`,
      e.message,
    );
    return [];
  }

  if (!resolvedPath) return [];

  try {
    const content = await fs.readFile(resolvedPath, "utf8");
    const sessionData = JSON.parse(content);
    return sessionData.messages || [];
  } catch (e) {
    console.error(
      `[Gemini Discovery] History parse failed for ${sessionId}:`,
      e.message,
    );
    return [];
  }
}

async function deleteGeminiSession(projectId, sessionId) {
  if (!projectId || !sessionId) return false;
  const geminiDir = path.join(os.homedir(), ".gemini");
  const projectTmpDir = path.join(geminiDir, "tmp", projectId);
  const chatsDir = path.join(projectTmpDir, "chats");

  try {
    const files = await fs.readdir(chatsDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const fp = path.join(chatsDir, file);
      try {
        const content = await fs.readFile(fp, "utf8");
        const data = JSON.parse(content);
        if (data.sessionId === sessionId) {
          await fs.unlink(fp);
          return true;
        }
      } catch (_) {}
    }
  } catch (e) {
    console.error(
      `[Gemini Discovery] Deletion failed for ${sessionId}:`,
      e.message,
    );
  }
  return false;
}

module.exports = {
  getGeminiProjects,
  getGeminiSessions,
  getGeminiHistory,
  deleteGeminiSession,
};
