export const devices = {
  cpu: {
    label: "CPU",
    model: "Example 16-core processor",
    color: "cpu",
    values: [
      ["Utilization", "32%"],
      ["Speed", "5.10 GHz"],
      ["Logical processors", "32"],
    ],
    details: [
      ["Cores / threads", "16 / 32"],
      ["Scope", "Whole system"],
    ],
    base: 35,
  },
  memory: {
    label: "Memory",
    model: "64 GB DDR5 · Example system",
    color: "memory",
    values: [
      ["In use", "24.6 GB"],
      ["Available", "39.4 GB"],
      ["Speed", "5600 MT/s"],
    ],
    details: [
      ["Slots used", "2 / 4"],
      ["Form factor", "DIMM"],
    ],
    base: 42,
  },
  disk: {
    label: "Storage",
    model: "Example NVMe SSD · 2 TB",
    color: "disk",
    values: [
      ["Active time", "18%"],
      ["Temperature", "42 °C"],
      ["Endurance left", "97%"],
    ],
    details: [
      ["Storage health", "Healthy"],
      ["Power-on time", "1,842 hours"],
    ],
    base: 24,
  },
  network: {
    label: "Network",
    model: "Example 2.5 GbE adapter",
    color: "network",
    values: [
      ["Receive", "72.0 MB/s"],
      ["Send", "4.5 MB/s"],
      ["Link speed", "2.5 Gbps"],
    ],
    details: [
      ["Adapter status", "Connected"],
      ["Measurements", "Receive / send"],
    ],
    base: 53,
  },
};
export const packages = [
  { id: "Example.Editor", name: "Example Editor", from: "2.4.0", to: "2.5.0" },
  { id: "Example.Terminal", name: "Example Terminal", from: "1.8.1", to: "1.9.0" },
  { id: "Example.Notes", name: "Example Notes", from: "3.0.0", to: "3.0.2" },
];
export function readings(base, offset = 0) {
  return Array.from({ length: 61 }, (_, i) =>
    Math.max(
      3,
      Math.min(95, base + Math.sin((i + offset) / 6) * 12 + Math.sin((i + offset) / 2.4) * 6),
    ),
  );
}
export function chartPoints(values) {
  return values
    .map(
      (v, i) =>
        `${((i * 600) / Math.max(1, values.length - 1)).toFixed(2)},${(150 - Math.max(0, Math.min(100, v)) * 1.5).toFixed(2)}`,
    )
    .join(" ");
}
export function reviewedPackages(ids) {
  const valid = new Set(ids);
  return packages.filter((p) => valid.has(p.id));
}
export function previewRule(threshold) {
  const value = Number(threshold);
  if (!Number.isFinite(value) || value < 5 || value > 90) throw new Error("Invalid CPU threshold");
  return [
    { name: "compiler.exe", cpu: 42 },
    { name: "indexer.exe", cpu: 28 },
    { name: "backup.exe", cpu: 12 },
  ].filter((p) => p.cpu > value);
}
