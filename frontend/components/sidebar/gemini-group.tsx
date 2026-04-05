"use client";

import { useState, useEffect, useCallback } from "react";
import { Bot, ChevronRight, MessageSquare, Loader2, Plus } from "lucide-react";
import {
  getGeminiProjects,
  getGeminiSessions,
  GeminiProject,
  GeminiSession,
} from "@/lib/gemini-api";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarMenuSkeleton,
  SidebarMenuAction,
} from "@/components/ui/sidebar";

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

  const toggleProject = useCallback(
    async (projectId: string) => {
      const isExpanding = !expanded[projectId];
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
    [expanded, sessionsMap],
  );

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
    <SidebarMenu>
      {projects.map((project) => (
        <SidebarMenuItem key={project.id}>
          <Collapsible
            open={expanded[project.id] || activeProject === project.id}
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
            <SidebarMenuAction
              onClick={(e) => {
                e.stopPropagation();
                onNewChat(project.id);
              }}
              className='hover:bg-primary/20 hover:text-primary transition-colors'
              title='New Chat'
            >
              <Plus className='h-3.5 w-3.5' />
            </SidebarMenuAction>
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
                    <SidebarMenuSubItem key={session.id}>
                      <SidebarMenuSubButton
                        isActive={session.id === activeSession}
                        onClick={() => {
                          onSelectProject(project.id);
                          onSelectSession(session.id);
                        }}
                        className='text-xs'
                      >
                        <MessageSquare className='h-3 w-3 shrink-0 opacity-60' />
                        <span className='truncate min-w-0'>
                          {session.summary || session.displayId}
                        </span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))
                )}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
