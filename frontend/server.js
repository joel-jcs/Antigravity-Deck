// === Custom Next.js server — proxies WebSocket upgrades to Express backend ===
// Required for single-tunnel setups (ngrok etc.) where frontend and backend
// are on different ports but only one can be publicly exposed.
const http = require("http");
const { parse } = require("url");
const next = require("next");
const net = require("net");

const dev = process.env.NODE_ENV !== "production";
const PORT = parseInt(process.env.PORT || (dev ? "3000" : "9808"));
const BE_PORT = parseInt(process.env.BACKEND_PORT || (dev ? "3500" : "9807"));

const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;

      // In DEV mode, proxy /api directly to the backend to bypass tunnel routing issues.
      // This is skipped in PROD to honor the standard Next.js rewrites and tunnels.
      if (dev && pathname.startsWith("/api/")) {
        // Build isolated headers for the backend
        const proxyHeaders = { ...req.headers };

        // CRITICAL: Remove tunnel/proxy headers so the backend treats this as a purely LOCAL request.
        // This ensures --no-auth mode works correctly on your custom tunnel and mobile.
        delete proxyHeaders["x-forwarded-for"];
        delete proxyHeaders["x-real-ip"];

        // Force the host header to reflect the backend instance for internal routing stability.
        proxyHeaders.host = `localhost:${BE_PORT}`;

        const proxyReq = http.request(
          {
            hostname: "localhost",
            port: BE_PORT,
            path: req.url,
            method: req.method,
            headers: proxyHeaders,
            timeout: 5000,
          },
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          },
        );

        proxyReq.on("error", (e) => {
          console.error(`[FE-PROXY] ❌ API error (${pathname}): ${e.message}`);
          res.statusCode = 502;
          res.setHeader("Content-Type", "text/plain");
          res.end(
            `Frontend Proxy: Bad Gateway (Target: localhost:${BE_PORT}, Error: ${e.message})`,
          );
        });

        req.pipe(proxyReq);
        return;
      }

      handle(req, res, parsedUrl);
    });

    server.on("upgrade", (req, socket, head) => {
      const { pathname } = parse(req.url, true);

      // ONLY proxy our application WebSockets.
      // Do NOT touch root (/) or _next paths (HMR/Turbopack)
      if (!pathname.startsWith("/ws/")) {
        return;
      }

      console.log(`[FE-PROXY] ⬆️  Proxying Upgrade: ${pathname}`);

      const target = net.connect(BE_PORT, "127.0.0.1", () => {
        // Build unique headers Map
        const headerMap = new Map();
        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          headerMap.set(req.rawHeaders[i].toLowerCase(), req.rawHeaders[i + 1]);
        }

        headerMap.set("host", `127.0.0.1:${BE_PORT}`);
        headerMap.set("connection", "Upgrade");
        headerMap.set("upgrade", "websocket");

        const existingXFF = headerMap.get("x-forwarded-for");
        headerMap.set(
          "x-forwarded-for",
          existingXFF
            ? `${existingXFF}, ${req.socket.remoteAddress}`
            : req.socket.remoteAddress,
        );

        let raw = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
        for (const [key, val] of headerMap.entries()) {
          raw += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${val}\r\n`;
        }
        raw += "\r\n";

        target.write(raw);
        target.write(head);

        socket.pipe(target);
        target.pipe(socket);
      });

      const cleanup = () => {
        try {
          target.destroy();
        } catch (e) {}
        try {
          socket.destroy();
        } catch (e) {}
      };

      target.on("error", (e) => {
        console.error(`[FE-PROXY] ❌ BE error: ${e.message}`);
        cleanup();
      });
      socket.on("error", () => cleanup());
      target.on("close", cleanup);
      socket.on("close", cleanup);
    });

    server.listen(PORT, () => {
      console.log(
        `  > Frontend ready on http://localhost:${PORT} (BE proxy → :${BE_PORT})`,
      );
    });
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
