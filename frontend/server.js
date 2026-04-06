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

      // Unified API Proxy: Redirects all /api requests directly to the Express backend.
      // Increases timeout (300s) to allow Gemini CLI to complete long thinking sessions
      // without being cut off by the tunnel.
      if (pathname.startsWith("/api/")) {
        const proxyHeaders = { ...req.headers };

        // Remove tunnel/proxy headers to ensure the backend treats this as a local request (bypasses auth)
        delete proxyHeaders["x-forwarded-for"];
        delete proxyHeaders["x-real-ip"];
        proxyHeaders.host = `localhost:${BE_PORT}`;

        const proxyReq = http.request(
          {
            hostname: "localhost",
            port: BE_PORT,
            path: req.url,
            method: req.method,
            headers: proxyHeaders,
            timeout: 300000, // 5 minutes (Gemini "Thinking" buffer)
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
      if (!pathname.startsWith("/ws/")) {
        return;
      }

      console.log(`[FE-PROXY] ⬆️  Proxying Upgrade: ${pathname}`);

      // We use 'localhost' to match the backend's own preferred address (IPv6 or IPv4 fallback)
      const target = net.connect(BE_PORT, "localhost", () => {
        const headerMap = new Map();
        for (let i = 0; i < req.rawHeaders.length; i += 2) {
          headerMap.set(req.rawHeaders[i].toLowerCase(), req.rawHeaders[i + 1]);
        }

        headerMap.set("host", `localhost:${BE_PORT}`);
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
