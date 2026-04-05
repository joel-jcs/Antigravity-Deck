# 🤖 Gemini CLI Integration Design Spec — Antigravity Deck

**Date:** 2026-04-04
**Topic:** Integrating Gemini CLI UI functionality into Antigravity Deck for a unified mobile experience.

---

## 🎯 Goal

Unify the **Gemini CLI** into the **Antigravity Deck** dashboard. This will allow the user to manage Gemini projects and sessions from the same mobile-responsive interface they use for Antigravity, while keeping all credentials and CLI processing on their local PC.

## 📐 Architecture

### 1. Backend Bridge (`src/gemini-bridge.js`)

A new module that wraps the `gemini` CLI subprocess.

- **Discovery**: Locate the `gemini` executable via PowerShell (Windows) or standard PATH (macOS/Linux).
- **Execution**: Spawn the CLI using `child_process.spawn`.
- **Command Handling**: Support flags: `--resume [sessionId]`, `--prompt [message]`, `--model [model]`, and `--yolo`.
- **Output Parsing**:
  - Detect `Session ID` from the initial output.
  - Filter out debug logs, system warnings, and "Loaded cached credentials" messages.
  - Stream filtered output via the WebSocket.
- **Session Discovery**: Replicate logic to scan `~/.gemini/projects` and `~/.gemini/tmp` to pull in existing conversation history.

### 2. WebSocket Handler (`src/ws-gemini.js`)

A dedicated WebSocket server for Gemini communication.

- **Path**: `/ws/gemini`
- **Routing**: Updated `server.js` `upgrade` handler to route `/ws/gemini` to `geminiWss`.
- **Authentication**: Reuse the existing `AUTH_KEY` logic from the Deck.
- **Message Types**:
  - `gemini-command`: Start or continue a session.
  - `abort-session`: Force-kill a running Gemini CLI process.
  - `gemini-response`: Streamed message chunks.
  - `session-created`: Notifies the frontend of the new/resumed Session ID.
  - `gemini-complete`: Signals process exit.

### 3. Frontend UI (`frontend/`)

#### Sidebar (`AppSidebar.tsx`)

- **Icon**: **Bot 🤖** from `lucide-react`.
- **Label**: "Gemini".
- **Dynamic Grouping**: When the Gemini view is active, the "Active Workspaces" group is replaced with "Gemini Projects".
- **Project Items**: List projects and their recent sessions as expandable groups (identical to the Antigravity workspace style).

#### Main View (`page.tsx` & `GeminiView.tsx`)

- **State Management**:
  - `activeGeminiProject`: Tracks the current project.
  - `activeGeminiSession`: Tracks the current session ID.
  - `showGemini`: Boolean flag to show the Gemini view.
- **Layout**:
  - Reuses `ChatView` for the chat bubble interface.
  - Reuses `MarkdownRenderer` for syntax-highlighted code blocks.
- **Persistence**: Store current Gemini project/session in `localStorage` to survive page refreshes or mobile closure.

## 🩹 Recovery & Error Handling

- **CLI Missing**: If the `gemini` CLI is not found, display a helpful error message with installation instructions.
- **Crashes**: Ensure `gemini-bridge.js` gracefully kills stale processes on backend restart.
- **Timeout**: Implement a 30s timeout if the CLI doesn't start producing output.

## 🧪 Verification Plan

1.  **Backend**: Verify `node src/gemini-bridge.js` can successfully spawn a CLI session and return output.
2.  **WebSocket**: Use `wscat` or similar tool to connect to `/ws/gemini` and send a command.
3.  **UI**: Verify clicking the "Gemini" sidebar item opens the view and correctly lists projects from `~/.gemini/`.
4.  **Mobile**: Access the dashboard via Cloudflare Tunnel on a mobile device and verify the chat input works smoothly with the keyboard.

---

## ✅ Spec Self-Review

- **Placeholder scan:** No TBDs. Success criteria are defined.
- **Internal consistency:** WebSocket path matches routing logic.
- **Scope check:** Focused exclusively on the Gemini Chat interface (Approach 1 from brainstorming).
- **Ambiguity check:** Icon and UI placement are explicit.
