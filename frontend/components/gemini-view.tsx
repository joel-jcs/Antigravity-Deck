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
import { MarkdownRenderer } from "@/components/markdown-renderer";
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
  const [messages, setMessages] = useState<
    { role: "user" | "gemini"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [selectedModel, setSelectedModel] = useState("gemini-3-flash-preview");
  const [projects, setProjects] = useState<GeminiProject[]>([]);
  const [quota, setQuota] = useState<GeminiQuotaBucket[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const autoScrollRef = useRef(true);

  // Reset textarea height
  useEffect(() => {
    if (!input && inputRef.current) {
      inputRef.current.style.height = "";
    }
  }, [input]);

  // Auto-scroll logic similar to ChatView
  useEffect(() => {
    if (autoScrollRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Distinguish user scroll from auto-scroll (roughly)
    const atBottom = scrollHeight - scrollTop <= clientHeight + 100;
    autoScrollRef.current = atBottom;
  }, []);

  // Fetch projects and quota on mount
  useEffect(() => {
    getGeminiProjects().then(setProjects).catch(console.error);
    getGeminiQuota().then(setQuota).catch(console.error);
  }, []);

  // Reset and load messages when session changes
  useEffect(() => {
    if (activeProject && activeSession) {
      // Use microtask to avoid synchronous setState warning
      Promise.resolve().then(() => {
        setLoadingHistory(true);
        setMessages([]); // Clear stale messages while loading
      });
      getGeminiHistory(activeProject, activeSession)
        .then((h) => {
          setMessages(h);
          // Force scroll to bottom on load
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "instant" });
          }, 50);
        })
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    } else {
      // Use microtask to avoid synchronous setState warning
      Promise.resolve().then(() => setMessages([]));
    }
  }, [activeProject, activeSession]);

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
          if (msg.type === "response") {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "gemini") {
                return [
                  ...prev.slice(0, -1),
                  { ...last, content: last.content + msg.text },
                ];
              } else {
                return [...prev, { role: "gemini", content: msg.text }];
              }
            });
          } else if (msg.type === "complete") {
            setStreaming(false);
            if (msg.sessionId && msg.sessionId !== activeSession) {
              onSelectSession(msg.sessionId);
            }
          } else if (msg.type === "error") {
            setStreaming(false);
            setMessages((prev) => [
              ...prev,
              { role: "gemini", content: `**Error:** ${msg.message}` },
            ]);
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
  }, [activeSession, onSelectSession]);

  const handleSend = useCallback(() => {
    if (!input.trim() || streaming || !ws) return;

    const prompt = input.trim();
    const project = projects.find((p) => p.id === activeProject);

    // Intercept /stats — run via REST, not WebSocket
    if (prompt === "/stats") {
      setMessages((prev) => [...prev, { role: "user", content: "/stats" }]);
      setInput("");
      setStreaming(true);
      getGeminiStats(project?.path)
        .then((data) => {
          setMessages((prev) => [
            ...prev,
            { role: "gemini", content: data.response },
          ]);
        })
        .catch((err) => {
          setMessages((prev) => [
            ...prev,
            {
              role: "gemini",
              content: `**Error fetching stats:** ${err.message}`,
            },
          ]);
        })
        .finally(() => setStreaming(false));
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
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
    setMessages([]);
    setInput("");
    onSelectSession(null);
  }, [onSelectSession]);

  return (
    <div className='flex-1 flex flex-col min-h-0 bg-background'>
      {/* Main Messages Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className='relative flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-5'
      >
        {loadingHistory ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center space-y-4 opacity-60'>
              <Loader2 className='h-8 w-8 text-primary animate-spin mx-auto' />
              <p className='text-sm font-medium'>Loading chat history...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
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
          <div className='max-w-4xl mx-auto'>
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex mb-4",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] group relative rounded-lg px-4 py-3 overflow-hidden min-w-0 transition-all",
                    m.role === "user"
                      ? "rounded-br-md bg-blue-600/20 border border-blue-500/20"
                      : "rounded-bl-md bg-linear-to-r from-purple-950/20 to-transparent border border-purple-500/10",
                  )}
                >
                  <div className='flex items-center gap-2 mb-1.5'>
                    {m.role === "gemini" ? (
                      <div className='w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]'>
                        <Bot className='h-2.5 w-2.5 text-purple-400' />
                      </div>
                    ) : null}
                    <span
                      className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        m.role === "user" ? "text-blue-400" : "text-purple-400",
                      )}
                    >
                      {m.role === "user" ? "You" : "Gemini"}
                    </span>
                    <span className='text-[10px] text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity'>
                      #{i + 1}
                    </span>
                  </div>

                  <div className='text-sm leading-relaxed'>
                    <MarkdownRenderer content={m.content} />
                  </div>
                </div>
              </div>
            ))}
            {streaming && (
              <div className='flex justify-start mb-4'>
                <div className='max-w-[85%] rounded-lg rounded-bl-md px-4 py-3 bg-linear-to-r from-purple-950/20 to-transparent border border-purple-500/10'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Loader2 className='h-2.5 w-2.5 text-purple-400 animate-spin' />
                    <span className='text-[10px] font-bold text-purple-400 uppercase tracking-widest'>
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} className='h-4' />
          </div>
        )}
      </div>

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
