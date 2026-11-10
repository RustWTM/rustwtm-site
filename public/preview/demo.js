import {
  devices,
  packages,
  readings,
  chartPoints,
  reviewedPackages,
  previewRule,
} from "./model.mjs";
const $ = (id) => document.getElementById(id);
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = {
  page: "devices",
  device: "cpu",
  tick: 0,
  paused: reduced,
  selected: new Set(),
  threshold: 25,
  action: "Efficiency mode",
  review: "",
};
const pages = {
  devices: ["DEVICE INSIGHTS", "A closer look at your hardware."],
  apps: ["APPLICATION MANAGEMENT", "Updates, with a clear identity."],
  history: ["RECORDED ACTIVITY", "Follow a moment in time."],
  rules: ["RESOURCE PROTECTION", "Preview. Understand. Decide."],
};
function chart(base) {
  const points = chartPoints(readings(base, state.tick));
  return `<svg class="chart" viewBox="0 0 600 150" preserveAspectRatio="none" role="img" aria-label="Simulated resource usage over sixty seconds"><polygon points="0,150 ${points} 600,150"/><polyline points="${points}"/></svg><div class="chart-caption"><span>60 seconds · simulated data</span><span>Now</span></div>`;
}
function say(message) {
  $("status").textContent = message;
}
function drawDevices() {
  const d = devices[state.device];
  $("content").style.setProperty("--resource", `var(--${d.color})`);
  $("content").innerHTML =
    `<div class="device-switch" aria-label="Device selection">${Object.entries(devices)
      .map(
        ([key, d]) =>
          `<button data-device="${key}" aria-pressed="${key === state.device}">${d.label}</button>`,
      )
      .join(
        "",
      )}</div><div class="device-model"><strong>${d.model}</strong><span class="muted">Example device</span></div><div class="metric-row">${d.values.map(([name, value]) => `<div class="metric"><small>${name}</small><strong>${value}</strong></div>`).join("")}</div>${chart(d.base)}${d.details.map(([key, value]) => `<div class="detail-row"><span>${key}</span><span>${value}</span></div>`).join("")}`;
}
function drawApps() {
  $("content").innerHTML =
    `<div class="package-toolbar"><span class="muted">3 example updates · Exact package IDs</span><button id="review-updates">Review selection</button></div>${packages.map((p) => `<div class="package-row"><label><input type="checkbox" data-package="${p.id}" ${state.selected.has(p.id) ? "checked" : ""}><span>${p.name}<small>${p.from} → ${p.to}</small></span></label><code>${p.id}</code></div>`).join("")}<p class="callout">The desktop workflow checks source, identity and versions again before requesting an installer. In this preview, you can review a simulated selection.</p>`;
}
function drawHistory() {
  $("content").style.setProperty("--resource", "var(--cpu)");
  $("content").innerHTML =
    `<div class="metric-row"><div class="metric"><small>CPU at selected moment</small><strong>68%</strong></div><div class="metric"><small>Memory in use</small><strong>24.6 GB</strong></div><div class="metric"><small>Recorded contributors</small><strong>3</strong></div></div>${chart(48)}<div class="detail-row"><span>Largest CPU contributor</span><span>compiler.exe · 42%</span></div><div class="detail-row"><span>Nearby protection action</span><span>Efficiency mode applied</span></div><p class="callout">Readings and nearby actions give context. They do not establish why a spike happened.</p><button id="review-snapshot">Review example snapshot</button>`;
}
function drawRules() {
  $("content").innerHTML =
    `<div class="rule-field"><label for="threshold">CPU above <output id="threshold-value">${state.threshold}%</output></label><input id="threshold" type="range" min="5" max="90" value="${state.threshold}"></div><div class="rule-field"><label for="action">When usage persists</label><select id="action"><option ${state.action === "Efficiency mode" ? "selected" : ""}>Efficiency mode</option><option ${state.action === "Lower priority" ? "selected" : ""}>Lower priority</option></select></div><p class="muted small">Example condition: CPU usage persists for 10 seconds. Matching uses the simulated readings below.</p><div class="callout" id="rule-matches"></div><div class="hero-actions"><button id="review-rule">Review example rule</button></div><p class="muted small">Simulation runs no system actions. The desktop application supports additional actions and explicit configuration review.</p>`;
  ruleMatches();
}
function ruleMatches() {
  const matches = previewRule(state.threshold);
  $("threshold-value").textContent = `${state.threshold}%`;
  $("rule-matches").textContent = matches.length
    ? `${matches.length} matching programs: ${matches.map((p) => `${p.name} (${p.cpu}%)`).join(", ")}. Proposed action: ${state.action}.`
    : "No simulated programs exceed this threshold.";
}
function render() {
  const [kicker, title] = pages[state.page];
  $("page-kicker").textContent = kicker;
  $("page-title").textContent = title;
  $("panel").setAttribute("aria-labelledby", `tab-${state.page}`);
  $("content").style.removeProperty("--resource");
  document.querySelectorAll("[role=tab]").forEach((tab) => {
    const active = tab.dataset.page === state.page;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  ({ devices: drawDevices, apps: drawApps, history: drawHistory, rules: drawRules })[state.page]();
}
function review(kind, text) {
  state.review = kind;
  $("review-detail").textContent = text;
  $("review").returnValue = "";
  $("review").showModal();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.page) {
    state.page = button.dataset.page;
    render();
    say(`${pages[state.page][1]} Preview only.`);
  } else if (button.dataset.device) {
    state.device = button.dataset.device;
    drawDevices();
    say(`Showing ${devices[state.device].label} example readings.`);
  } else if (button.id === "theme") {
    const light = document.documentElement.dataset.theme !== "light";
    document.documentElement.dataset.theme = light ? "light" : "dark";
    button.textContent = light ? "Dark mode" : "Light mode";
  } else if (button.id === "pause") {
    state.paused = !state.paused;
    button.textContent = state.paused ? "Resume animation" : "Pause animation";
  } else if (button.id === "review-updates") {
    const selected = reviewedPackages(state.selected);
    if (!selected.length) {
      say("Select at least one example update.");
      return;
    }
    review("updates", selected.map((p) => `${p.id}: ${p.from} → ${p.to}`).join("\n"));
  } else if (button.id === "review-snapshot") {
    review(
      "snapshot",
      "Example moment: CPU 68%, memory 24.6 GB. Contributor: compiler.exe, CPU 42%. Nearby event: efficiency mode applied. All values are simulated.",
    );
  } else if (button.id === "review-rule") {
    review(
      "rule",
      `Example condition: CPU above ${state.threshold}% for 10 seconds. Action: ${state.action}. ${previewRule(state.threshold).length} simulated programs match.`,
    );
  }
});
document.addEventListener("change", (event) => {
  if (event.target.dataset.package) {
    const id = event.target.dataset.package;
    if (!packages.some((p) => p.id === id)) return;
    event.target.checked ? state.selected.add(id) : state.selected.delete(id);
    say(`${state.selected.size} example updates selected.`);
  } else if (event.target.id === "action") {
    state.action = event.target.value;
    ruleMatches();
  }
});
document.addEventListener("input", (event) => {
  if (event.target.id === "threshold") {
    state.threshold = Number(event.target.value);
    ruleMatches();
  }
});
document.querySelector("[role=tablist]").addEventListener("keydown", (event) => {
  const tabs = [...document.querySelectorAll("[role=tab]")];
  const current = tabs.indexOf(document.activeElement);
  if (current < 0) return;
  let next;
  if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (current + 1) % tabs.length;
  else if (["ArrowUp", "ArrowLeft"].includes(event.key))
    next = (current + tabs.length - 1) % tabs.length;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = tabs.length - 1;
  else return;
  event.preventDefault();
  tabs[next].click();
  tabs[next].focus();
});
$("review").addEventListener("close", () => {
  say(
    $("review").returnValue === "confirm"
      ? "Simulation confirmed. No system changes were made."
      : "Review closed. No changes were made.",
  );
});
setInterval(() => {
  if (state.paused || document.hidden || !["devices", "history"].includes(state.page)) return;
  state.tick++;
  const svg = document.querySelector("#content .chart");
  if (!svg) return;
  const points = chartPoints(
    readings(state.page === "devices" ? devices[state.device].base : 48, state.tick),
  );
  svg.querySelector("polyline").setAttribute("points", points);
  svg.querySelector("polygon").setAttribute("points", `0,150 ${points} 600,150`);
}, 1000);
$("pause").textContent = state.paused ? "Resume animation" : "Pause animation";
render();
