import { API_BASE } from "./config";
import { authHeaders } from "./auth";

/**
 * Gemini API Types
 */
export interface GeminiProject {
  id: string;
  displayName: string;
  path: string;
  isNative: boolean;
}

export interface GeminiSession {
  id: string;
  displayId: string;
  summary: string;
  lastModified: string;
  messageCount: number;
}

/**
 * Gemini API Client
 */

/**
 * List all discovered Gemini projects from the host machine.
 */
export async function getGeminiProjects(): Promise<GeminiProject[]> {
  const res = await fetch(`${API_BASE}/api/gemini/projects`, {
    headers: authHeaders(),
  });
  if (!res.ok)
    throw new Error(`Failed to fetch Gemini projects: ${res.status}`);
  const data = await res.json();
  return data.projects || [];
}

/**
 * List all sessions for a specific Gemini project.
 */
export async function getGeminiSessions(
  projectId: string,
): Promise<GeminiSession[]> {
  const res = await fetch(
    `${API_BASE}/api/gemini/projects/${encodeURIComponent(projectId)}/sessions`,
    { headers: authHeaders() },
  );
  if (!res.ok)
    throw new Error(`Failed to fetch Gemini sessions: ${res.status}`);
  const data = await res.json();
  return data.sessions || [];
}

export interface GeminiQuotaBucket {
  modelId: string;
  remainingFraction: number;
  resetTime?: string;
  tokenType?: string;
}

/**
 * Fetch per-model quota directly from Google's Code Assist API.
 */
export async function getGeminiQuota(): Promise<GeminiQuotaBucket[]> {
  const res = await fetch(`${API_BASE}/api/gemini/quota`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch Gemini quota: ${res.status}`);
  const data = await res.json();
  return data.buckets || [];
}

/**
 * Run /stats via the CLI and return the parsed response.
 */
export async function getGeminiStats(
  cwd?: string,
): Promise<{ response: string; stats?: unknown }> {
  const params = cwd ? `?cwd=${encodeURIComponent(cwd)}` : "";
  const res = await fetch(`${API_BASE}/api/gemini/stats${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to fetch Gemini stats: ${res.status}`);
  return res.json();
}

interface GeminiCliMessage {
  type: "user" | "model";
  content: string | { text: string }[];
}

/**
 * Get messages/history for a specific Gemini session.
 */
export async function getGeminiHistory(
  projectId: string,
  sessionId: string,
): Promise<{ role: "user" | "gemini"; content: string }[]> {
  const res = await fetch(
    `${API_BASE}/api/gemini/projects/${encodeURIComponent(projectId)}/sessions/${encodeURIComponent(sessionId)}`,
    { headers: authHeaders() },
  );
  if (!res.ok) throw new Error(`Failed to fetch Gemini history: ${res.status}`);
  const data = await res.json();

  // Convert CLI message format to Deck format if needed
  // CLI uses { type: 'user', content: [{ text: '...' }] } or { type: 'model' }
  // Deck uses { role: 'user' | 'gemini', content: '...' }
  return (data.messages || []).map((m: GeminiCliMessage) => {
    let content = "";
    if (Array.isArray(m.content)) {
      content = m.content.map((c: { text: string }) => c.text || "").join("\n");
    } else {
      content = (m.content as string) || "";
    }

    return {
      role: m.type === "user" ? "user" : "gemini",
      content: content,
    };
  });
}
