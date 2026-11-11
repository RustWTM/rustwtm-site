export type ReleaseHighlight = {
  kind: string;
  icon: "settings" | "activity" | "shield" | "file";
  title: string;
  text: string;
};
function plain(value: string) {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
export function releaseHighlights(markdown: string): ReleaseHighlight[] {
  const bullets: { kind: string; raw: string }[] = [];
  let kind = "Release",
    fence = "",
    current: { kind: string; raw: string } | undefined;
  for (const line of markdown.replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      fence = fence ? "" : marker[1];
      current = undefined;
      continue;
    }
    if (fence) continue;
    const heading = line.match(
      /^#{2,4}\s+(Added|Changed|Fixed|Security|Removed|Deprecated|Improved)\b/i,
    );
    if (heading) {
      kind = heading[1][0].toUpperCase() + heading[1].slice(1).toLowerCase();
      current = undefined;
      continue;
    }
    if (/^#{1,4}\s/.test(line)) {
      current = undefined;
      continue;
    }
    const bullet = line.match(/^[-*+]\s+(.+)/);
    if (bullet) {
      current = { kind, raw: bullet[1] };
      bullets.push(current);
    } else if (current && /^\s+\S/.test(line)) current.raw += " " + line.trim();
    else if (line.trim()) current = undefined;
  }
  if (!bullets.length)
    return [
      {
        kind: "Release",
        icon: "file",
        title: "A new stable release",
        text: plain(markdown) || "Read the complete release notes for the latest changes.",
      },
    ];
  return bullets.slice(0, 3).map(({ kind, raw }) => {
    const text = plain(raw);
    const explicit = raw.match(/^\*\*([^*]+)\*\*[:.\s]*/);
    const sentence = text.match(/^.*?(?:[.!?](?=\s|$)|$)/)?.[0] ?? text;
    const noun = sentence.match(
      /^(.{5,76}?)\s+(?:opens?|supports?|adds?|shows?|lets?|provides?|keeps?|uses?|can|now)\b/i,
    );
    const title = explicit
      ? plain(explicit[1]).replace(/:$/, "")
      : noun
        ? noun[1].replace(/^(?:A|An|The)\s+/i, "").replace(/^\w/, (c) => c.toUpperCase())
        : sentence.length <= 90
          ? sentence
          : sentence.slice(0, 84).replace(/\s+\S*$/, "") + "…";
    return {
      kind,
      icon:
        kind === "Fixed" || kind === "Security"
          ? "shield"
          : kind === "Changed" || kind === "Improved"
            ? "activity"
            : kind === "Removed" || kind === "Deprecated"
              ? "file"
              : "settings",
      title,
      text: explicit ? plain(raw.slice(explicit[0].length)) || text : text,
    };
  });
}
