import { handleVercelMockRequest } from "../apps/mock-agent/vercelHandler.js";

export default function handler(request, response) {
  return handleVercelMockRequest(request, response, "/health");
}
