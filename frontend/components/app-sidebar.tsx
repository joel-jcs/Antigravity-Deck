"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getWorkspaces,
  createWorkspace,
  createHeadlessWorkspace,
  getWorkspaceFolders,
} from "@/lib/cascade-api";
import type { WorkspaceFolder, ResourceSnapshot } from "@/lib/cascade-api";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme";
import { PluginManager } from "./plugin-manager";
import { API_BASE } from "@/lib/config";
import { authHeaders } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  User,
  Plug,
  Book,
  Globe,
  Moon,
  Sun,
  Plus,
  FolderOpen,
  FolderPlus,
  EllipsisVertical,
  Activity,
  Bot,
  FolderSync,
  Loader2,
  Circle,
  GitBranch,
  Terminal,
  Monitor,
  Cable,
  Workflow,
  Zap,
} from "lucide-react";

import { WorkspaceGroup } from "./sidebar/workspace-group";
import type { ConvSummary, WorkspaceData } from "./sidebar/workspace-group";
import { GeminiGroup } from "./sidebar/gemini-group";
import { SystemResourceSummary } from "./sidebar/system-resource-summary";

interface AppSidebarProps {
  currentConvId: string | null;
  conversationsVersion: number;
  /** Whether Antigravity Language Server is detected by backend */
  detected: boolean;
  onSelectConversation: (convId: string | null, wsName: string) => void;
  onSelectWorkspace: (wsName: string) => void;
  onShowAccountInfo: () => void;
  onShowSettings: () => void;
  onShowLogs: () => void;
  onShowAgentHub: () => void;
  onShowOrchestrator: () => void;
  onShowConnect: () => void;
  onShowSourceControl: () => void;
  onShowResources: () => void;
  onShowGemini: () => void;
  onShowAntigravity: () => void;
  onGoHome: () => void;
  activeView?: string | null;
  activeWorkspace: string | null;
  workspaceResources?: ResourceSnapshot | null;
  wsVersion?: number;
  onWorkspaceCreated?: () => void;
  onSelectGeminiProject?: (projectId: string) => void;
  onSelectGeminiSession?: (sessionId: string | null) => void;
  activeGeminiProject?: string | null;
  activeGeminiSession?: string | null;
  /** Called after a conversation is successfully deleted, with the deleted conv ID */
  onConvDeleted?: (convId: string, wsName: string) => void;
}

