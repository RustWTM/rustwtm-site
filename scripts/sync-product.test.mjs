import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, cp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { buildSnapshot } from "./lib/product-content.mjs";

function git(cwd, ...args) {
  const result = spawnSync("git", args, { cwd, encoding: "utf8", timeout: 15000 });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
async function setup(t) {
  const root = await mkdtemp(path.join(tmpdir(), "rustwtm-sync-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const remote = path.join(root, "remote.git"),
    seed = path.join(root, "seed"),
    checkout = path.join(root, "checkout");
  await mkdir(seed);
  git(root, "init", "--bare", remote);
  git(seed, "init", "-b", "main");
  git(seed, "config", "user.name", "Test fixture");
  git(seed, "config", "user.email", "test@example.invalid");
  await mkdir(path.join(seed, "scripts/lib"), { recursive: true });
  await mkdir(path.join(seed, "config"));
  await mkdir(path.join(seed, "src/data"), { recursive: true });
  for (const file of [
    "scripts/refresh-release.mjs",
    "scripts/sync-product.mjs",
    "scripts/lib/product-content.mjs",
    "scripts/lib/website-media.mjs",
  ])
    await cp(file, path.join(seed, file));
  const repository = "Fixture/Product",
    tag = "v1.2.3",
    names = [
      "RustWTM-1.2.3-x64.msi",
      "RustWTM-1.2.3-x64.msi.sha256",
      "rustwtm-x86_64-pc-windows-msvc.zip",
      "rustwtm-x86_64-pc-windows-msvc.zip.sha256",
    ];
  const input = {
    identity: { id: 42, full_name: repository, default_branch: "main" },
    latest: {
      tag_name: tag,
      published_at: "2026-11-10T00:00:00Z",
      html_url: `https://github.com/${repository}/releases/tag/${tag}`,
      body: "Original notes",
      assets: names.map((name) => ({
        name,
        size: 123,
        browser_download_url: `https://github.com/${repository}/releases/download/${tag}/${name}`,
      })),
    },
    releases: [],
    changelog: {
      type: "file",
      encoding: "base64",
      size: 30,
      sha: "a".repeat(40),
      html_url: `https://github.com/${repository}/blob/main/CHANGELOG.md`,
      content: Buffer.from("## [Unreleased]\nA future change.").toString("base64"),
    },
  };
  await writeFile(
    path.join(seed, "config/product.json"),
    JSON.stringify({ repository, repositoryId: 42, domain: "https://fixture.example" }),
  );
  await writeFile(
    path.join(seed, "src/data/release.json"),
    JSON.stringify(buildSnapshot(input), null, 2) + "\n",
  );
  git(seed, "add", ".");
  git(seed, "commit", "-m", "Fixture baseline");
  git(seed, "remote", "add", "origin", remote);
  git(seed, "push", "origin", "main");
  git(root, "clone", "-b", "main", remote, checkout);
  input.latest.body = "Updated official notes";
  const fixture = path.join(root, "fixture.json"),
    preload = path.join(root, "api.mjs"),
    output = path.join(root, "outputs.txt");
  await writeFile(fixture, JSON.stringify(input));
  await writeFile(
    preload,
    `import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const data = JSON.parse(fs.readFileSync(process.env.SYNC_FIXTURE, 'utf8'));
globalThis.fetch = async (url, options) => {
  const target = new URL(url);
  if (target.pathname === '/updates.json') {
    if (target.origin !== 'https://fixture.example' || options.headers.Authorization)
      throw new Error('Live receipt must be public and use the configured domain');
    if (process.env.SYNC_LIVE_FAIL === '1') return new Response('{}', {status: 503});
    const receipt = JSON.parse(fs.readFileSync('src/data/release.json', 'utf8'));
    if (process.env.SYNC_LIVE_STALE === '1') receipt.contentHash = 'f'.repeat(64);
    return Response.json(receipt);
  }
  if (process.env.SYNC_FAIL === '1') return new Response('{}', {status: 503});
  if (process.env.SYNC_RACE === '1' && target.pathname.includes('/contents/') && !fs.existsSync(process.env.SYNC_MARKER)) {
    fs.writeFileSync(process.env.SYNC_MARKER, '1');
    fs.writeFileSync(process.env.SYNC_SEED + '/concurrent.txt', 'Preserve this edit');
    execFileSync('git', ['add','concurrent.txt'], {cwd: process.env.SYNC_SEED});
    execFileSync('git', ['commit','-m','Concurrent edit'], {cwd: process.env.SYNC_SEED});
    execFileSync('git', ['push','origin','main'], {cwd: process.env.SYNC_SEED, stdio: 'pipe'});
  }
  const value = target.pathname.includes('/repositories/') ? data.identity
    : target.pathname.endsWith('/releases/latest') ? data.latest
    : target.pathname.endsWith('/releases') ? data.releases : data.changelog;
  return Response.json(value);
};`,
  );
  const run = (extra = {}) =>
    spawnSync(process.execPath, ["scripts/sync-product.mjs"], {
      cwd: checkout,
      encoding: "utf8",
      timeout: 30000,
      env: {
        ...process.env,
        GITHUB_ACTIONS: "true",
        CONTENT_CHECK_ONLY: "true",
        GITHUB_OUTPUT: output,
        NODE_OPTIONS: `--import=${pathToFileURL(preload).href}`,
        SYNC_FIXTURE: fixture,
        SYNC_SEED: seed,
        SYNC_MARKER: path.join(root, "race-done"),
        ...extra,
      },
    });
  return { root, remote, seed, checkout, output, run };
}
test("automation commits changed content once, skips unchanged work and preserves the snapshot on API failure", async (t) => {
  const f = await setup(t),
    before = git(f.root, "--git-dir", f.remote, "rev-parse", "main");
  const first = f.run();
  assert.equal(first.status, 0, first.stderr);
  const after = git(f.root, "--git-dir", f.remote, "rev-parse", "main");
  assert.notEqual(after, before);
  assert.equal(
    JSON.parse(git(f.root, "--git-dir", f.remote, "show", "main:src/data/release.json")).history[0]
      .body,
    "Updated official notes",
  );
  assert.match(await readFile(f.output, "utf8"), /publish=true/);
  await writeFile(f.output, "");
  const second = f.run();
  assert.equal(second.status, 0, second.stderr);
  assert.equal(git(f.root, "--git-dir", f.remote, "rev-parse", "main"), after);
  assert.match(await readFile(f.output, "utf8"), /publish=false/);
  const failed = f.run({ SYNC_FAIL: "1" });
  assert.notEqual(failed.status, 0);
  assert.equal(git(f.root, "--git-dir", f.remote, "rev-parse", "main"), after);
});
test("automation retries a concurrent push and retains the other writer’s edit", async (t) => {
  const f = await setup(t);
  const result = f.run({ SYNC_RACE: "1" });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    git(f.root, "--git-dir", f.remote, "show", "main:concurrent.txt"),
    "Preserve this edit",
  );
  assert.equal(
    JSON.parse(git(f.root, "--git-dir", f.remote, "show", "main:src/data/release.json")).history[0]
      .body,
    "Updated official notes",
  );
});
test("a failed publication is retried even after its snapshot was committed", async (t) => {
  const f = await setup(t);
  const first = f.run();
  assert.equal(first.status, 0, first.stderr);
  const committed = git(f.root, "--git-dir", f.remote, "rev-parse", "main");
  await writeFile(f.output, "");

  const retry = f.run({ SYNC_LIVE_STALE: "1" });
  assert.equal(retry.status, 0, retry.stderr);
  assert.match(await readFile(f.output, "utf8"), /changed=false\npublish=true/);
  assert.equal(git(f.root, "--git-dir", f.remote, "rev-parse", "main"), committed);

  await writeFile(f.output, "");
  const unavailable = f.run({ SYNC_LIVE_FAIL: "1" });
  assert.notEqual(unavailable.status, 0);
  assert.match(unavailable.stderr, /Live product receipt returned 503/);
  assert.equal(await readFile(f.output, "utf8"), "");
});
test("commit helper refuses to run in an ordinary local workspace", () => {
  const result = spawnSync(process.execPath, ["scripts/sync-product.mjs"], {
    encoding: "utf8",
    timeout: 10000,
    env: { ...process.env, GITHUB_ACTIONS: "false" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /isolated GitHub Actions checkout/);
});
