import { createServer } from "node:http";
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
  realpathSync,
  existsSync,
} from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { proofs } from "../plugins/just-vibe/scripts/lib/proof.mjs";

const project = process.argv[2];
if (!project)
  throw Error(
    "Usage: node scripts/smoke-browser.mjs PROJECT_WITH_PLAYWRIGHT_AND_CHROMIUM",
  );
const root = realpathSync(project),
  directory = mkdtempSync(join(root, ".jv-browser-smoke-"));
const cli = fileURLToPath(new URL("../bin/just-vibe.mjs", import.meta.url));
const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(
    '<!doctype html><title>Dialog fixture</title><button id="open">Open</button><dialog id="dialog"><label>Name <input id="name"></label><button id="done">Done</button></dialog><output id="result"></output><button id="async">Load</button><div id="status">Loading</div><input id="async-focus"><script>const d=document.querySelector("dialog"),o=document.querySelector("#open");o.onclick=()=>{d.showModal();document.querySelector("#name").focus()};document.querySelector("#done").onclick=()=>{document.querySelector("#result").textContent=document.querySelector("#name").value;d.close();o.focus()};document.querySelector("#async").onclick=()=>{document.title="Loading";history.replaceState({},"","/");document.querySelector("#status").textContent="Loading";document.querySelector("#async").focus();setTimeout(()=>{document.title="Done";history.replaceState({},"","/done");document.querySelector("#status").textContent="Done";document.querySelector("#async-focus").focus()},300)};</script>',
  );
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const url = `http://127.0.0.1:${server.address().port}`;
const proofId = `browser-smoke-${process.pid}`;
const steps = [
  { action: "click", selector: "#open" },
  { action: "visible", selector: "#dialog" },
  { action: "focused", selector: "#name" },
  { action: "fill", selector: "#name", value: "A readable result" },
  { action: "click", selector: "#done" },
  { action: "hidden", selector: "#dialog" },
  { action: "focused", selector: "#open" },
  { action: "text", selector: "#result", value: "A readable result" },
];
async function run(plan) {
  const file = join(directory, "steps.json");
  writeFileSync(file, JSON.stringify({ steps: plan }));
  const child = spawn(
    process.execPath,
    [
      cli,
      "evidence",
      "browser",
      "--root",
      root,
      "--url",
      url,
      "--steps",
      relative(root, file),
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (d) => {
    stdout += d;
  });
  child.stderr.on("data", (d) => {
    stderr += d;
  });
  const status = await new Promise((done, fail) => {
    child.on("close", done);
    child.on("error", fail);
  });
  assert.ok(stdout, stderr);
  return { status, report: JSON.parse(stdout) };
}
try {
  const positive = await run(steps);
  assert.equal(positive.status, 0);
  assert.equal(positive.report.result, "passed");
  assert.equal(positive.report.steps.length, 8);
  const delayedSteps = [
    { action: "text", selector: "#status", value: "Done" },
    { action: "url", value: "/done" },
    { action: "title", value: "Done" },
    { action: "focused", selector: "#async-focus" },
  ].flatMap(assertion => [{ action: "click", selector: "#async" }, assertion]);
  const delayed = await run(delayedSteps);
  assert.equal(delayed.status, 0);
  assert.equal(delayed.report.result, "passed");
  assert.equal(delayed.report.steps.length, 8);
  const negative = await run([{ action: "title", value: "Wrong title" }]);
  assert.equal(negative.status, 2);
  assert.equal(negative.report.result, "failed");
  const stepPath = relative(root, join(directory, "steps.json")).replaceAll(
    "\\",
    "/",
  );
  writeFileSync(join(directory, "steps.json"), JSON.stringify({ steps }));
  let proof = await proofs(root, "create", proofId, {
    revision: 0,
    title: "Dialog acceptance evidence",
    criteria: [
      {
        id: "dialog",
        text: "Open, edit and close the dialog with focus restored",
        kind: "automated",
        files: [stepPath],
      },
    ],
  });
  proof = await proofs(root, "collect", proofId, {
    revision: proof.revision,
    criterion: "dialog",
    collector: "browser",
    options: { url, steps: stepPath, screenshots: true },
  });
  assert.equal(proof.result, "verified");
  assert.equal(proof.criteria[0].evidence.artifacts.length, 8);
  const report = await proofs(root, "report", proofId);
  assert.ok(existsSync(report.path));
  const require = createRequire(join(root, "package.json"));
  let playwright;
  try {
    playwright = require("playwright");
  } catch {
    playwright = require("@playwright/test");
  }
  const browser = await playwright.chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(report.path).href);
    assert.equal(await page.locator("img").count(), 8);
    assert.equal(
      await page
        .locator("img")
        .evaluateAll((images) =>
          images.every((i) => i.complete && i.naturalWidth > 0),
        ),
      true,
    );
    await page.screenshot({
      path: join(root, "proof-report-smoke.png"),
      fullPage: false,
    });
  } finally {
    await browser.close();
  }
  console.log(
    "Real proof collection: eight hashed screenshots, verified criterion, self-contained HTML and eight rendered images passed. Report viewport saved in the test project.",
  );
  console.log(
    "Real Chromium: dialog open/close, input, visible/hidden, focus return and text assertions passed. Deliberately wrong title failed with exit 2.",
  );
  console.log("Real Chromium: delayed text, URL, title and focus assertions all passed after 300 ms updates.");
} finally {
  await new Promise((done) => server.close(done));
  rmSync(directory, { recursive: true, force: true });
  rmSync(join(root, ".just-vibe/proofs", proofId), {
    recursive: true,
    force: true,
  });
  rmSync(join(root, ".just-vibe/proofs", `${proofId}.json`), { force: true });
  rmSync(join(root, ".just-vibe/reports", `proof-${proofId}.html`), {
    force: true,
  });
}
