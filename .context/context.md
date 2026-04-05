PS C:\Users\joelj\source\repos\personal\Antigravity-Deck> npm run lint --prefix frontend

> frontend@0.1.0 lint
> eslint

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\app\page.tsx
3:53 warning 'useRef' is defined but never used @typescript-eslint/no-unused-vars
6:10 warning 'extractStepContent' is defined but never used @typescript-eslint/no-unused-vars
9:10 warning 'Switch' is defined but never used @typescript-eslint/no-unused-vars
11:3 warning 'MoreVertical' is defined but never used @typescript-eslint/no-unused-vars
12:3 warning 'BarChart2' is defined but never used @typescript-eslint/no-unused-vars
13:3 warning 'Download' is defined but never used @typescript-eslint/no-unused-vars
14:3 warning 'Bell' is defined but never used @typescript-eslint/no-unused-vars
15:3 warning 'BellOff' is defined but never used @typescript-eslint/no-unused-vars
31:3 warning 'DropdownMenu' is defined but never used @typescript-eslint/no-unused-vars
32:3 warning 'DropdownMenuContent' is defined but never used @typescript-eslint/no-unused-vars
33:3 warning 'DropdownMenuItem' is defined but never used @typescript-eslint/no-unused-vars
34:3 warning 'DropdownMenuSeparator' is defined but never used @typescript-eslint/no-unused-vars
35:3 warning 'DropdownMenuTrigger' is defined but never used @typescript-eslint/no-unused-vars
144:5 warning 'stepContentVersion' is assigned a value but never used @typescript-eslint/no-unused-vars
190:10 warning 'sidebarOpen' is assigned a value but never used @typescript-eslint/no-unused-vars
191:10 warning 'sidebarClosing' is assigned a value but never used @typescript-eslint/no-unused-vars
193:9 warning 'handleCloseSidebar' is assigned a value but never used @typescript-eslint/no-unused-vars
320:26 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any
496:23 warning '\_wsName' is defined but never used @typescript-eslint/no-unused-vars
512:9 warning 'handleCopyId' is assigned a value but never used @typescript-eslint/no-unused-vars
963:18 error 'SourceControlView' is not defined react/jsx-no-undef  
 1101:25 warning 'root' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-bridge-view.tsx  
 12:10 warning 'Card' is defined but never used @typescript-eslint/no-unused-vars  
 12:16 warning 'CardContent' is defined but never used @typescript-eslint/no-unused-vars  
 12:29 warning 'CardHeader' is defined but never used @typescript-eslint/no-unused-vars  
 12:41 warning 'CardTitle' is defined but never used @typescript-eslint/no-unused-vars  
 12:52 warning 'CardDescription' is defined but never used @typescript-eslint/no-unused-vars  
 16:36 warning 'ChevronDown' is defined but never used @typescript-eslint/no-unused-vars  
 16:49 warning 'ChevronUp' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\chat-panel.tsx  
 8:10 warning 'ScrollArea' is defined but never used @typescript-eslint/no-unused-vars  
 10:11 warning 'WifiOff' is defined but never used @typescript-eslint/no-unused-vars  
 15:10 warning 'SESSION_STATE_CONFIG' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\config-panel.tsx  
 12:18 warning 'Loader2' is defined but never used @typescript-eslint/no-unused-vars
12:27 warning 'AlertCircle' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\connect-panel.tsx  
 6:10 warning 'Button' is defined but never used @typescript-eslint/no-unused-vars
11:15 warning 'Code2' is defined but never used @typescript-eslint/no-unused-vars
11:22 warning 'Unplug' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\orchestrator-panel.tsx
38:42 warning React Hook useEffect has a missing dependency: 'orch'. Either include it or remove the dependency array react-hooks/exhaustive-deps
54:8 warning React Hook useEffect has a missing dependency: 'internalWorkspace'. Either include it or remove the dependency array react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\sessions-panel.tsx
10:50 warning 'formatTimestamp' is defined but never used

                                                                    @typescript-eslint/no-unused-vars

37:21 error Error: Cannot call impure function during render

`Date.now` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-hub\sessions-panel.tsx:37:21
35 | }
36 |

> 37 | const elapsed = Date.now() - session.lastActivity;

     |                     ^^^^^^^^^^ Cannot call impure function

