// Custom Next.js server.
//
// Next 16's built-in dev server tears down the socket.io connection that
// `pages/api/socket/io.ts` used to attach (clients loop on "transport close"
// and never receive an event). Creating the HTTP server ourselves and
// attaching socket.io to it before Next takes over fixes that.
//
// This file does NOT go through the Next compiler — plain CommonJS only.

// `npm start` passes --prod. Set this before requiring next, which reads
// NODE_ENV on import. (Avoids needing cross-env on Windows.)
if (process.argv.includes("--prod")) {
  process.env.NODE_ENV = "production";
}

const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT || "3000", 10);
// Deliberately HOST, not HOSTNAME: containers (Railway, Render, Docker) set
// HOSTNAME to the container id, which is not an address we can serve on.
// listen() below is left unbound so it accepts traffic on all interfaces.
const hostname = process.env.HOST || (dev ? "localhost" : "0.0.0.0");

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const SOCKET_PATH = "/api/socket/io";

app.prepare().then(() => {
  // Only valid after prepare().
  const upgradeHandler = app.getUpgradeHandler();

  // Registered as a "request" listener before socket.io attaches, so engine.io
  // caches it and forwards every non-socket request back to Next.
  const httpServer = createServer((req, res) => handler(req, res));

  const io = new Server(httpServer, {
    path: SOCKET_PATH,
    addTrailingSlash: false,
    // Leave upgrades we don't own alone — Next's HMR websocket is one of them.
    destroyUpgrade: false,
  });

  // The API routes emit via `res.socket.server.io`. `res.socket.server` is this
  // httpServer, so hanging `io` here is what makes those emits reach clients.
  httpServer.io = io;

  httpServer.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith(SOCKET_PATH)) {
      upgradeHandler(req, socket, head);
    }
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port} (dev: ${dev})`);
  });
});
