import http from "node:http";
import { routeMockRequest } from "./mockAgent.js";

const port = Number(process.env.PORT || 8791);

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    setCors(response);
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    const result = routeMockRequest({
      method: request.method || "GET",
      path: url.pathname,
      query: Object.fromEntries(url.searchParams),
      body: await readJsonBody(request)
    });

    setCors(response);
    response.writeHead(result.status, result.headers);
    response.end(result.body);
  } catch (error) {
    setCors(response);
    response.writeHead(400, { "content-type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: error.message || "Invalid mock request" }));
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Mock Agent API listening on http://0.0.0.0:${port}`);
});

function readJsonBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Request body must be valid JSON"));
      }
    });
    request.on("error", reject);
  });
}

function setCors(response) {
  response.setHeader("access-control-allow-origin", "*");
  response.setHeader("access-control-allow-methods", "GET,POST,OPTIONS");
  response.setHeader("access-control-allow-headers", "content-type");
}
