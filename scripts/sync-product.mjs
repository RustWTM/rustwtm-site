import { spawnSync } from "node:child_process";
import { appendFile, readFile } from "node:fs/promises";
import { readJsonResponse } from "./lib/product-content.mjs";
if (process.env.GITHUB_ACTIONS !== "true")
  throw new Error("This commit helper is restricted to an isolated GitHub Actions checkout.");
function git(args, allowFailure = false) {
  const result = spawnSync("git", args, {
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0 && !allowFailure)
    throw new Error(`Git operation failed: ${result.stderr}`);
  return result;
}
const force = process.env.FORCE_REBUILD === "true";
async function publicationPending() {
  const config = JSON.parse(await readFile("config/product.json", "utf8"));
  const snapshot = JSON.parse(await readFile("src/data/release.json", "utf8"));
  const url = new URL("/updates.json", config.domain);
  if (url.protocol !== "https:") throw new Error("Live product receipt requires HTTPS.");
  // An older edge cache entry must not hide a successful deployment.
  url.searchParams.set("check", String(Date.now()));
  const response = await fetch(url, {
    headers: { Accept: "application/json", "Cache-Control": "no-cache" },
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Live product receipt returned ${response.status}.`);
  const live = await readJsonResponse(response, 4096);
  if (
    live?.schemaVersion !== snapshot.schemaVersion ||
    live.repositoryId !== snapshot.repositoryId ||
    !/^[a-f\d]{64}$/.test(live.contentHash)
  )
    throw new Error("Invalid live product receipt.");
  return live.contentHash !== snapshot.contentHash;
}
for (let attempt = 1; attempt <= 3; attempt++) {
  // Only this ephemeral automation branch is reset; user workspaces never run this helper.
  git(["fetch", "origin", "main", "--depth=1"]);
  git(["switch", "-C", "product-content-sync", "FETCH_HEAD"]);
  const refreshed = spawnSync(process.execPath, ["scripts/refresh-release.mjs", "--strict"], {
    stdio: "inherit",
    timeout: 90000,
  });
  if (refreshed.status !== 0)
    throw new Error("Product synchronization failed; no snapshot was published.");
  git(["add", "--", "src/data/release.json"]);
  const changed = git(["diff", "--cached", "--quiet"], true).status === 1;
  if (changed || force) {
    git(["config", "user.name", "github-actions[bot]"]);
    git(["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
    git([
      "commit",
      ...(force ? ["--allow-empty"] : []),
      "-m",
      "chore(site): synchronize product releases and changelog",
    ]);
    const pushed = git(["push", "origin", "HEAD:main"], true);
    if (pushed.status !== 0) {
      if (attempt === 3) throw new Error(`Content push failed: ${pushed.stderr}`);
      continue;
    }
  }
  const sha = git(["rev-parse", "HEAD"]).stdout.trim();
  const deployRequested = changed || force || process.env.CONTENT_CHECK_ONLY !== "true";
  const pending = !deployRequested && (await publicationPending());
  const publish = deployRequested || pending;
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `changed=${changed}\npublish=${publish}\nsha=${sha}\n`,
    );
  console.log(
    changed
      ? `Product snapshot committed: ${sha}`
      : force
        ? "Explicit rebuild requested."
        : pending
          ? "The live site is behind the committed snapshot. Retrying publication."
          : "No product content changes.",
  );
  break;
}