38 | const relativeTime = elapsed < 60000 ? 'just now'
39 | : elapsed < 3600000 ? `${Math.floor(elapsed / 60000)}m ago`
40 | : `${Math.floor(elapsed / 3600000)}h ago`; react-hooks/purity

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-logs-view.tsx
411:9 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\agent-logs-view.tsx:411:9  
 409 | const offClose = wsService.on('\_\_ws_close', () => setWsStatus('disconnected'));  
 410 | // Set initial status

> 411 | setWsStatus(wsService.connected ? 'connected' : 'connecting');

      |         ^^^^^^^^^^^ Avoid calling setState() directly within an effect

412 |
413 | // Listen to ALL messages for live logging
414 | const offAll = wsService.onAll((data) => { react-hooks/set-state-in-effect
434:30 error Unexpected any. Specify a different type

                                                                                              @typescript-eslint/no-explicit-any

434:53 error Unexpected any. Specify a different type

                                                                                              @typescript-eslint/no-explicit-any

450:44 error Unexpected any. Specify a different type

                                                                                              @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\app-sidebar.tsx
11:3 warning 'Workspace' is defined but never used @typescript-eslint/no-unused-vars  
 13:3 warning 'WorkspaceResources' is defined but never used @typescript-eslint/no-unused-vars  
 38:3 warning 'SidebarGroupAction' is defined but never used @typescript-eslint/no-unused-vars  
 120:3 warning 'onShowOrchestrator' is defined but never used @typescript-eslint/no-unused-vars  
 127:3 warning 'activeWorkspace' is defined but never used @typescript-eslint/no-unused-vars  
 225:42 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\cascade-panel.tsx
151:8 warning React Hook useCallback has a missing dependency: 'selectedModelId'. Either include it or remove the dependency array react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat-area.tsx
67:37 warning 'searchQuery' is defined but never used @typescript-eslint/no-unused-vars  
 102:39 warning 'searchQuery' is defined but never used @typescript-eslint/no-unused-vars  
 137:47 warning 'searchQuery' is defined but never used @typescript-eslint/no-unused-vars  
 222:48 warning 'activeFilters' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat-view.tsx
5:30 warning 'getStepConfig' is defined but never used

                                                                                              @typescript-eslint/no-unused-vars

81:50 warning 'stepCount' is assigned a value but never used

                                                                                              @typescript-eslint/no-unused-vars

100:12 warning 'showWsPicker' is assigned a value but never used

                                                                                              @typescript-eslint/no-unused-vars

101:12 warning 'showModelPicker' is assigned a value but never used

                                                                                              @typescript-eslint/no-unused-vars

258:8 warning React Hook useEffect has a missing dependency: 'selectedModel'. Either include it or remove the dependency array  
 react-hooks/exhaustive-deps
270:13 warning Expected an assignment or function call and instead saw an expression

                                                                                              @typescript-eslint/no-unused-expressions

335:8 warning React Hook useCallback has a missing dependency: 'currentWorkspace'. Either include it or remove the dependency array  
 react-hooks/exhaustive-deps
420:11 warning 'handleInteract' is assigned a value but never used

                                                                                              @typescript-eslint/no-unused-vars

779:45 warning Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\agent-response.tsx  
 2:35 warning 'useEffect' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\chat-helpers.ts
2:10 warning 'extractStepContent' is defined but never used @typescript-eslint/no-unused-vars  
 2:30 warning 'getStepConfig' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\code-change-viewer.tsx  
 72:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\generated-image-step.tsx
31:9 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\generated-image-step.tsx:31:9
29 | if (!uri) return;
30 | let cancelled = false;

> 31 | setLoading(true);

     |         ^^^^^^^^^^ Avoid calling setState() directly within an effect

32 | setImageError(false);
33 | setImageSrc('');
34 | fetch(`${API_BASE}/api/file/serve`, { react-hooks/set-state-in-effect
82:29 warning Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

                                                                                             @next/next/no-img-element

148:21 warning Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

                                                                                             @next/next/no-img-element

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\user-message.tsx  
 17:37 error Unexpected any. Specify a different type

                                                                                             @typescript-eslint/no-explicit-any

19:63 error Unexpected any. Specify a different type

                                                                                             @typescript-eslint/no-explicit-any

22:28 error Unexpected any. Specify a different type

                                                                                             @typescript-eslint/no-explicit-any

33:25 error Unexpected any. Specify a different type

                                                                                             @typescript-eslint/no-explicit-any

48:29 warning Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element @next/next/no-img-element

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\chat\waiting-step.tsx  
 5:10 warning 'cn' is defined but never used @typescript-eslint/no-unused-vars  
 59:11 warning 'toolName' is assigned a value but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\conversation-list.tsx  
 43:39 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\gemini-view.tsx
6:3 warning 'Plus' is defined but never used

                                     @typescript-eslint/no-unused-vars

7:3 warning 'ChevronRight' is defined but never used

                                     @typescript-eslint/no-unused-vars

10:3 warning 'MessageSquare' is defined but never used

                                     @typescript-eslint/no-unused-vars

16:10 warning 'API_BASE' is defined but never used

                                     @typescript-eslint/no-unused-vars

17:10 warning 'authHeaders' is defined but never used

                                     @typescript-eslint/no-unused-vars

30:10 warning 'projects' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

31:10 warning 'sessions' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

32:25 warning 'setActiveProject' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

33:25 warning 'setActiveSession' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

38:10 warning 'loading' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

38:19 warning 'setLoading' is assigned a value but never used

                                     @typescript-eslint/no-unused-vars

60:7 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\gemini-view.tsx:60:7
58 | getGeminiSessions(activeProject).then(setSessions).catch(console.error);
59 | } else {

> 60 | setSessions([]);

     |       ^^^^^^^^^^^ Avoid calling setState() directly within an effect

61 | }
62 | }, [activeProject]);
63 | react-hooks/set-state-in-effect
91:5 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\gemini-view.tsx:91:5
89 | };
90 |

