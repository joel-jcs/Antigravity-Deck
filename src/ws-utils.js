const { AUTH_KEY, isNoAuth } = require("./config");

/**
 * handleWsAuth
 * Shared utility to handle WebSocket authentication consistently.
 * Bypasses if isNoAuth is set or if the connection is local.
 * Note: Should be called as the first step in a "connection" listener.
 */
function handleWsAuth(ws, req, loggerName = "[WS]") {
  if (isNoAuth) return true;
  if (!AUTH_KEY) return true;

  const ip = req.socket.remoteAddress || "";
  const isLocal =
    ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";

  // skip for localhost connections — same policy as HTTP
  if (isLocal) return true;

  const url = new URL(req.url, "http://localhost");
  const key = url.searchParams.get("auth_key");

  if (key !== AUTH_KEY) {
    console.warn(`${loggerName} Auth failed for ${ip}`);
    ws.close(4401, "Unauthorized");
    return false;
  }

  return true;
}

/**
 * setupWsHeartbeat
 * Modern heartbeat mechanism to keep connections alive (e.g. through ngrok/Cloudflare).
 * Sets up a ping/pong mechanism on a per-WebSocket basis.
 */
function setupWsHeartbeat(ws, intervalMs = 30000) {
  ws.isAlive = true;
  ws.on("pong", () => {
    ws.isAlive = true;
  });

  const timer = setInterval(() => {
    if (ws.readyState !== 1) {
      // 1 = OPEN
      clearInterval(timer);
      return;
    }
    if (ws.isAlive === false) {
      console.log("[WS-Heartbeat] Zombie connection detected, terminating.");
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  }, intervalMs);

  ws.on("close", () => clearInterval(timer));
  ws.on("error", () => clearInterval(timer));
}

module.exports = { handleWsAuth, setupWsHeartbeat };
