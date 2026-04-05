PS C:\Users\joelj\source\repos\personal\Antigravity-Deck>   All processes stopped.
                                                          npm run prod

> antigravity-deck@1.0.0 prod
> node start-tunnel.js --local


  🚀 Antigravity Deck — Starting (production)

[*] ✅ Frontend already built (use --build to force rebuild)
[*] Starting backend on port 9807...
[BE] ◇ injecting env (3) from .env // tip: ⌘ custom filepath { path: '/custom/path/.env' }
[BE] 🔒 Auth enabled (key length: 16)
[BE] 💬 Antigravity Deck (API) running at http://localhost:9807
[BE] [Push] VAPID keys loaded from settings
[BE] [*] Detecting Language Server on win32...
[*] Starting frontend on port 9808...
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [~] PID 32724: found 15 candidate port(s): 50316, 50889, 50890, 56354, 56482, 59646, 59647, 59654, 59655, 59656, 60475, 61179, 61624, 62843, 64564
[BE] [~] Probing port 50316 (4 strategies)...
[BE] [~] Port 50316 HTTPS/IPv4: ECONNREFUSED
[BE] [~] Port 50316 HTTP/localhost: ECONNREFUSED
[BE] [~] Port 50316 HTTPS/IPv6: ECONNREFUSED
[BE] [~] Port 50316 HTTP/IPv6: ECONNREFUSED
[BE] [~] Probing port 50889 (4 strategies)...
[BE] [~] Port 50889 HTTPS/IPv4: ECONNREFUSED
[BE] [~] Port 50889 HTTP/localhost: ECONNREFUSED
[BE] [~] Port 50889 HTTPS/IPv6: ECONNREFUSED
[BE] [~] Port 50889 HTTP/IPv6: ECONNREFUSED
[BE] [~] Probing port 50890 (4 strategies)...
[BE] [~] Port 50890 HTTPS/IPv4: ECONNREFUSED
[BE] [~] Port 50890 HTTP/localhost: ECONNREFUSED
[BE] [~] Port 50890 HTTPS/IPv6: ECONNREFUSED
[BE] [~] Port 50890 HTTP/IPv6: ECONNREFUSED
[BE] [~] Probing port 56354 (4 strategies)...
[BE] [~] Port 56354 HTTPS/IPv4: ECONNREFUSED
[BE] [~] Port 56354 HTTP/localhost: ECONNREFUSED
[BE] [~] Port 56354 HTTPS/IPv6: ECONNREFUSED
[BE] [~] Port 56354 HTTP/IPv6: ECONNREFUSED
[BE] [~] Probing port 56482 (4 strategies)...
[BE] [~] Port 56482 HTTPS/IPv4: ECONNREFUSED
[BE] [~] Port 56482 HTTP/localhost: ECONNREFUSED
[BE] [~] Port 56482 HTTPS/IPv6: ECONNREFUSED
[BE] [~] Port 56482 HTTP/IPv6: ECONNREFUSED
[BE] [~] Probing port 59646 (4 strategies)...
[BE] [✓] API on port 59646 (HTTPS/IPv4)
[BE] [✓] Switched to: Antigravity-Deck (PID: 32724, Port: 59646)
[BE] [*] Polling every 3s (global — all running conversations)
[BE] [*] Resource monitor started (interval: 5s, CPUs: 16, RAM: 32406MB)
[FE] ⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
[FE] We detected multiple lockfiles and selected the directory of C:\Users\joelj\source\repos\personal\package-lock.json as the root directory.
[FE] To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
[FE] See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.       
[FE] Detected additional lockfiles:
[FE] * C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\package-lock.json
[FE] * C:\Users\joelj\source\repos\personal\Antigravity-Deck\package-lock.json
[FE] > Frontend ready on http://localhost:9808 (BE proxy → :9807)

============================================================
  ✅ READY!
============================================================
  Backend:  http://localhost:9807
  Frontend: http://localhost:9808
============================================================

  Press Ctrl+C to stop

