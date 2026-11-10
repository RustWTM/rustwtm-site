"use client";
import { useState } from "react";
import { Icon } from "./icons";
export function Governor() {
  const [mode, setMode] = useState("dry");
  const mobileDiagram = (
    <svg
      className="governor-mobile"
      viewBox="0 0 320 390"
      role="img"
      aria-label="Sustained load triggers a policy check. Foreground applications are protected. Configured background actions progress from lower priority to efficiency mode and a CPU cap."
    >
      <path d="M160 30V365" stroke="var(--border-strong)" />
      <path className="flow-pulse" d="M160 30V365" stroke="var(--accent)" strokeDasharray="5 13" />
      <text x="160" y="23" textAnchor="middle" className="diagram-label">
        SUSTAINED LOAD → POLICY CHECK
      </text>
      <rect
        x="35"
        y="50"
        width="250"
        height="62"
        rx="4"
        fill="var(--surface)"
        stroke="var(--green)"
      />
      <text x="160" y="77" textAnchor="middle" className="diagram-main">
        Protect the foreground app
      </text>
      <text x="160" y="97" textAnchor="middle" className="diagram-small">
        and its child processes
      </text>
      {["Lower priority", "Efficiency mode", "CPU cap"].map((label, i) => (
        <g key={label}>
          <rect
            x="50"
            y={142 + i * 78}
            width="220"
            height="54"
            rx="4"
            fill="var(--surface)"
            stroke={mode === "enforce" ? "var(--accent)" : "var(--border-strong)"}
          />
          <text x="68" y={174 + i * 78} className="diagram-small">
            0{i + 1}
          </text>
          <text x="101" y={174 + i * 78} className="diagram-main">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
  return (
    <div className="governor-figure animated-figure">
      <div className="figure-topline">
        <span className="mono">
          <span className="status-dot" />
          THE GOVERNOR
        </span>
        <span className="mini-tag">ILLUSTRATED WORKFLOW</span>
      </div>
      <div className="governor-toggle" role="group" aria-label="Illustrate a governor mode">
        <button aria-pressed={mode === "dry"} onClick={() => setMode("dry")}>
          Dry-run
        </button>
        <button aria-pressed={mode === "enforce"} onClick={() => setMode("enforce")}>
          Enforcing
        </button>
      </div>
      <svg
        className="governor-svg"
        viewBox="0 0 600 330"
        role="img"
        aria-label={`Governor workflow: sustained system load, protect the foreground app, lower priority, enable efficiency mode, then apply a CPU cap. ${mode === "dry" ? "Dry-run logs the decisions." : "Enforcing applies configured steps and rolls them back after recovery."}`}
      >
        <defs>
          <marker
            id="flow-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M0 0 10 5 0 10z" fill="var(--muted)" />
          </marker>
        </defs>
        <path
          className="flow-line"
          d="M50 73H550M300 73V119M300 173V218M150 245H450"
          fill="none"
          stroke="var(--border-strong)"
          strokeWidth="1.5"
        />
        <path
          className="flow-pulse"
          d="M50 73H300V119M300 173V218"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeDasharray="5 13"
        />
        <circle cx="50" cy="73" r="5" fill="var(--accent)" />
        <text x="50" y="40" className="diagram-label">
          SUSTAINED SYSTEM LOAD
        </text>
        <text x="550" y="40" textAnchor="end" className="diagram-label">
          POLICY CHECK
        </text>
        <rect
          x="178"
          y="119"
          width="244"
          height="54"
          rx="4"
          fill="var(--surface)"
          stroke="var(--green)"
        />
        <text x="300" y="143" textAnchor="middle" className="diagram-main">
          Protect the foreground app
        </text>
        <text x="300" y="161" textAnchor="middle" className="diagram-small">
          and its child processes
        </text>
        {[
          { x: 55, label: "Lower priority", n: "01" },
          { x: 225, label: "Efficiency mode", n: "02" },
          { x: 395, label: "CPU cap", n: "03" },
        ].map((step) => (
          <g key={step.n}>
            <rect
              x={step.x}
              y="218"
              width="150"
              height="74"
              rx="4"
              fill="var(--surface)"
              stroke={mode === "enforce" ? "var(--accent)" : "var(--border-strong)"}
            />
            <text x={step.x + 16} y="243" className="diagram-small">
              {step.n}
            </text>
            <text x={step.x + 16} y="270" className="diagram-main">
              {step.label}
            </text>
          </g>
        ))}
        <path d="M205 255h16m154 0h16" markerEnd="url(#flow-arrow)" stroke="var(--muted)" />
      </svg>
      {mobileDiagram}
      <div className={`governor-verdict ${mode}`} aria-live="polite">
        <Icon name={mode === "dry" ? "file" : "shield"} size={19} />
        <div>
          <strong>
            {mode === "dry"
              ? "Observe the decision. Keep control."
              : "Apply in stages. Roll back on recovery."}
          </strong>
          <p>
            {mode === "dry"
              ? "Automatic decisions are logged, without applying process changes."
              : "Configured protection acts on eligible background processes."}
          </p>
        </div>
      </div>
      <p className="figure-disclaimer">
        An explanation of the service. This website does not monitor or change your PC.
      </p>
    </div>
  );
}
