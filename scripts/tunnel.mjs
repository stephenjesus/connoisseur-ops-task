#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const port = process.argv[2] ?? "3000";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileEnv = path.join(root, "apps/mobile/.env");
const webEnv = path.join(root, "apps/web/.env.local");

function upsertEnv(filePath, updates) {
  let content = existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}="${value}"`;
    const regex = new RegExp(`^${key}=.*$`, "m");
    content = regex.test(content)
      ? content.replace(regex, line)
      : `${content.replace(/\n?$/, "\n")}${line}\n`;
  }
  writeFileSync(filePath, content);
}

const nets = networkInterfaces();
const lanIp =
  Object.values(nets)
    .flat()
    .find((n) => n?.family === "IPv4" && !n.internal)?.address ?? "YOUR_MAC_IP";

console.log("\n📱 Phone browser:");
console.log(`   https://<tunnel-url>/operator`);
console.log(`   (same Wi‑Fi fallback: http://${lanIp}:${port}/operator)`);
console.log("\n   Login: operator@demo.com / password123\n");
console.log("Starting public tunnel…\n");

const lt = spawn(
  "npx",
  ["--yes", "localtunnel", "--port", port, "--print-requests"],
  { stdio: ["inherit", "pipe", "inherit"], shell: true },
);

let tunnelUrl = "";

lt.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  process.stdout.write(text);
  const match = text.match(/https:\/\/[^\s]+\.loca\.lt/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[0];
    const host = new URL(tunnelUrl).hostname;
    upsertEnv(mobileEnv, { EXPO_PUBLIC_API_URL: tunnelUrl });
    upsertEnv(webEnv, { DEV_TUNNEL_HOST: host });
    console.log("\n✅ Updated env files");
    console.log(`   Operator: ${tunnelUrl}/operator`);
    console.log(`   DEV_TUNNEL_HOST=${host}`);
    console.log("\n⚠️  Restart pnpm web (Ctrl+C then pnpm web) so Next.js allows this tunnel host.");
    console.log("\n📋 On phone — if sign-in fails, open the tunnel URL first:");
    console.log(`   ${tunnelUrl}`);
    console.log("   Tap “Click to Continue”, enter your public IP if asked, then open /operator\n");
  }
});

lt.on("exit", (code) => process.exit(code ?? 0));