[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [WS] subscribe_all — global viewers: 1
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Loading 8c4c3494 (stepCount: 13, batches: 1)...
[BE] [✓] Cached 13/13 steps (window from 0)
[FE] (node:35328) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
[FE] (Use `node --trace-deprecation ...` to show where the warning was created)
[BE] [*] Poll rate → 5s (IDLE)
[BE] [poll] New conversations discovered → notifying frontend
[BE] [*] Loading 0eae1802 (stepCount: 43, batches: 1)...
[BE] [✓] Cached 43/43 steps (window from 0)
[BE] [*] Loading 169b3abe (stepCount: 771, batches: 4)...
[BE] [✓] Cached 500/771 steps (window from 271)
[BE] [BE] Upgrade request for /ws/orchestrator (From: ::ffff:127.0.0.1)
[BE] [WS-Orchestrator] New connection bc493616-6b82-4c44-b1a8-5b827e5953f4
[BE] [*] Loading 32a66c5d (stepCount: 162, batches: 1)...
[BE] [✓] Cached 162/162 steps (window from 0)
[BE] [*] Loading 3372946c (stepCount: 295, batches: 2)...
[BE] [✓] Cached 295/295 steps (window from 0)
[BE] [*] Loading 34223914 (stepCount: 190, batches: 1)...
[BE] [✓] Cached 190/190 steps (window from 0)
[BE] [*] Loading 4ebb4a21 (stepCount: 74, batches: 1)...
[BE] [✓] Cached 74/74 steps (window from 0)
[BE] [*] Loading 6a426390 (stepCount: 297, batches: 2)...
[BE] [✓] Cached 297/297 steps (window from 0)
[BE] [*] Loading 6a655307 (stepCount: 74, batches: 1)...
[BE] [✓] Cached 74/74 steps (window from 0)
[BE] [*] Loading 9fa05ff0 (stepCount: 55, batches: 1)...
[BE] [✓] Cached 55/55 steps (window from 0)
[BE] [*] Loading a772c830 (stepCount: 120, batches: 1)...
[BE] [✓] Cached 120/120 steps (window from 0)
[BE] [*] Loading b28a94de (stepCount: 334, batches: 2)...
[BE] [✓] Cached 334/334 steps (window from 0)
[BE] [*] Loading c1aee4e0 (stepCount: 364, batches: 2)...
[BE] [✓] Cached 364/364 steps (window from 0)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for /ws/gemini (From: ::ffff:127.0.0.1)
[BE] [WS-Gemini] New connection attempt from ::ffff:127.0.0.1
[BE] [WS-Gemini] Connection authorized
[BE] [BE] 🔚 Socket ended (/ws/gemini)
[BE] [WS-Gemini] Connection closed
[BE] [BE] 📦 Socket closed (/ws/gemini)
[BE] [BE] Upgrade request for /ws/gemini (From: ::ffff:127.0.0.1)
[BE] [WS-Gemini] New connection attempt from ::ffff:127.0.0.1
[BE] [WS-Gemini] Connection authorized
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [WS-Gemini] Message received: gemini-command
[BE] [WS-Gemini] Spawning command for prompt: "say hello back..."
[BE] [Gemini Bridge] Spawning: gemini --resume a4a39365-7209-4d05-aacc-d6ea9e231771 --model gemini-3-flash-preview --prompt say hello back --yolo --output-format text
[BE] [Gemini Bridge] Resuming session: a4a39365-7209-4d05-aacc-d6ea9e231771
[BE] [Gemini CLI Log] Cannot use both a positional prompt and the --prompt (-p) flag together
[BE] [Gemini CLI Log] Usage: gemini [options] [command]
[BE] Gemini CLI - Defaults to interactive mode. Use -p/--prompt for non-interactive (headless) mode.
[BE] Commands:
[BE] gemini mcp                   Manage MCP servers
[BE] gemini extensions <command>  Manage Gemini CLI extensions.  [aliases: extension]
[BE] gemini skills <command>      Manage agent skills.  [aliases: skill]
[BE] gemini hooks <command>       Manage Gemini CLI hooks.  [aliases: hook]
[BE] gemini [query..]             Launch Gemini CLI  [default]
[BE] Positionals:
[BE] query  Initial prompt. Runs in interactive mode by default; use -p/--prompt for non-interactive.
[BE] Options:
[BE] -d, --debug                     Run in debug mode (open debug console with F12)  [boolean] [default: false]
[BE] -m, --model                     Model  [string]
[BE] -p, --prompt                    Run in non-interactive (headless) mode with the given prompt. Appended to input on stdin (if any).  [string]
[BE] -i, --prompt-interactive        Execute the provided prompt and continue in interactive mode  [string]
[BE] -w, --worktree                  Start Gemini in a new git worktree. If no name is provided, one is generated automatically.  [string]
[BE] -s, --sandbox                   Run in sandbox?  [boolean]
[BE] -y, --yolo                      Automatically accept all actions (aka YOLO mode, see https://www.youtube.com/watch?v=xvFZjo5PgG0 for more details)?  [boolean] [default: false]
[BE] --approval-mode             Set the approval mode: default (prompt for approval), auto_edit (auto-approve edit tools), yolo (auto-approve all tools), plan (read-only mode)  [string] [choices: "default", "auto_edit", "yolo", "plan"]
[BE] --policy                    Additional policy files or directories to load (comma-separated or multiple --policy)  [array]
[BE] --admin-policy              Additional admin policy files or directories to load (comma-separated or multiple --admin-policy)  [array]
[BE] --acp                       Starts the agent in ACP mode  [boolean]
[BE] --experimental-acp          Starts the agent in ACP mode (deprecated, use --acp instead)  [boolean]
[BE] --allowed-mcp-server-names  Allowed MCP server names  [array]
[BE] --allowed-tools             [DEPRECATED: Use Policy Engine instead See https://geminicli.com/docs/core/policy-engine] Tools that are allowed to run without confirmation  [array]
[BE] -e, --extensions                A list of extensions to use. If not provided, all extensions are used.  [array]
[BE] -l, --list-extensions           List all available extensions and exit.  [boolean]
[BE] -r, --resume                    Resume a previous session. Use "latest" for most recent or index number (e.g. --resume 5)  [string]
[BE] --list-sessions             List available sessions for the current project and exit.  [boolean]
[BE] --delete-session            Delete a session by index number (use --list-sessions to see available sessions).  [string]  
[BE] --include-directories       Additional directories to include in the workspace (comma-separated or multiple --include-directories)  [array]
[BE] --screen-reader             Enable screen reader mode for accessibility.  [boolean]
[BE] -o, --output-format             The format of the CLI output.  [string] [choices: "text", "json", "stream-json"]
[BE] --raw-output                Disable sanitization of model output (e.g. allow ANSI escape sequences). WARNING: This can be a security risk if the model output is untrusted.  [boolean]
[BE] --accept-raw-output-risk    Suppress the security warning when using --raw-output.  [boolean]
[BE] -v, --version                   Show version number  [boolean]
[BE] -h, --help                      Show help  [boolean]
[BE] [Gemini Bridge] Process exited with code 1
[BE] [WS-Gemini] Process closed with code 1
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] 🔚 Socket ended (/ws/gemini)
[BE] [WS-Gemini] Connection closed
[BE] [BE] 📦 Socket closed (/ws/gemini)
[BE] [BE] Upgrade request for /ws/gemini (From: ::ffff:127.0.0.1)
[BE] [WS-Gemini] New connection attempt from ::ffff:127.0.0.1
[BE] [WS-Gemini] Connection authorized
[BE] [BE] 🔚 Socket ended (/ws/gemini)
[BE] [WS-Gemini] Connection closed
[BE] [BE] 📦 Socket closed (/ws/gemini)
[BE] [BE] Upgrade request for /ws/gemini (From: ::ffff:127.0.0.1)
[BE] [WS-Gemini] New connection attempt from ::ffff:127.0.0.1
[BE] [WS-Gemini] Connection authorized
[BE] [BE] 🔚 Socket ended (/ws/gemini)
[BE] [WS-Gemini] Connection closed
[BE] [BE] 📦 Socket closed (/ws/gemini)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Poll rate → 1s (ACTIVE)
[BE] [poll] 8c4c3494: cached=13 server=19 status=CASCADE_RUN_STATUS_RUNNING
[BE] [WS] broadcast steps_new: 6 steps for 8c4c3494 (total: 19)
[BE] [poll] 0 updated, 6 new (19/19)
[BE] [poll] 1 updated, 0 new (19/19)
[BE] [poll] 1 updated, 0 new (19/19)
[BE] [poll] 1 updated, 0 new (19/19)
[BE] [*] Poll rate → 5s (IDLE)
[BE] [post-done] 8c4c3494 cache invalidated
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Loading 8c4c3494 (stepCount: 19, batches: 1)...
[BE] [✓] Cached 19/19 steps (window from 0)
[BE] [Push] Sent: 1/1, Failed: 0 — ✅ Stabilizing Remote WebSocket Connectivity
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for /ws/orchestrator (From: ::ffff:127.0.0.1)
[BE] [WS-Orchestrator] New connection 8d5ee976-1c39-45f6-89e6-373aa7a212b5
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] 🔚 Socket ended (/ws/orchestrator)
[BE] [WS-Orchestrator] Connection closed — cleaning up subscriptions
[BE] [BE] 📦 Socket closed (/ws/orchestrator)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for /ws/orchestrator (From: ::ffff:127.0.0.1)
[BE] [WS-Orchestrator] New connection 191cbd89-c975-4f60-8558-b5c0d2db5c72
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] 🔚 Socket ended (/ws/orchestrator)
[BE] [WS-Orchestrator] Connection closed — cleaning up subscriptions
[BE] [BE] 📦 Socket closed (/ws/orchestrator)
[BE] [WS] set_conversation → 8c4c3494, clients: 1
[BE] [BE] 🔚 Socket ended (/ws/orchestrator)
[BE] [WS-Orchestrator] Connection closed — cleaning up subscriptions
[BE] [BE] 📦 Socket closed (/ws/orchestrator)
[BE] [BE] 🔚 Socket ended (/)
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for /ws/orchestrator (From: ::ffff:127.0.0.1)
[BE] [WS-Orchestrator] New connection f4c085bf-8126-480a-baec-982d7dc9dd2f
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [*] Found 1 language server instance(s)
[BE] PID: 32724, CSRF: 98867191..., workspace: file_c_3A_Users_joelj_source_repos_personal_Antigravity_Deck
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
[BE] [BE] Upgrade request for / (From: ::ffff:127.0.0.1)
[BE] [BE] Forwarding / upgrade to main UI WebSocket
[BE] [WS-UI] Connection from ::ffff:127.0.0.1 (isLocal: true)
[BE] [WS-UI] Bypassing auth for local connection
[BE] [BE] ❌ Socket error (/): write ECONNABORTED
[BE] [BE] 📦 Socket closed (/)
