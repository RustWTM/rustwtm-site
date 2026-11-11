// Run only when importing updated, verified product screenshots.
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
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
const previous = JSON.parse(await readFile("src/data/screenshots.json", "utf8"));
const captures = new Map(
  previous.captures.map((capture) => [
    capture.name,
    {
      ...capture,
      version: capture.version ?? previous.version,
      commit: capture.commit ?? previous.commit,
    },
  ]),
);
await mkdir("public/screenshots", { recursive: true });
for (const name of names) {
  const path = `screenshots/${name}.png`;
  const input = git("show", `${commit}:${path}`);
  const info = await sharp(input).metadata();
  await sharp(input).webp({ quality: 90, effort: 6 }).toFile(`public/screenshots/${name}.webp`);
  captures.set(name, {
    name,
    version,
    commit,
    source: path,
    sha256: createHash("sha256").update(input).digest("hex"),
    width: info.width,
    height: info.height,
  });
}
await writeFile(
  "src/data/screenshots.json",
  JSON.stringify({ schemaVersion: 2, captures: [...captures.values()] }, null, 2) + "\n",
);
console.log(
  `Prepared ${names.length} product screenshots from ${version} (${commit}); preserved other captures.`,
);
