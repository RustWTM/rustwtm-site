"use client";
import { useRef, useState } from "react";
import { Icon } from "./icons";
export function CopyCode({
  code,
  label = "PowerShell",
  note,
}: {
  code: string;
  label?: string;
  note?: string;
}) {
  const [state, setState] = useState("Copy");
  const ref = useRef<HTMLElement>(null);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("Copied");
    } catch {
      setState("Select to copy");
      const selection = window.getSelection();
      if (ref.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }
  return (
    <div className="code-block">
      <div className="code-label">
        <span>
          <Icon name="terminal" size={15} />
          {label}
        </span>
        <button onClick={copy} aria-label={`Copy ${label} code`}>
          <Icon name={state === "Copied" ? "check" : "copy"} size={15} />
          <span aria-live="polite">{state}</span>
        </button>
      </div>
      <pre tabIndex={0}>
        <code ref={ref}>{code}</code>
      </pre>
      {note && <p className="code-note">{note}</p>}
    </div>
  );
}
