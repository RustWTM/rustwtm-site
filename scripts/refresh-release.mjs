import { readFile, writeFile, rename, unlink } from "node:fs/promises";
import { buildSnapshot, fetchJson, validCachedSnapshot } from "./lib/product-content.mjs";
const config = JSON.parse(
  await readFile(new URL("../config/product.json", import.meta.url), "utf8"),
);
const destination = new URL("../src/data/release.json", import.meta.url);
let cached;
try {
  cached = JSON.parse(await readFile(destination, "utf8"));
} catch {}
if (process.env.RUSTWTM_CONTENT_OFFLINE === "1") {
  validCachedSnapshot(cached, config);
  console.log(`Using verified ${cached.version} snapshot without network access.`);
} else {
  try {
    const options = { token: process.env.GITHUB_TOKEN };
    const identity = await fetchJson(
      `https://api.github.com/${config.repositoryId ? `repositories/${config.repositoryId}` : `repos/${config.repository}`}`,
      options,
    );
    const base = `https://api.github.com/repos/${identity.full_name}`;
    const latest = await fetchJson(`${base}/releases/latest`, options);
    const releases = await fetchJson(`${base}/releases?per_page=20`, options);
    const changelog = await fetchJson(
      `${base}/contents/CHANGELOG.md?ref=${encodeURIComponent(identity.default_branch)}`,
      options,
    );
    const snapshot = buildSnapshot({
      identity,
      latest,
      releases,
      changelog,
      previous: cached,
      expectedId: config.repositoryId,
    });
    const bytes = JSON.stringify(snapshot, null, 2) + "\n";
    const existing = cached ? JSON.stringify(cached, null, 2) + "\n" : "";
    if (bytes !== existing) {
      const temporary = new URL(`../src/data/.release-${process.pid}.tmp`, import.meta.url);
      try {
        await writeFile(temporary, bytes, { flag: "wx" });
        await rename(temporary, destination);
      } finally {
        await unlink(temporary).catch((error) => {
          if (error.code !== "ENOENT") throw error;
        });
      }
      console.log(
        `Product content refreshed: ${snapshot.version}, changelog ${snapshot.changelog.sha.slice(0, 7)}.`,
      );
    } else console.log(`Product content unchanged: ${snapshot.version}.`);
  } catch (error) {
    if (process.argv.includes("--strict")) throw error;
    validCachedSnapshot(cached, config);
    console.warn(`Using verified ${cached.version} release snapshot (${error.message}).`);
  }
}
