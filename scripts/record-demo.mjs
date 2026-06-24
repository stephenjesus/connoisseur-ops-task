#!/usr/bin/env node
/**
 * Records one combined demo video: manager web + operator mobile + sync.
 * Requires: pnpm web running.
 * Output: demo/connoisseur-ops-demo.mp4
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "demo");
const baseUrl = process.env.DEMO_URL ?? "http://localhost:3000";
const finalMp4 = path.join(outDir, "connoisseur-ops-demo.mp4");
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(root, "node_modules", ".playwright-browsers");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const FONT = "/System/Library/Fonts/Supplemental/Arial.ttf";

function runFfmpeg(args) {
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

function ensurePlaywrightBrowsers() {
  const result = spawnSync("pnpm", ["exec", "playwright", "install", "chromium"], {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH },
  });
  if (result.status !== 0) {
    throw new Error("Failed to install Playwright browsers. Run: pnpm playwright:install");
  }
}

function makeTitleCard(title, subtitle, output, duration = 2.5) {
  const t = title.replace(/'/g, "");
  const s = subtitle.replace(/'/g, "");
  const vf = [
    `drawtext=fontfile='${FONT}':text='${t}':fontsize=44:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-28`,
    `drawtext=fontfile='${FONT}':text='${s}':fontsize=22:fontcolor=0x94a3b8:x=(w-text_w)/2:y=(h-text_h)/2+28`,
  ].join(",");
  runFfmpeg([
    "-y", "-f", "lavfi", "-i", `color=c=0x0f172a:s=1280x720:d=${duration}:r=25`,
    "-vf", vf,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "25", "-an",
    output,
  ]);
}

function normalizeSegment(src, out, label, isMobile) {
  const badge = label.replace(/:/g, "\\:").replace(/'/g, "");
  const base = isMobile
    ? "scale=420:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x0f172a"
    : "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0f172a";
  const vf = `${base},drawtext=fontfile='${FONT}':text='${badge}':fontsize=20:fontcolor=white:box=1:boxcolor=0x4f46e5@0.9:boxborderw=8:x=24:y=24`;
  runFfmpeg([
    "-y", "-i", src, "-vf", vf,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "25", "-an",
    out,
  ]);
}

async function loginManager(page) {
  await page.goto(`${baseUrl}/login`);
  await sleep(1200);
  await page.getByLabel("Email").fill("manager@demo.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await sleep(2000);
}

async function main() {
  let chromium;
  let devices;
  try {
    ({ chromium, devices } = await import("playwright"));
  } catch {
    spawnSync("pnpm", ["add", "-D", "playwright", "-w"], { cwd: root, stdio: "inherit" });
    ({ chromium, devices } = await import("playwright"));
  }

  ensurePlaywrightBrowsers();

  console.log("Resetting demo data…");
  spawnSync("pnpm", ["db:seed"], { cwd: root, stdio: "inherit" });

  mkdirSync(outDir, { recursive: true });
  for (const f of readdirSync(outDir)) {
    if (/\.(webm|mp4|txt)$/.test(f) && f !== "connoisseur-ops-demo.mp4") {
      unlinkSync(path.join(outDir, f));
    }
  }

  console.log(`\n🎬 Recording combined demo from ${baseUrl}\n`);

  const browser = await chromium.launch({ headless: true });
  const raw = [];

  const introCtx = await browser.newContext({
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const intro = await introCtx.newPage();
  await loginManager(intro);
  await intro.evaluate(() => window.scrollBy({ top: 300, behavior: "smooth" }));
  await sleep(2500);
  raw.push({ path: await intro.video()?.path(), label: "Manager Web", mobile: false });
  await introCtx.close();

  const mobileCtx = await browser.newContext({
    ...devices["iPhone 13"],
    recordVideo: { dir: outDir, size: { width: 390, height: 844 } },
  });
  const operator = await mobileCtx.newPage();
  await operator.goto(`${baseUrl}/operator`);
  await sleep(1200);
  await operator.getByLabel("Email").fill("operator@demo.com");
  await operator.getByLabel("Password").fill("password123");
  await operator.getByRole("button", { name: "Sign in" }).click();
  await sleep(2000);
  await operator.getByRole("button", { name: "BND-0001" }).click();
  await sleep(2000);
  const complete = operator.getByRole("button", { name: /Complete Cutting/i });
  await complete.waitFor({ state: "visible", timeout: 15000 });
  await complete.click();
  await sleep(3000);
  raw.push({ path: await operator.video()?.path(), label: "Operator Mobile", mobile: true });
  await mobileCtx.close();

  const syncCtx = await browser.newContext({
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const sync = await syncCtx.newPage();
  await loginManager(sync);
  await sync.reload();
  await sleep(2500);
  await sync.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
  await sleep(2000);
  await sync.getByRole("link", { name: "Masters" }).click();
  await sync.waitForURL("**/masters");
  await sleep(2500);
  raw.push({ path: await sync.video()?.path(), label: "Live Sync", mobile: false });
  await syncCtx.close();

  await browser.close();

  console.log("\nAssembling single video…\n");

  const titleIntro = path.join(outDir, "title-intro.mp4");
  const titleMobile = path.join(outDir, "title-mobile.mp4");
  const titleSync = path.join(outDir, "title-sync.mp4");
  const titleEnd = path.join(outDir, "title-end.mp4");

  makeTitleCard("Connoisseur Ops", "Garment production tracker", titleIntro);
  makeTitleCard("Operator Floor App", "Mobile scan and stage updates", titleMobile);
  makeTitleCard("Manager Dashboard", "WIP and stock update in real time", titleSync);
  makeTitleCard("Demo complete", "manager@demo.com  |  operator@demo.com", titleEnd, 2);

  const playlist = [titleIntro];
  raw.forEach((seg, i) => {
    if (!seg.path) return;
    const normalized = path.join(outDir, `part-${i}.mp4`);
    normalizeSegment(seg.path, normalized, seg.label, seg.mobile);
    if (i === 1) playlist.push(titleMobile);
    if (i === 2) playlist.push(titleSync);
    playlist.push(normalized);
  });
  playlist.push(titleEnd);

  const listFile = path.join(outDir, "concat.txt");
  writeFileSync(
    listFile,
    playlist.map((s) => `file '${s.replace(/'/g, "'\\''")}'`).join("\n"),
  );

  runFfmpeg([
    "-y", "-f", "concat", "-safe", "0", "-i", listFile,
    "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "25",
    finalMp4,
  ]);

  for (const f of readdirSync(outDir)) {
    if (f !== "connoisseur-ops-demo.mp4" && /\.(webm|mp4|txt)$/.test(f)) {
      unlinkSync(path.join(outDir, f));
    }
  }

  console.log(`\n✅ Single demo video: ${finalMp4}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
