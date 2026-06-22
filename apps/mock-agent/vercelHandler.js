import { routeMockRequest } from "./mockAgent.js";

export function handleVercelMockRequest(request, response, path) {
  const result = routeMockRequest({
    method: request.method || "GET",
    path,
    query: request.query || {},
    body: request.body || {}
  });

  for (const [name, value] of Object.entries(result.headers)) {
    response.setHeader(name, value);
  }
  response.setHeader("cache-control", "no-store");
  response.status(result.status).send(result.body);
}
