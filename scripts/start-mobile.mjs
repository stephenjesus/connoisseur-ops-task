#!/usr/bin/env node
import { spawn } from "node:child_process";

console.log(`
📱 Mobile testing (ngrok/Expo tunnel is unreliable — use LAN + API tunnel):

  Terminal 1:  pnpm web
  Terminal 2:  pnpm tunnel        ← keeps public API URL alive; updates apps/mobile/.env
  Terminal 3:  pnpm mobile        ← scan QR in Expo Go (phone + Mac on same Wi‑Fi)

If the QR code still fails, use the operator page in your phone browser:
  https://<tunnel-url>/operator   (printed when pnpm tunnel starts)

Login: operator@demo.com / password123
`);

const child = spawn("pnpm", ["--filter", "@connoisseur/mobile", "start"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));
