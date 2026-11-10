import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat, mkdtemp, mkdir, cp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
const routes = ["", "download", "docs", "privacy", "brand"];
const output = path.resolve("out");
test("both palettes keep text and primary buttons above WCAG AA contrast", async () => {
  const css = await readFile("src/app/globals.css", "utf8");
  const blocks = [
    css.match(/:root\s*\{([\s\S]*?)\}/)[1],
    css.match(/:root\[data-theme="light"\]\s*\{([\s\S]*?)\}/)[1],
  ];
  const luminance = (hex) => {
    if (hex.length === 4)
      hex = "#" + [...hex.slice(1)].map((character) => character.repeat(2)).join("");
    const channels = hex
      .slice(1)
      .match(/\w\w/g)
      .map((value) => parseInt(value, 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const contrast = (a, b) =>
    (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
  for (const block of blocks) {
    const colors = Object.fromEntries(
      [...block.matchAll(/--([\w-]+):\s*(#[\da-f]{3}(?:[\da-f]{3})?);/gi)].map((match) => [
        match[1],
        match[2],
      ]),
    );
    for (const foreground of ["text", "muted", "subtle"])
      for (const background of ["bg", "surface", "surface-raised"])
        assert.ok(
          contrast(colors[foreground], colors[background]) >= 4.5,
          `${foreground} on ${background}`,
        );
    assert.ok(contrast(colors["accent-ink"], colors.accent) >= 4.5, "primary button text");
  }
});
test("every exported page has its own canonical, metadata, social image, main landmark and one h1", async () => {
  for (const route of routes) {
    const html = await readFile(path.join(output, route, "index.html"), "utf8");
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: h1`);
    assert.ok(html.includes('id="main"'), `${route}: main landmark`);
    assert.ok(
      html.includes(`href="https://rustwtm.com/${route ? route + "/" : ""}"`),
      `${route}: canonical`,
    );
    assert.ok(html.includes('property="og:image"'), `${route}: sharing image`);
    assert.match(
      html,
      /property="og:image" content="https:\/\/rustwtm.com\/og.png"/,
      `${route}: new OG image`,
    );
    assert.ok(html.includes('name="description"'), `${route}: description`);
    assert.ok(!html.includes('href="#"'), `${route}: placeholder link`);
  }
});
test("every page shows the Oxog studio link and requested website copyright", async () => {
  for (const route of routes) {
    const html = await readFile(path.join(output, route, "index.html"), "utf8");
    const footer = html.match(/<footer\b[\s\S]*?<\/footer>/)?.[0];
    assert.ok(footer?.includes('href="https://oxog.net"'), `${route}: Oxog destination`);
    assert.ok(footer.includes("Small studio."), `${route}: studio promotion`);
    assert.ok(footer.includes("oxog.net</a>. All rights reserved."), `${route}: copyright`);
    assert.ok(!footer.includes("Ersin KOÇ"), `${route}: superseded footer credit`);
  }
  const png = await readFile(path.join(output, "og.png"));
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});
test("all local page links, anchors, fonts, images and script references resolve in the static export", async () => {
  for (const route of routes) {
    const html = await readFile(path.join(output, route, "index.html"), "utf8");
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      if (!raw.startsWith("/") && !raw.startsWith("#")) continue;
      const url = new URL(raw, `https://rustwtm.com/${route ? route + "/" : ""}`);
      let file = path.join(output, decodeURIComponent(url.pathname));
      if (url.pathname.endsWith("/")) file = path.join(file, "index.html");
      assert.ok((await stat(file)).isFile(), `${route}: missing ${raw}`);
      if (url.hash && file.endsWith(".html")) {
        const target = await readFile(file, "utf8");
        assert.ok(
          target.includes(`id="${decodeURIComponent(url.hash.slice(1))}"`),
          `${route}: missing anchor ${raw}`,
        );
      }
    }
  }
});
test("custom domain, Pages files, sitemap and designed 404 are exported", async () => {
  assert.equal((await readFile(path.join(output, "CNAME"), "utf8")).trim(), "rustwtm.com");
  await stat(path.join(output, ".nojekyll"));
  assert.match(
    await readFile(path.join(output, "sitemap.xml"), "utf8"),
    /https:\/\/rustwtm.com\/download\//,
  );
  assert.match(
    await readFile(path.join(output, "robots.txt"), "utf8"),
    /Sitemap: https:\/\/rustwtm.com\/sitemap.xml/,
  );
  assert.match(await readFile(path.join(output, "404.html"), "utf8"), /NO PROCESS FOUND/);
});
test("release API failure preserves the verified download snapshot", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "rustwtm-release-"));
  try {
    for (const child of ["config", "scripts", "src/data"])
      await mkdir(path.join(directory, child), { recursive: true });
    for (const file of [
      "config/product.json",
      "scripts/refresh-release.mjs",
      "src/data/release.json",
    ])
      await cp(file, path.join(directory, file));
    const before = await readFile(path.join(directory, "src/data/release.json"), "utf8");
    await writeFile(
      path.join(directory, "offline.mjs"),
      "globalThis.fetch = async () => { throw new Error('Offline test fixture') };\n",
    );
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        pathToFileURL(path.join(directory, "offline.mjs")).href,
        path.join(directory, "scripts/refresh-release.mjs"),
      ],
      { cwd: directory, encoding: "utf8", timeout: 10000 },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /Using verified/);
    assert.equal(await readFile(path.join(directory, "src/data/release.json"), "utf8"), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
