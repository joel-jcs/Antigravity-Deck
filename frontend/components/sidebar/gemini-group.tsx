"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bot,
  ChevronRight,
  MessageSquare,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getGeminiProjects,
  getGeminiSessions,
  GeminiProject,
  GeminiSession,
  deleteGeminiSession,
} from "@/lib/gemini-api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GeminiGroup({
  activeProject,
  activeSession,
  onSelectProject,
  onSelectSession,
  onNewChat,
}: {
  activeProject: string | null;
  activeSession: string | null;
  onSelectProject: (id: string) => void;
  onSelectSession: (id: string) => void;
  onNewChat: (projectId: string) => void;
}) {
  const [projects, setProjects] = useState<GeminiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionsMap, setSessionsMap] = useState<
    Record<string, GeminiSession[]>
  >({});
  const [loadingSessions, setLoadingSessions] = useState<
    Record<string, boolean>
  >({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    project: string;
    session: GeminiSession;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const p = await getGeminiProjects();
        setProjects(p);
      } catch (e) {
        console.error("Failed to load Gemini projects:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 2. Auto-load sessions for active project on mount if needed
  useEffect(() => {
    if (
      activeProject &&
      !sessionsMap[activeProject] &&
      !loadingSessions[activeProject]
    ) {
      const load = async () => {
        setLoadingSessions((prev) => ({ ...prev, [activeProject]: true }));
        try {
          const s = await getGeminiSessions(activeProject);
          setSessionsMap((prev) => ({ ...prev, [activeProject]: s }));
        } catch (e) {
          console.error(
            "Failed to load Gemini sessions for active project:",
            e,
          );
        } finally {
          setLoadingSessions((prev) => ({ ...prev, [activeProject]: false }));
        }
      };
      load();
    }
  }, [activeProject, sessionsMap, loadingSessions]);

  const toggleProject = useCallback(
    async (projectId: string) => {
      const currentlyExpanded =
        expanded[projectId] ?? activeProject === projectId;
      const isExpanding = !currentlyExpanded;
      setExpanded((prev) => ({ ...prev, [projectId]: isExpanding }));

      if (isExpanding && !sessionsMap[projectId]) {
        setLoadingSessions((prev) => ({ ...prev, [projectId]: true }));
        try {
          const s = await getGeminiSessions(projectId);
          setSessionsMap((prev) => ({ ...prev, [projectId]: s }));
        } catch (e) {
          console.error("Failed to load Gemini sessions:", e);
        } finally {
          setLoadingSessions((prev) => ({ ...prev, [projectId]: false }));
        }
      }
    },
    [expanded, sessionsMap, activeProject],
  );

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const ok = await deleteGeminiSession(
        deleteTarget.project,
        deleteTarget.session.id,
      );
      if (ok) {
        // Refresh sessions for this project
        const s = await getGeminiSessions(deleteTarget.project);
        setSessionsMap((prev) => ({ ...prev, [deleteTarget.project]: s }));
        // If the session was active, notify parent or keep it as is (view might check)
      }
    } catch (e) {
      console.error("Failed to delete Gemini session:", e);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  if (loading && projects.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className='p-2 space-y-2'>
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
            <SidebarMenuSkeleton showIcon />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (projects.length === 0) {
    return (
      <div className='px-4 py-8 text-center bg-muted/5 rounded-xl border border-dashed border-border/50 mx-2'>
        <p className='text-[10px] text-muted-foreground mb-3 leading-relaxed'>
          No Gemini projects found in ~/.gemini
        </p>
      </div>
    );
  }

  return (
    <>
      <SidebarMenu>
        {projects.map((project) => (
          <SidebarMenuItem key={project.id}>
            <Collapsible
              open={expanded[project.id] ?? activeProject === project.id}
              onOpenChange={() => toggleProject(project.id)}
              className='group/collapsible'
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={project.displayName}
                  isActive={project.id === activeProject}
                  className='text-xs pr-2!'
                >
                  <Bot className='shrink-0' />
                  <span className='flex-1 truncate min-w-0'>
                    {project.displayName}
                  </span>
                  <span className='ml-auto flex h-4 w-4 shrink-0 items-center justify-center'>
                    <ChevronRight className='h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                  </span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {loadingSessions[project.id] ? (
                    <SidebarMenuSubItem>
                      <SidebarMenuSkeleton showIcon />
                    </SidebarMenuSubItem>
                  ) : !sessionsMap[project.id] ||
                    sessionsMap[project.id].length === 0 ? (
                    <SidebarMenuSubItem>
                      <span className='px-2 py-1 text-[10px] text-sidebar-foreground/40 italic'>
                        No sessions
                      </span>
                    </SidebarMenuSubItem>
                  ) : (
                    sessionsMap[project.id].map((session) => (
                      <SidebarMenuSubItem
                        key={session.id}
                        className='group/conv relative'
                      >
                        <SidebarMenuSubButton
                          isActive={session.id === activeSession}
                          onClick={() => {
                            onSelectProject(project.id);
                            onSelectSession(session.id);
                          }}
                          className='text-xs peer pr-8'
                        >
                          <MessageSquare className='h-3 w-3 shrink-0 opacity-60' />
                          <span className='truncate min-w-0'>
                            {session.summary || session.displayId}
                          </span>
                        </SidebarMenuSubButton>
                        <SidebarMenuAction
                          className='top-1/2! -translate-y-1/2! opacity-100 sm:opacity-0 sm:group-hover/conv:opacity-100 text-sidebar-foreground/30 hover:text-destructive hover:bg-destructive/10'
                          title='Delete chat'
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({ project: project.id, session });
                          }}
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </SidebarMenuAction>
                      </SidebarMenuSubItem>
                    ))
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gemini Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;
              {deleteTarget?.session.summary}&rdquo;? This will permanently
              remove the history from your computer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