> 91 | setWs(socket);

     |     ^^^^^ Avoid calling setState() directly within an effect

92 | return () => socket.close();
93 | }, []);
94 | react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\markdown-renderer.tsx  
 63:9 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\markdown-renderer.tsx:63:9  
 61 |
62 | useEffect(() => {

> 63 | setContent(null);

     |         ^^^^^^^^^^ Avoid calling setState() directly within an effect

64 | setError(null);
65 | fetch(`${API_BASE}/api/file/read`, {
66 | method: 'POST', react-hooks/set-state-in-effect
220:37 error Unexpected any. Specify a different type

                                              @typescript-eslint/no-explicit-any

233:33 error Unexpected any. Specify a different type

                                              @typescript-eslint/no-explicit-any

235:16 warning Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element

                                              @next/next/no-img-element

237:23 error Unexpected any. Specify a different type

                                              @typescript-eslint/no-explicit-any

240:45 error Unexpected any. Specify a different type

                                              @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\orchestrator-chat\orchestrator-progress-message.tsx
13:107 warning 'onClarify' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\orchestrator-view.tsx  
 10:10 warning 'Card' is defined but never used  
 @typescript-eslint/no-unused-vars
10:16 warning 'CardContent' is defined but never used  
 @typescript-eslint/no-unused-vars
12:31 warning 'ChevronDown' is defined but never used  
 @typescript-eslint/no-unused-vars
12:44 warning 'ChevronUp' is defined but never used  
 @typescript-eslint/no-unused-vars
27:42 warning React Hook useEffect has a missing dependency: 'orch'. Either include it or remove the dependency array react-hooks/exhaustive-deps
33:71 warning React Hook useEffect has a missing dependency: 'orch'. Either include it or remove the dependency array react-hooks/exhaustive-deps
50:8 warning React Hook useEffect has a missing dependency: 'workspace'. Either include it or remove the dependency array react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\profile-switcher.tsx
75:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any  
 91:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any  
 101:19 warning 'result' is assigned a value but never used @typescript-eslint/no-unused-vars  
 107:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any  
 127:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any  
 138:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\resource-monitor-view.tsx  
 5:33 warning 'SystemResources' is defined but never used

                                                  @typescript-eslint/no-unused-vars
    5:70  warning  'ResourceHistoryPoint' is defined but never used

                                                  @typescript-eslint/no-unused-vars
    5:92  warning  'SelfStats' is defined but never used

                                                  @typescript-eslint/no-unused-vars
    6:15  warning  'MemoryStick' is defined but never used

                                                  @typescript-eslint/no-unused-vars

236:11 warning The 'workspaces' logical expression could make the dependencies of useMemo Hook (at line 240) change on every render. Move it inside the useMemo callback. Alternatively, wrap the initialization of 'workspaces' in its own useMemo() Hook react-hooks/exhaustive-deps
237:11 warning The 'historyData' logical expression could make the dependencies of useMemo Hook (at line 253) change on every render. To fix this, wrap the initialization of 'historyData' in its own useMemo() Hook react-hooks/exhaustive-deps
237:11 warning The 'historyData' logical expression could make the dependencies of useMemo Hook (at line 254) change on every render. To fix this, wrap the initialization of 'historyData' in its own useMemo() Hook react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\settings-view.tsx
24:10 warning 'Slider' is defined but never used @typescript-eslint/no-unused-vars
314:62 error `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` react/no-unescaped-entities
362:145 error `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` react/no-unescaped-entities
362:168 error `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` react/no-unescaped-entities
362:187 error `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` react/no-unescaped-entities

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\sidebar\workspace-group.tsx  
 54:5 warning 'arrayIdx' is defined but never used @typescript-eslint/no-unused-vars
57:5 warning 'showActiveIndicator' is assigned a value but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\source-control-view.tsx  
 2:50 warning 'useRef' is defined but never used

                                           @typescript-eslint/no-unused-vars

318:21 error Unexpected any. Specify a different type

                                           @typescript-eslint/no-explicit-any

334:21 error Unexpected any. Specify a different type

                                           @typescript-eslint/no-explicit-any

544:21 error Unexpected any. Specify a different type

                                           @typescript-eslint/no-explicit-any

566:21 error Unexpected any. Specify a different type

                                           @typescript-eslint/no-explicit-any

878:10 warning 'CurrentFileView' is defined but never used

                                           @typescript-eslint/no-unused-vars

884:9 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\source-control-view.tsx:884:9
882 |
883 | useEffect(() => {

> 884 | setLoading(true); setError(null); setContent(null);

      |         ^^^^^^^^^^ Avoid calling setState() directly within an effect

885 | getWorkspaceFile(workspace, filePath)
886 | .then(data => {
887 | if (data.error && data.content === null) setError(data.error); react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\token-usage.tsx
18:27 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\token-usage.tsx:18:27  
 16 |
17 | useEffect(() => {

> 18 | if (!cascadeId) { setData(null); return; }

     |                           ^^^^^^^ Avoid calling setState() directly within an effect

19 | fetch(`${API_BASE}/api/cascade/${cascadeId}/metadata`, { headers: authHeaders() })  
 20 | .then(r => r.json())
21 | .then(raw => { react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\ui\sidebar.tsx
618:26 error Error: Cannot call impure function during render

`Math.random` is an impure function. Calling an impure function can produce unstable results that update unpredictably when the component happens to re-render. (https://react.dev/reference/rules/components-and-hooks-must-be-pure#components-and-hooks-must-be-idempotent).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\ui\sidebar.tsx:618:26  
 616 | // Random width between 50 to 90%.
617 | const width = React.useMemo(() => {

> 618 | return `${Math.floor(Math.random() * 40) + 50}%`

      |                          ^^^^^^^^^^^^^ Cannot call impure function

619 | }, [])
620 |
621 | return ( react-hooks/purity

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\user-profile.tsx
14:38 error Unexpected any. Specify a different type  
 @typescript-eslint/no-explicit-any
31:11 warning 'pct' is assigned a value but never used  
 @typescript-eslint/no-unused-vars
82:38 error Unexpected any. Specify a different type  
 @typescript-eslint/no-explicit-any
134:83 warning React Hook useMemo has an unnecessary dependency: 'now'. Either exclude it or remove the dependency array react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\workflow-autocomplete.tsx  
 3:39 warning 'useCallback' is defined but never used

                                                                                                   @typescript-eslint/no-unused-vars

34:27 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\workflow-autocomplete.tsx:34:27
32 |
33 | // Reset selection when query changes

> 34 | useEffect(() => { setSelectedIdx(0); }, [query]);

     |                           ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect

35 |
36 | // Scroll selected item into view
37 | useEffect(() => { react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\components\workspace-onboard-modal.tsx  
 37:21 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-agent-ws.ts
211:29 error Error: Cannot access variable before it is declared

`attemptConnect` is accessed before it is declared, which prevents the earlier access from updating when this value changes over time.

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-agent-ws.ts:211:29
209 | retryTimerRef.current = setTimeout(() => {
210 | if (mountedRef.current && workspaceRef.current) {

> 211 | attemptConnect(workspaceRef.current);

      |                             ^^^^^^^^^^^^^^ `attemptConnect` accessed before it is declared

212 | }
213 | }, delay);
214 | addSystemMessage(`Connection lost. Reconnecting (${retryCountRef.current}/${MAX_RETRIES})...`);

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-agent-ws.ts:175:5
173 | }, [addMessage, addSystemMessage]);
174 |

> 175 | const attemptConnect = useCallback(async (ws_workspace: string) => {

      |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

> 176 | try {

      | ^^^^^^^^^^^^^

> 177 | const agentUrl = await getAgentWsUrl();

      …
      | ^^^^^^^^^^^^^

> 226 | }

      | ^^^^^^^^^^^^^

> 227 | }, [handleMessage, addSystemMessage]);

      | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ `attemptConnect` is declared here

228 |
229 | const connect = useCallback(async (ws_workspace: string) => {
230 | // Clean up existing connection react-hooks/immutability

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-orchestrator-ws.ts
345:49 error Error: Cannot access variable before it is declared

`attemptConnect` is accessed before it is declared, which prevents the earlier access from updating when this value changes over time.

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-orchestrator-ws.ts:345:49  
 343 | retryRef.current++;
344 | retryTimerRef.current = setTimeout(() => {

> 345 | if (mountedRef.current) attemptConnect();

      |                                                 ^^^^^^^^^^^^^^ `attemptConnect` accessed before it is declared

346 | }, delay);
347 | return 'reconnecting';
348 | });

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-orchestrator-ws.ts:313:5  
 311 | }, [addLog]);
312 |

> 313 | const attemptConnect = useCallback(async () => {

      |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

> 314 | try {

      | ^^^^^^^^^^^^^

> 315 | const wsUrl = await getOrchestratorWsUrl();

      …
      | ^^^^^^^^^^^^^

> 356 | }

      | ^^^^^^^^^^^^^

> 357 | }, [handleMessage]);

      | ^^^^^^^^^^^^^^^^^^^^^^^^^ `attemptConnect` is declared here

358 |
359 | const connect = useCallback(async () => {
360 | if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); } react-hooks/immutability

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-pwa-install.ts
22:5 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\hooks\use-pwa-install.ts:22:5
20 | const isStandalone = window.matchMedia('(display-mode: standalone)').matches
21 | || (navigator as unknown as { standalone?: boolean }).standalone === true;

> 22 | setIsInstalled(isStandalone);

     |     ^^^^^^^^^^^^^^ Avoid calling setState() directly within an effect

23 |
24 | // Check if iOS
25 | const ua = navigator.userAgent; react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\lib\agent-utils.ts
6:20 warning 'Globe' is defined but never used @typescript-eslint/no-unused-vars
6:27 warning 'MessageSquare' is defined but never used @typescript-eslint/no-unused-vars

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\lib\step-utils.ts
40:47 error Unexpected any. Specify a different type @typescript-eslint/no-explicit-any

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\lib\theme.ts
10:9 error Error: Calling setState synchronously within an effect can trigger cascading renders

Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:

- Update external systems with the latest state from React.
- Subscribe for updates from some external system, calling setState in a callback function when external state changes.

Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\lib\theme.ts:10:9
8 | const saved = localStorage.getItem('antigravity-theme');
9 | const dark = saved ? saved === 'dark' : true;

> 10 | setIsDark(dark);

     |         ^^^^^^^^^ Avoid calling setState() directly within an effect

11 | document.documentElement.classList.toggle('dark', dark);
12 | }, []);
13 | react-hooks/set-state-in-effect

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\lib\websocket.ts
5:10 warning 'extractStepContent' is defined but never used  
 @typescript-eslint/no-unused-vars
360:8 warning React Hook useCallback has a missing dependency: 'state'. Either include it or remove the dependency array react-hooks/exhaustive-deps

C:\Users\joelj\source\repos\personal\Antigravity-Deck\frontend\public\sw.js
8:35 warning 'event' is defined but never used @typescript-eslint/no-unused-vars

✖ 153 problems (47 errors, 106 warnings)
