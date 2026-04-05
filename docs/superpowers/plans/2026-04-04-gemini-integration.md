# 🤖 Gemini CLI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the Gemini CLI as a first-class citizen in the Antigravity Deck, providing a mobile-friendly chat interface that reuses existing PC credentials.

**Architecture:** A backend bridge spawns the `gemini` CLI subprocess and streams output via a dedicated `/ws/gemini` WebSocket, while the Next.js frontend reuses existing conversation UI components.

**Tech Stack:** Node.js (Backend), Next.js (Frontend), WebSockets, Lucide Icons.

---

### Task 1: Backend Bridge (`src/gemini-bridge.js`)

**Files:**

- Create: `src/gemini-bridge.js`

- [ ] **Step 1: Implement the Gemini Bridge**
      Create the class that handles subprocess spawning and output parsing.

```javascript
const { spawn } = require("child_process");
const path = require("path");
const os = require("os");
const fs = require("fs");

class GeminiBridge {
  constructor() {
    this.process = null;
    this.sessionId = null;
  }

  async spawn(options = {}) {
    const { prompt, sessionId, model, cwd } = options;
    const args = [];

    if (sessionId) args.push("--resume", sessionId);
    if (model) args.push("--model", model);
    if (prompt) args.push("--prompt", prompt);
    args.push("--yolo"); // Always use yolo for non-interactive server mode

    console.log(`[Gemini Bridge] Spawning: gemini ${args.join(" ")}`);

    this.process = spawn("gemini", args, {
      cwd: cwd || os.homedir(),
      shell: true,
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    return this.process;
  }

  kill() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}

module.exports = new GeminiBridge();
```

- [ ] **Step 2: Commit**

```bash
git add src/gemini-bridge.js
git commit -m "feat(backend): add gemini bridge for spawning cli subprocess"
```

---

### Task 2: Project & Session Discovery (`src/gemini-discovery.js`)

**Files:**

- Create: `src/gemini-discovery.js`

- [ ] **Step 1: Implement discovery logic**
      Point to `~/.gemini` and scan for projects and sessions.

```javascript
const fs = require("fs").promises;
const path = require("path");
const os = require("os");

async function getGeminiProjects() {
  const geminiDir = path.join(os.homedir(), ".gemini", "projects");
  try {
    const entries = await fs.readdir(geminiDir, { withFileTypes: true });
    const projects = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        projects.push({
          id: entry.name,
          displayName: entry.name, // Simplified for now
          path: path.join(geminiDir, entry.name),
        });
      }
    }
    return projects;
  } catch (e) {
    return [];
  }
}

async function getGeminiSessions(projectId) {
  const projectDir = path.join(os.homedir(), ".gemini", "projects", projectId);
  try {
    const files = await fs.readdir(projectDir);
    return files
      .filter((f) => f.endsWith(".jsonl"))
      .map((f) => ({
        id: f.replace(".jsonl", ""),
        summary: f.replace(".jsonl", ""),
      }));
  } catch (e) {
    return [];
  }
}

module.exports = { getGeminiProjects, getGeminiSessions };
```

- [ ] **Step 2: Commit**

```bash
git add src/gemini-discovery.js
git commit -m "feat(backend): add discovery logic for gemini projects and sessions"
```

---

### Task 3: WebSocket & REST API Integration

**Files:**

- Create: `src/ws-gemini.js`
- Modify: `server.js`

- [ ] **Step 1: Create WebSocket handler**
      Follow the pattern of `src/ws-agent.js`.

```javascript
const bridge = require("./gemini-bridge");

function setupGeminiWebSocket(geminiWss) {
  geminiWss.on("connection", (ws, req) => {
    // Simple auth check
    const authKey = process.env.AUTH_KEY || "";
    const url = new URL(req.url, "http://localhost");
    if (authKey && url.searchParams.get("auth_key") !== authKey) {
      ws.close(4401, "Unauthorized");
      return;
    }

    ws.on("message", async (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "gemini-command") {
        const proc = await bridge.spawn(msg.options);
        proc.stdout.on("data", (data) =>
          ws.send(JSON.stringify({ type: "response", text: data.toString() })),
        );
        proc.stderr.on("data", (data) =>
          ws.send(JSON.stringify({ type: "log", message: data.toString() })),
        );
        proc.on("close", () => ws.send(JSON.stringify({ type: "complete" })));
      }
    });
  });
}
module.exports = { setupGeminiWebSocket };
```

- [ ] **Step 2: Update `server.js` to register the new WS and routes**
      Inject `geminiWss` and routes for projects/sessions.

- [ ] **Step 3: Commit**

```bash
git add src/ws-gemini.js server.js
git commit -m "feat(backend): integrate gemini websocket and api routes"
```

---

### Task 4: Frontend "Gemini" View

**Files:**

- Create: `frontend/components/gemini-view.tsx`
- Create: `frontend/lib/gemini-api.ts`

- [ ] **Step 1: Create API client**
      Helper functions to fetch projects and talk to the WebSocket.

- [ ] **Step 2: Create the Gemini View component**
      Reuse `ChatArea` and `MarkdownRenderer` for consistency.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/gemini-view.tsx frontend/lib/gemini-api.ts
git commit -m "feat(frontend): add gemini view and api integration"
```

---

### Task 5: Sidebar & Main Page Orchestration

**Files:**

- Modify: `frontend/components/app-sidebar.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Update Sidebar**
      Add the **Bot 🤖** icon and navigation logic.

- [ ] **Step 2: Update Main Page**
      Add `showGemini` state and conditional rendering.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/app-sidebar.tsx frontend/app/page.tsx
git commit -m "feat(frontend): add gemini navigation to sidebar and main page"
```
