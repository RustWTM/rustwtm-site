// Run only when importing updated, verified product screenshots.
import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const source = process.argv[2];
if (!source) throw new Error("Usage: node scripts/prepare-assets.mjs <product-checkout>");
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
];
const receipt = [];
await mkdir("public/screenshots", { recursive: true });
for (const name of names) {
  const input = await readFile(`${source}/screenshots/${name}.png`);
  const info = await sharp(input).metadata();
  await sharp(input).webp({ quality: 90, effort: 6 }).toFile(`public/screenshots/${name}.webp`);
  receipt.push({
    name,
    source: `screenshots/${name}.png`,
    sha256: createHash("sha256").update(input).digest("hex"),
    width: info.width,
    height: info.height,
  });
}
await writeFile("src/data/screenshots.json", JSON.stringify(receipt, null, 2) + "\n");
console.log(`Prepared ${receipt.length} product screenshots.`);
