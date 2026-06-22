import { routeMockRequest } from "../apps/mock-agent/mockAgent.js";

export default function handler(request, response) {
  const pathParts = Array.isArray(request.query.path)
    ? request.query.path
    : [request.query.path].filter(Boolean);
  const path = `/${pathParts.join("/")}`;
  const query = { ...request.query };
  delete query.path;

  const result = routeMockRequest({
    method: request.method || "GET",
    path,
    query,
    body: request.body || {}
  });

  for (const [name, value] of Object.entries(result.headers)) {
    response.setHeader(name, value);
  }
  response.setHeader("cache-control", "no-store");
  response.status(result.status).send(result.body);
}
