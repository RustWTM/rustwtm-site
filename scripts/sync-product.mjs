import { spawnSync } from "node:child_process";
import { appendFile } from "node:fs/promises";
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
  const publish = changed || force || process.env.CONTENT_CHECK_ONLY !== "true";
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
        : "No product content changes.",
  );
  break;
}
