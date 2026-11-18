// Zero-dependency local server for the included production build.
// It forwards /api to the backend and falls back to index.html for React Router URLs.
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(root, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const dist = path.join(root, "dist");
if (!fs.existsSync(path.join(dist, "index.html"))) {
  console.error(
    "Production build not found. Run npm ci and npm run build first.",
  );
  process.exit(1);
}
const target = new URL(process.env.BACKEND_URL || "http://127.0.0.1:8080");
if (
  !["http:", "https:"].includes(target.protocol) ||
  target.username ||
  target.password
)
  throw new Error("BACKEND_URL must be an HTTP(S) origin without credentials.");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
};
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
    const headers = { ...req.headers, host: target.host };
    // This is a same-origin browser-to-frontend connection. The hop to Java is server-to-server.
    delete headers.origin;
    const upstreamUrl = new URL(target);
    upstreamUrl.pathname = url.pathname;
    upstreamUrl.search = url.search;
    const upstream = (target.protocol === "https:" ? https : http).request(
      upstreamUrl,
      { method: req.method, headers, timeout: 65000 },
      (response) => {
        res.writeHead(response.statusCode, response.headers);
        response.pipe(res);
      },
    );
    upstream.on("timeout", () =>
      upstream.destroy(new Error("Backend timeout")),
    );
    upstream.on("error", () => {
      if (!res.headersSent)
        res.writeHead(502, { "Content-Type": "application/json" });
      if (!res.writableEnded)
        res.end(
          JSON.stringify({
            status: 502,
            message:
              "The loan backend is unavailable. Start Spring Boot and verify BACKEND_URL.",
          }),
        );
    });
    req.on("aborted", () => upstream.destroy());
    req.pipe(upstream);
    return;
  }
  if (!["GET", "HEAD"].includes(req.method)) {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400);
    res.end("Invalid path");
    return;
  }
  let filename = path.resolve(dist, "." + pathname);
  if (!filename.startsWith(dist + path.sep) && filename !== dist) {
    res.writeHead(403);
    res.end();
    return;
  }
  if (!fs.existsSync(filename) || !fs.statSync(filename).isFile()) {
    if (path.extname(pathname)) {
      res.writeHead(404);
      res.end("File not found");
      return;
    }
    filename = path.join(dist, "index.html");
  }
  res.writeHead(200, {
    "Content-Type": types[path.extname(filename)] || "application/octet-stream",
    "Cache-Control": filename.endsWith("index.html")
      ? "no-store"
      : "public, max-age=3600",
    "X-Content-Type-Options": "nosniff",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(filename).pipe(res);
});
const port = Number(process.env.FRONTEND_PORT || 5173);
server.on("error", (error) => {
  console.error(
    error.code === "EADDRINUSE"
      ? `Port ${port} is already in use. Close the other frontend process or set FRONTEND_PORT.`
      : error.message,
  );
  process.exit(1);
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Nestwell frontend: http://localhost:${port}\nBackend target: ${target.origin}\nPress Ctrl+C to stop.`,
  ),
);
