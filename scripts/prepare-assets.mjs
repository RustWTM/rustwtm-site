// Run only when importing updated, verified product screenshots.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const [source, version] = process.argv.slice(2);
if (!source || !/^v\d+\.\d+\.\d+$/.test(version ?? ""))
  throw new Error("Usage: node scripts/prepare-assets.mjs <product-checkout> <release-tag>");
const git = (...args) => execFileSync("git", args, { cwd: source, maxBuffer: 16 * 1024 * 1024 });
const commit = git("rev-parse", "--verify", `refs/tags/${version}^{commit}`).toString().trim();
const names = [
  "processes",
  "processes-light",
  "performance",
  "overview",
  "events",
  "containers",
  "ports",
  "services",
  "disks",
  "sensors",
  "limits",
  "performance-timeline",
  "process-inspection",
  "governor",
  "device-disk-details",
  "device-gpu-overview",
  "installed-apps",
];
const captures = [];
await mkdir("public/screenshots", { recursive: true });
for (const name of names) {
  const path = `screenshots/${name}.png`;
  const input = git("show", `${commit}:${path}`);
  const info = await sharp(input).metadata();
  await sharp(input).webp({ quality: 90, effort: 6 }).toFile(`public/screenshots/${name}.webp`);
  captures.push({
    name,
    source: path,
    sha256: createHash("sha256").update(input).digest("hex"),
    width: info.width,
    height: info.height,
  });
}
await writeFile(
  "src/data/screenshots.json",
  JSON.stringify({ version, commit, captures }, null, 2) + "\n",
);
console.log(`Prepared ${captures.length} product screenshots from ${version} (${commit}).`);
