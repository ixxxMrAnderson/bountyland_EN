import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = Number(process.env.WEB_PORT || 5173);
const root = path.dirname(fileURLToPath(import.meta.url));

const contentTypes = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const relativePath = url.pathname === "/" ? "/index.html" : url.pathname;
    const absolutePath = path.join(root, relativePath);
    const file = await fs.readFile(absolutePath);
    const extension = path.extname(absolutePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extension] || "application/octet-stream"
    });
    response.end(file);
  } catch {
    response.writeHead(404, {
      "Content-Type": "text/plain"
    });
    response.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Web listening on http://localhost:${port}`);
});