export function AppSidebar({
  currentConvId,
  conversationsVersion,
  detected,
  onSelectConversation,
  onSelectWorkspace,
  onShowAccountInfo,
  onShowSettings,
  onShowLogs,
  onShowAgentHub,
  onShowOrchestrator,
  onShowConnect,
  onShowSourceControl,
  onShowResources,
  onShowGemini,
  onShowAntigravity,
  onGoHome,
  activeView,
  activeWorkspace,
  workspaceResources,
  wsVersion,
  onWorkspaceCreated,
  onSelectGeminiProject,
  onSelectGeminiSession,
  activeGeminiProject,
  activeGeminiSession,
  onConvDeleted,
}: AppSidebarProps) {
  const { isDark, toggle: toggleTheme } = useTheme();
  const { isMobile } = useSidebar();

  const [wsData, setWsData] = useState<WorkspaceData[]>([]);
  const [folders, setFolders] = useState<WorkspaceFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingFolder, setOpeningFolder] = useState<string | null>(null);
  const [newWsName, setNewWsName] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [showPlugins, setShowPlugins] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAllMap, setShowAllMap] = useState<Record<string, boolean>>({});
  const [headlessMode, setHeadlessMode] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<WorkspaceFolder | null>(
    null,
  );

  // User profile state
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    avatar: string;
  }>({
    name: "Joel J",
    email: "joelj@antigravity.run",
    avatar: "/avatars/user.jpg",
  });

  // Fetch workspaces & conversations on mount or when requested
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const wss = await getWorkspaces();

      // Fetch conversations for all workspaces in parallel
      const conversationsData = await Promise.all(
        wss.map(async (ws) => {
          try {
            const res = await fetch(
              `${API_BASE}/api/workspaces/${encodeURIComponent(ws.workspaceName)}/conversations`,
              { headers: authHeaders() },
            );
            if (!res.ok) return [] as ConvSummary[];
            const data = await res.json();
            // API returns { trajectorySummaries: { [id]: info, ... } } — not an array
            const summaries = data.trajectorySummaries || {};
            return (
              Object.entries(summaries) as [
                string,
                {
                  summary?: string;
                  stepCount?: number;
                  lastModifiedTime?: string;
                },
              ][]
            )
              .map(([id, info]) => ({
                id,
                summary: info.summary || "Untitled",
                stepCount: info.stepCount ?? 0,
                lastModifiedTime: info.lastModifiedTime ?? "",
              }))
              .sort((a, b) =>
                b.lastModifiedTime.localeCompare(a.lastModifiedTime),
              ) as ConvSummary[];
          } catch (e) {
            console.error("Failed to fetch conversations:", e);
            return [];
          }
        }),
      );

      const combined: WorkspaceData[] = wss.map((ws, i) => ({
        workspace: ws,
        conversations: conversationsData[i],
        loading: false,
        expanded: false, // Default to collapsed
      }));

      setWsData(combined);

      // Also list workspace root folders for "Available Workspaces" section
      const folderData = await getWorkspaceFolders();
      setFolders(folderData.folders);
    } catch (e) {
      console.error("Sidebar load failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll, conversationsVersion, wsVersion]);

  // Handle workspace creation
  const handleCreateWorkspace = useCallback(async () => {
    // Need at least a name OR a path
    if (!newWsName.trim() && !customPath.trim()) return;

    setCreating(true);
    setCreateError("");
    try {
      // If path is provided, use it (isName = false)
      // If only name is provided, use name (isName = true)
      const identifier = customPath.trim() || newWsName.trim();
      const isName = !customPath.trim();

      await createWorkspace(identifier, isName);

      setNewWsName("");
      setCustomPath("");
      setShowCreateDialog(false);
      await loadAll();
      onWorkspaceCreated?.();
    } catch (e: unknown) {
      setCreateError(
        e instanceof Error ? e.message : "Failed to create workspace",
      );
    } finally {
      setCreating(false);
    }
  }, [newWsName, customPath, loadAll, onWorkspaceCreated]);

  // Validation — no spaces, lowercase-ish
  const nameValidationError = useMemo(() => {
    if (!newWsName) return "";
    if (/\s/.test(newWsName)) return "No spaces allowed";
    if (/[^a-zA-Z0-0\-_]/.test(newWsName))
      return "Only letters, numbers, hyphens and underscores";
    return "";
  }, [newWsName]);

  const handleOpenFolder = useCallback(
    async (folder: WorkspaceFolder) => {
      if (openingFolder === folder.name) return;
      setOpeningFolder(folder.name);
      try {
        await createHeadlessWorkspace(folder.path);
        await loadAll();
        onWorkspaceCreated?.();
      } catch (e) {
        console.error("Open headless failed:", e);
      } finally {
        setOpeningFolder(null);
      }
    },
    [openingFolder, loadAll, onWorkspaceCreated],
  );

  const toggleWorkspaceExpand = useCallback((wsName: string) => {
    setWsData((prev) =>
      prev.map((d) =>
        d.workspace.workspaceName === wsName
          ? { ...d, expanded: !d.expanded }
          : d,
      ),
    );
  }, []);

  const toggleShowAll = useCallback((wsName: string) => {
    setShowAllMap((prev) => ({
      ...prev,
      [wsName]: !prev[wsName],
    }));
  }, []);

  const regularWs = wsData.filter((d) => d.workspace.category !== "playground");
  const playgroundWs = wsData.filter(
    (d) => d.workspace.category === "playground",
  );

  const activeWsNames = new Set(
    wsData.map((d) => d.workspace.workspaceName.toLowerCase()),
  );
  const closedFolders = folders.filter(
    (f) => !f.open && !activeWsNames.has(f.name.toLowerCase()),
  );

  return (
    <>
      <Sidebar variant='inset'>
        <SidebarHeader className='p-4 border-b bg-sidebar-header/50 backdrop-blur-md'>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size='lg'
                className='w-full !p-0 hover:bg-transparent'
                onClick={onGoHome}
              >
                <div className='flex aspect-square size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform active:scale-95 cursor-pointer'>
                  <FolderSync className='size-6' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none ml-3 cursor-pointer'>
                  <span className='font-bold text-base tracking-tight'>
                    Antigravity
                  </span>
                  <span className='text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60'>
                    Deck v3
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className='px-2'>
          {/* Intelligence & AI Tools */}
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50'>
              Intelligence
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowAntigravity}
                    tooltip='Antigravity'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "antigravity"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <Zap
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "antigravity"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>Antigravity</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowGemini}
                    tooltip='Gemini'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "gemini"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <Bot
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "gemini"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>Gemini</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Main Contexts */}
          <SidebarGroup>
            <SidebarGroupLabel className='px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50'>
              Insights
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowAgentHub}
                    tooltip='Agent Hub'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "agent-hub"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <Workflow
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "agent-hub"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>Agent Hub</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowSourceControl}
                    tooltip='IDE / Sources'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "source-control"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <GitBranch
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "source-control"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>IDE</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowLogs}
                    tooltip='System Logs'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "logs"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <Terminal
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "logs"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>Logs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={onShowResources}
                    tooltip='Resources'
                    className={cn(
                      "group/menu-btn h-9 px-3 rounded-lg transition-all duration-200",
                      activeView === "resources"
                        ? "bg-primary/10 text-primary font-semibold ring-1 ring-primary/20"
                        : "hover:bg-muted/50 text-foreground/80",
                    )}
                  >
                    <Monitor
                      className={cn(
                        "shrink-0 transition-transform group-hover/menu-btn:scale-110",
                        activeView === "resources"
                          ? "text-primary"
                          : "text-muted-foreground/60",
                      )}
                    />
                    <span className='ml-2 text-sm'>Stats</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Regular Workspaces or Gemini Projects */}
          <SidebarGroup>
            <div className='flex items-center justify-between px-2 py-1.5'>
              <SidebarGroupLabel className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50'>
                {activeView === "gemini" ? "Gemini Projects" : "Workspaces"}
              </SidebarGroupLabel>
              {activeView !== "gemini" && (
                <button
                  onClick={() => {
                    setHeadlessMode(false);
                    setShowCreateDialog(true);
                  }}
                  className='p-1 rounded hover:bg-muted/50 text-muted-foreground/30 hover:text-primary transition-colors ring-1 ring-muted-foreground/10'
                  title='New Workspace'
                >
                  <Plus className='h-3 w-3' />
                </button>
              )}
            </div>
            <SidebarGroupContent>
              {activeView === "gemini" ? (
                <GeminiGroup
                  activeProject={activeGeminiProject ?? null}
                  activeSession={activeGeminiSession ?? null}
                  onSelectProject={onSelectGeminiProject ?? (() => {})}
                  onSelectSession={onSelectGeminiSession ?? (() => {})}
                  onNewChat={(projectId) => {
                    onSelectGeminiProject?.(projectId);
                    onSelectGeminiSession?.(null);
                  }}
                />
              ) : regularWs.length === 0 ? (
                <div className='px-4 py-8 text-center bg-muted/5 rounded-xl border border-dashed border-border/50 mx-2'>
                  <p className='text-[10px] text-muted-foreground mb-3 leading-relaxed'>
                    No workspaces yet.
                    <br />
                    Start one to begin chatting.
                  </p>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-7 text-[10px] gap-1.5 rounded-full px-3'
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <FolderPlus className='h-3 w-3' /> New
                  </Button>
                </div>
              ) : (
                regularWs.map((ws, i) => (
                  <WorkspaceGroup
                    key={ws.workspace.workspaceName}
                    data={ws}
                    arrayIdx={i}
                    showAll={!!showAllMap[ws.workspace.workspaceName]}
                    currentConvId={currentConvId}
                    resources={
                      activeWorkspace === ws.workspace.workspaceName &&
                      workspaceResources
                        ? workspaceResources.workspaces[activeWorkspace]
                        : undefined
                    }
                    onToggleExpand={() =>
                      toggleWorkspaceExpand(ws.workspace.workspaceName)
                    }
                    onSelectConv={(cid) =>
                      onSelectConversation(cid, ws.workspace.workspaceName)
                    }
                    onToggleShowAll={() =>
                      toggleShowAll(ws.workspace.workspaceName)
                    }
                    onDeleted={onConvDeleted}
                  />
                ))
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Playground Workspaces — hidden in Gemini mode */}
          {activeView !== "gemini" && (
            <SidebarGroup>
              <div className='flex items-center justify-between px-2 py-1.5'>
                <SidebarGroupLabel className='text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50'>
                  Playground
                </SidebarGroupLabel>
                <button
                  onClick={() => {
                    setHeadlessMode(true);
                    setShowCreateDialog(true);
                  }}
                  className='p-1 rounded hover:bg-muted/50 text-muted-foreground/30 hover:text-primary transition-colors ring-1 ring-muted-foreground/10'
                  title='New Playground'
                >
                  <Plus className='h-3 w-3' />
                </button>
              </div>
              <SidebarGroupContent>
                {playgroundWs.map((ws, i) => (
                  <WorkspaceGroup
                    key={ws.workspace.workspaceName}
                    data={ws}
                    arrayIdx={i}
                    showAll={!!showAllMap[ws.workspace.workspaceName]}
                    currentConvId={currentConvId}
                    resources={
                      activeWorkspace === ws.workspace.workspaceName &&
                      workspaceResources
                        ? workspaceResources.workspaces[activeWorkspace]
                        : undefined
                    }
                    onToggleExpand={() =>
                      toggleWorkspaceExpand(ws.workspace.workspaceName)
                    }
                    onSelectConv={(cid) =>
                      onSelectConversation(cid, ws.workspace.workspaceName)
                    }
                    onToggleShowAll={() =>
                      toggleShowAll(ws.workspace.workspaceName)
                    }
                    onDeleted={onConvDeleted}
                  />
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {activeView !== "gemini" && closedFolders.length > 0 && (
            <>
              <SidebarSeparator className='mx-0 opacity-40' />
              <SidebarGroup>
                <SidebarGroupLabel className='px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/50'>
                  Available
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className='space-y-0.5'>
                    {closedFolders.map((folder) => (
                      <SidebarMenuItem key={folder.name}>
                        <SidebarMenuButton
                          onClick={() => setSelectedFolder(folder)}
                          disabled={openingFolder === folder.name}
                          tooltip={folder.name}
                          className='h-8 px-3 rounded-lg hover:bg-muted/50 text-foreground/70 pr-2!'
                        >
                          <FolderOpen className='shrink-0 h-3.5 w-3.5 opacity-60' />
                          <span className='flex-1 truncate text-xs min-w-0 font-medium'>
                            {folder.name}
                          </span>
                          <span className='ml-auto opacity-0 group-hover:opacity-100 text-[8px] font-bold uppercase tracking-tighter text-muted-foreground/30 transition-opacity shrink-0 bg-muted/40 px-1 rounded'>
                            {openingFolder === folder.name ? (
                              <Loader2 className='h-2.5 w-2.5 animate-spin' />
                            ) : (
                              "Open"
                            )}
                          </span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter className='p-2 gap-2 mt-auto border-t bg-sidebar-footer/30'>
          <SystemResourceSummary system={workspaceResources?.system} />

          <SidebarSeparator className='mx-0 opacity-40' />

          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size='lg'
                    className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-xl transition-all duration-200'
                  >
                    <Avatar className='h-8 w-8 rounded-lg ring-2 ring-primary/20 shadow-sm'>
                      <AvatarImage
                        src={userProfile.avatar}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className='rounded-lg bg-primary/10 text-primary text-[10px] font-bold'>
                        JJ
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight ml-2'>
                      <span className='truncate font-semibold'>
                        {userProfile.name}
                      </span>
                      <span className='truncate text-[10px] text-muted-foreground font-medium uppercase tracking-tighter'>
                        Pro Member
                      </span>
                    </div>
                    <EllipsisVertical className='ml-auto size-4 text-muted-foreground/40' />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-2'
                  side={isMobile ? "bottom" : "right"}
                  align='end'
                  sideOffset={4}
                >
                  <div className='flex items-center gap-2 px-1 py-1.5'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage
                        src={userProfile.avatar}
                        alt={userProfile.name}
                      />
                      <AvatarFallback className='rounded-lg bg-primary/10 text-primary text-[10px] font-bold'>
                        JJ
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-semibold'>
                        {userProfile.name}
                      </span>
                      <span className='truncate text-[10px] text-muted-foreground'>
                        {userProfile.email}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator className='bg-muted/50' />
                  <DropdownMenuItem
                    onClick={onShowAccountInfo}
                    className='rounded-lg gap-2 cursor-pointer'
                  >
                    <User className='size-4 text-muted-foreground/60' />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onShowSettings}
                    className='rounded-lg gap-2 cursor-pointer'
                  >
                    <Settings className='size-4 text-muted-foreground/60' />
                    Deck Configuration
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className='bg-muted/50' />
                  <DropdownMenuItem
                    onClick={toggleTheme}
                    className='rounded-lg gap-2 cursor-pointer'
                  >
                    {isDark ? (
                      <Sun className='size-4 text-amber-400' />
                    ) : (
                      <Moon className='size-4 text-primary' />
                    )}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Workspace Creation Dialog */}
      <Dialog
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) setCreateError("");
        }}
      >
        <DialogContent className='sm:max-w-105 rounded-2xl p-0 overflow-hidden border-none shadow-2xl'>
          <div className='bg-primary/5 p-6 border-b border-primary/10'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                  <FolderPlus className='h-5 w-5' />
                </div>
                {headlessMode ? "New Playground" : "New Workspace"}
              </DialogTitle>
              <DialogDescription className='ml-11 text-muted-foreground/70'>
                {headlessMode
                  ? "Create a temporary workspace for quick experiments."
                  : "Organize your conversations and agents for a specific project."}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className='p-6 space-y-6'>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground/60'>
                  Name
                </label>
                <Badge
                  variant='outline'
                  className='text-[9px] h-4 px-1.5 font-mono text-muted-foreground/40'
                >
                  ID-safe string
                </Badge>
              </div>
              <Input
                placeholder='my-awesome-project'
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                className='h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm transition-all'
                autoFocus
              />

              <div className='flex items-center justify-between mt-4'>
                <div className='flex flex-col gap-1'>
                  <label className='text-xs font-bold uppercase tracking-widest text-muted-foreground/60'>
                    Base Path (Optional)
                  </label>
                  <span className='text-[10px] text-muted-foreground/40'>
                    Path on host PC (e.g. C:\dev\project)
                  </span>
                </div>
              </div>
              <Input
                placeholder='C:\Users\joelj\repos\...'
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                className='h-11 rounded-xl bg-muted/30 border-muted-foreground/10 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm transition-all'
              />

              {(nameValidationError || createError) &&
                (newWsName.trim() || customPath.trim()) && (
                  <p className='text-xs text-destructive flex items-center gap-1.5 px-1 pr-2!'>
                    <Circle className='h-1.5 w-1.5 fill-current' />
                    {nameValidationError || createError}
                  </p>
                )}
            </div>
            <div className='flex items-center gap-2 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 text-[11px] text-orange-400/80 leading-relaxed'>
              <Activity className='h-3.5 w-3.5 shrink-0' />
              This workspace will be registered on your local Antigravity server
              for context indexing.
            </div>
          </div>
          <DialogFooter className='p-6 bg-muted/10 border-t border-border/50'>
            <Button
              variant='ghost'
              onClick={() => setShowCreateDialog(false)}
              className='rounded-xl hover:bg-muted/50'
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={
                creating ||
                (!!nameValidationError && !customPath.trim()) ||
                (!newWsName.trim() && !customPath.trim())
              }
              className='rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px]'
            >
              {creating ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' /> Creating...
                </>
              ) : (
                <>
                  <Plus className='h-4 w-4' /> Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation to open existing folder as headless */}
      <Dialog
        open={!!selectedFolder}
        onOpenChange={(open) => {
          if (!open) setSelectedFolder(null);
        }}
      >
        <DialogContent className='sm:max-w-95 rounded-2xl p-0 overflow-hidden border-none shadow-2xl'>
          <div className='bg-primary/5 p-6 border-b border-primary/10'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                  <FolderOpen className='h-5 w-5' />
                </div>
                Open Workspace
              </DialogTitle>
              <DialogDescription className='ml-11 text-muted-foreground/70'>
                {selectedFolder?.name}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className='p-6 space-y-4'>
            <p className='text-sm text-foreground/80 leading-relaxed'>
              This folder is not yet registered as an active workspace. Would
              you like to open it in{" "}
              <span className='font-bold text-primary'>Headless Mode</span>?
            </p>
            <div className='flex items-start gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 text-[11px] text-muted-foreground leading-relaxed'>
              <Workflow className='h-4 w-4 text-primary shrink-0' />
              <span>
                Headless mode allows quick access to folder contents for
                browsing and chatting without a permanent project entry.
              </span>
            </div>
          </div>
          <DialogFooter className='p-6 bg-muted/10 border-t border-border/50'>
            <Button
              variant='ghost'
              onClick={() => setSelectedFolder(null)}
              className='rounded-xl'
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedFolder) {
                  handleOpenFolder(selectedFolder);
                  setSelectedFolder(null);
                }
              }}
              className='rounded-xl gap-2 font-semibold shadow-lg shadow-primary/20'
            >
              Open Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
