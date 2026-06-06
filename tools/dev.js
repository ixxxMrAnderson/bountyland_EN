import { spawn } from "node:child_process";

const processes = [
  spawn("node", ["apps/api/src/server.js"], {
    stdio: "inherit",
    env: { ...process.env, API_PORT: process.env.API_PORT || "8787" }
  }),
  spawn("node", ["apps/web/server.js"], {
    stdio: "inherit",
    env: { ...process.env, WEB_PORT: process.env.WEB_PORT || "5173" }
  })
];

for (const child of processes) {
  child.on("exit", (code) => {
    if (code && code !== 0) {
      shutdown(code);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function shutdown(code) {
  for (const child of processes) {
    child.kill("SIGTERM");
  }
  process.exit(code);
}
