import { readFileSync, writeFileSync, renameSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { commandInvocation } from "./lib/command.mjs";
import { redact } from "./lib/process.mjs";

// Owned worker, not a general shell daemon. It stops on its token file, expiry,
// or child exit; no later process is killed by a stored PID from another session.
const file = process.argv[2],
  config = JSON.parse(readFileSync(file, "utf8")),
  directory = dirname(file);
let child,
  output = "",
  state = "starting",
  exitCode = null,
  stopping = false;
const persist = () => {
  const temp = join(directory, "status.tmp");
  writeFileSync(
    temp,
    JSON.stringify({
      token: config.token,
      pid: process.pid,
      state,
      exitCode,
      output,
      updatedAt: new Date().toISOString(),
    }),
    { mode: 0o600 },
  );
  renameSync(temp, join(directory, "status.json"));
};
function stop() {
  if (stopping) return;
  stopping = true;
  state = "stopping";
  persist();
  if (!child) {
    finish();
    return;
  }
  try {
    if (process.platform === "win32") {
      const kill = spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
      kill.on("error", () => child?.kill());
    } else process.kill(-child.pid, "SIGKILL");
  } catch {
    child?.kill("SIGKILL");
  }
}
function finish() {
  state = stopping ? "stopped" : exitCode === 0 ? "exited" : "failed";
  child = null;
  persist();
  clearInterval(timer);
  clearTimeout(expiry);
}
const timer = setInterval(() => {
  if (
    existsSync(join(directory, "stop")) &&
    readFileSync(join(directory, "stop"), "utf8") === config.token
  )
    stop();
  else persist();
}, 500);
const expiry = setTimeout(stop, config.minutes * 60000);
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
try {
  const [binary, args] = commandInvocation(
    config.command[0],
    config.command.slice(1),
  );
  child = spawn(binary, args, {
    cwd: config.cwd,
    shell: false,
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: String(config.port),
      NO_COLOR: "1",
    },
  });
  child.on("spawn", () => {
    state = "running";
    persist();
  });
  for (const pipe of [child.stdout, child.stderr])
    pipe.on("data", (bytes) => {
      output = redact((output + bytes.toString()).slice(-32768));
    });
  child.on("error", (error) => {
    output = redact(error.message);
    exitCode = 1;
  });
  child.on("close", (code) => {
    exitCode = code;
    finish();
  });
} catch (error) {
  output = redact(error.message);
  exitCode = 1;
  finish();
}
