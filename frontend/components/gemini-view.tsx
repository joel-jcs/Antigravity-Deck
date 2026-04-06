"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot,
  Loader2,
  Send,
  Plus,
  Settings,
  Brain,
  ChevronDown,
  Rocket,
  Zap,
  Activity,
  Download,
  RefreshCcw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatArea } from "@/components/chat-area";
import { Step } from "@/lib/types";
import {
  getGeminiProjects,
  getGeminiHistory,
  getGeminiStats,
  getGeminiQuota,
  type GeminiProject,
  type GeminiQuotaBucket,
} from "@/lib/gemini-api";
import { getGeminiWsUrl } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * GeminiView — Unified mobile-friendly interface for Gemini CLI.
 */
export function GeminiView({
  activeProject,
  activeSession,
  onSelectSession,
}: {
  activeProject: string | null;
  activeSession: string | null;
  onSelectSession: (id: string | null) => void;
}) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [projects, setProjects] = useState<GeminiProject[]>([]);
  const [quota, setQuota] = useState<GeminiQuotaBucket[]>([]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reset textarea height
  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.style.height = "";
    }
  }, [input]);

  // Fetch projects and quota on mount
  useEffect(() => {
    getGeminiProjects().then(setProjects).catch(console.error);
    getGeminiQuota().then(setQuota).catch(console.error);
  }, []);

  // Reset and load steps when session changes
  useEffect(() => {
    if (activeProject && activeSession) {
      setLoadingHistory(true);
      setSteps([]); // Clear stale messages while loading
      getGeminiHistory(activeProject, activeSession)
        .then((h) => {
          setSteps(h);
        })
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    } else {
      setSteps([]);
    }
  }, [activeProject, activeSession]);

  const activeSessionRef = useRef(activeSession);
  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  // WebSocket setup
  useEffect(() => {
    let socket: WebSocket | null = null;
    let isTerminated = false;

    async function initWS() {
      const baseUrl = await getGeminiWsUrl();
      const authKey = encodeURIComponent(
        localStorage.getItem("antigravity_auth_key") || "",
      );

      if (isTerminated) return;
      socket = new WebSocket(`${baseUrl}?auth_key=${authKey}`);

      socket.onopen = () => {
        if (isTerminated) {
          socket?.close();
          return;
        }
        console.log("[GeminiView] WebSocket connected");
        setWs(socket);
      };

      socket.onmessage = (event) => {
        if (isTerminated) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "step-update") {
            setSteps((prev) => {
              const last = prev[prev.length - 1];
              // Merge streaming text chunks into the last planner response bubble
              if (
                msg.isStreamingChunk &&
                last &&
                last.type === "CORTEX_STEP_TYPE_PLANNER_RESPONSE" &&
                msg.step.type === "CORTEX_STEP_TYPE_PLANNER_RESPONSE" &&
                !last.plannerResponse?.toolCalls
              ) {
                const updated = { ...last };
                updated.plannerResponse = {
                  ...updated.plannerResponse,
                  modifiedResponse: (updated.plannerResponse?.modifiedResponse || "") + (msg.step.plannerResponse?.modifiedResponse || ""),
                };
                return [...prev.slice(0, -1), updated];
              }
              // Otherwise append as a new step
              return [...prev, msg.step];
            });
          } else if (msg.type === "complete") {
            // Mark any in-progress streaming step as done
            setSteps((prev) => {
              const last = prev[prev.length - 1];
              if (last?.status === "streaming") {
                return [...prev.slice(0, -1), { ...last, status: "done" }];
              }
              return prev;
            });
            setStreaming(false);
            if (msg.sessionId && msg.sessionId !== activeSessionRef.current) {
              onSelectSession(msg.sessionId);
            }
          } else if (msg.type === "log") {
            setSteps((prev) => [...prev, {
              type: "CORTEX_STEP_TYPE_EPHEMERAL_MESSAGE",
              status: "done",
              ephemeralMessage: { content: msg.message },
              metadata: { createdAt: new Date().toISOString() }
            }]);
          } else if (msg.type === "error") {
            setStreaming(false);
            setSteps((prev) => [...prev, {
              type: "CORTEX_STEP_TYPE_ERROR_MESSAGE",
              status: "done",
              errorMessage: msg.message,
              metadata: { createdAt: new Date().toISOString() }
            }]);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      socket.onclose = () => {
        if (isTerminated) return;
        console.log("[GeminiView] WebSocket closed");
        setWs(null);
        setStreaming(false);
      };
    }

    initWS();

    return () => {
      isTerminated = true;
      socket?.close();
    };
  }, [onSelectSession]);

  const handleSend = useCallback(() => {
    if (!input.trim() || streaming || !ws) return;

    const prompt = input.trim();
    const project = projects.find((p) => p.id === activeProject);

    // Intercept /stats — run via REST, not WebSocket
    if (prompt === "/stats") {
      setSteps((prev) => [...prev, {
        type: "CORTEX_STEP_TYPE_USER_INPUT",
        status: "done",
        userInput: { userResponse: "/stats" },
        metadata: { createdAt: new Date().toISOString() }
      }]);
      setInput("");
      setStreaming(true);
      getGeminiStats(project?.path)
        .then((data) => {
          setSteps((prev) => [
            ...prev,
            {
              type: "CORTEX_STEP_TYPE_PLANNER_RESPONSE",
              status: "done",
              plannerResponse: { modifiedResponse: data.response },
              metadata: { createdAt: new Date().toISOString() }
            },
          ]);
        })
        .catch((err) => {
          setSteps((prev) => [
            ...prev,
            {
              type: "CORTEX_STEP_TYPE_ERROR_MESSAGE",
              status: "done",
              errorMessage: `Error fetching stats: ${err.message}`,
              metadata: { createdAt: new Date().toISOString() }
            },
          ]);
        })
        .finally(() => setStreaming(false));
      return;
    }

    setSteps((prev) => [...prev, {
      type: "CORTEX_STEP_TYPE_USER_INPUT",
      status: "done",
      userInput: { userResponse: prompt },
      metadata: { createdAt: new Date().toISOString() }
    }]);
    setInput("");
    setStreaming(true);

    ws.send(
      JSON.stringify({
        type: "gemini-command",
        options: {
          prompt,
          sessionId: activeSession,
          model: selectedModel,
          cwd: project?.path,
        },
      }),
    );
  }, [
    input,
    streaming,
    ws,
    activeProject,
    activeSession,
    selectedModel,
    projects,
  ]);

  const handleNewChat = useCallback(() => {
    setSteps([]);
    setInput("");
    onSelectSession(null);
  }, [onSelectSession]);

  return (
    <div className='flex-1 flex flex-col min-h-0 bg-background'>
      {/* Main Messages Area - Takes up flex-1 space */}
      {loadingHistory ? (
        <div className='flex-1 flex items-center justify-center h-full'>
          <div className='text-center space-y-4 opacity-60'>
            <Loader2 className='h-8 w-8 text-primary animate-spin mx-auto' />
            <p className='text-sm font-medium'>Loading chat history...</p>
          </div>
        </div>
      ) : steps.length === 0 ? (
        <div className='flex-1 flex items-center justify-center h-full'>
          <div className='text-center space-y-4'>
            <div className='flex items-center justify-center gap-3'>
              <Rocket className='h-8 w-8 text-muted-foreground/40' />
              <h2 className='text-xl font-semibold text-foreground/80'>
                GeminiPortal
              </h2>
            </div>
            <p className='text-sm text-muted-foreground max-w-md mx-auto'>
              {activeSession
                ? "Loading conversation..."
                : "Pick a Gemini project from the sidebar to start a new local session."}
            </p>
          </div>
        </div>
      ) : (
        <ChatArea
          steps={steps}
          searchQuery=""
          activeFilters={new Set()}
        />
      )}

      {/* Identical Footer / Input Bar */}
      <div className='border-t border-border bg-background/80 backdrop-blur px-2 sm:px-4 py-2 sm:py-3 sticky bottom-0 z-10'>
        <div className='max-w-4xl mx-auto space-y-2'>
          {/* Row 1: Pickers and Status */}
          <div className='flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-1.5 text-muted-foreground h-7 px-2 font-normal'
                >
                  <Brain className='h-3.5 w-3.5' />
                  <span className='truncate'>{selectedModel}</span>
                  <ChevronDown className='h-3 w-3 opacity-50' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-64'>
                <DropdownMenuLabel>Gemini Models</DropdownMenuLabel>
                {[
                  "gemini-3.1-pro-preview",
                  "gemini-3-flash-preview",
                  "gemini-3.1-flash-lite-preview",
                  "gemini-2.5-pro",
                  "gemini-2.5-flash",
                  "gemini-2.5-flash-lite",
                ].map((m) => {
                  const bucket = quota.find((b) => b.modelId === m);
                  const remaining = bucket?.remainingFraction ?? null;
                  return (
                    <DropdownMenuItem
                      key={m}
                      onClick={() => setSelectedModel(m)}
                      className={cn(
                        "cursor-pointer flex items-center justify-between gap-2",
                        m === selectedModel && "text-primary",
                      )}
                    >
                      <span className='truncate flex-1'>{m}</span>
                      <div className='flex items-center gap-1.5 shrink-0'>
                        {remaining !== null && (
                          <div className='w-12 h-1.5 rounded-full bg-muted overflow-hidden'>
                            <div
                              className='h-full rounded-full bg-emerald-500/70'
                              style={{
                                width: `${Math.round(remaining * 100)}%`,
                              }}
                            />
                          </div>
                        )}
                        {m === selectedModel && <Check className='h-3 w-3' />}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Connection Status */}
            <div className='flex items-center gap-1.5 text-[10px] text-purple-400/70 ml-1'>
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  ws
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-red-500 animate-pulse",
                )}
              />
              {ws ? "Live" : "Disconnected"}
            </div>

            <div className='flex-1' />

            {/* New Chat Button */}
            <Button
              variant='ghost'
              size='sm'
              onClick={handleNewChat}
              className='gap-1 h-7 text-muted-foreground hover:text-foreground'
            >
              <Plus className='h-3.5 w-3.5' />
              <span className='hidden sm:inline'>New Chat</span>
            </Button>

            {/* Settings Mock (for layout parity) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  size='sm'
                  className='gap-1.5 h-7 text-muted-foreground hover:text-foreground'
                >
                  <Settings className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='text-xs font-normal text-muted-foreground flex flex-col gap-1'>
                  <span className='font-bold text-foreground'>
                    {activeProject || "PC Home"}
                  </span>
                  <span className='truncate opacity-60'>
                    {activeSession || "Temporary Session"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-not-allowed opacity-50'>
                  <Zap className='w-3.5 h-3.5 mr-2' /> Auto-accepting
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-not-allowed opacity-50'>
                  <Activity className='w-3.5 h-3.5 mr-2' /> Timeline
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-not-allowed opacity-50'>
                  <Download className='w-3.5 h-3.5 mr-2' /> Export Markdown
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className='cursor-pointer'
                  onClick={() => window.location.reload()}
                >
                  <RefreshCcw className='w-3.5 h-3.5 mr-2' /> Refresh App
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Row 2: Textarea Input */}
          <div className='relative flex items-end gap-2'>
            <Textarea
              ref={inputRef}
              placeholder='Message Gemini...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={streaming}
              className='min-h-11 max-h-50 resize-none bg-muted/20 border-border/50 focus:border-primary/50 transition-all rounded-xl py-3 pr-12 scroll-m-0'
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <Button
              size='icon'
              onClick={handleSend}
              disabled={!input.trim() || streaming || !ws}
              className='absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform active:scale-95'
            >
              {streaming ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
