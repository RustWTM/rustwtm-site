import type { CSSProperties } from "react";
type Name =
  | "arrow"
  | "download"
  | "github"
  | "sun"
  | "moon"
  | "monitor"
  | "mouse"
  | "check"
  | "close"
  | "menu"
  | "copy"
  | "expand"
  | "cpu"
  | "memory"
  | "activity"
  | "shield"
  | "terminal"
  | "box"
  | "network"
  | "settings"
  | "file"
  | "external";
const paths: Record<Name, React.ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  github: (
    <>
      <path d="M9 19c-4.3 1.3-4.3-2-6-2m12 5v-4c0-1 .1-1.4-.5-2 3.3-.4 6.5-1.6 6.5-7A5.5 5.5 0 0 0 19.5 5c.2-1 .2-2-.2-3-1.5 0-3.2 1-4 1.5a14 14 0 0 0-6.6 0C7.9 3 6.2 2 4.7 2c-.4 1-.4 2-.2 3A5.5 5.5 0 0 0 3 9c0 5.4 3.2 6.6 6.5 7-.6.6-.5 1.4-.5 2v4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z" />,
  monitor: (
    <>
      <rect x="3" y="3" width="18" height="13" rx="1" />
      <path d="M8 21h8m-4-5v5" />
    </>
  ),
  mouse: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="6" />
      <path d="M12 2v7" />
    </>
  ),
  check: <path d="m5 12 4 4L20 5" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  copy: (
    <>
      <rect x="8" y="8" width="12" height="13" rx="1" />
      <path d="M16 8V3H3v13h5" />
    </>
  ),
  expand: <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />,
  cpu: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="1" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4" />
    </>
  ),
  memory: (
    <>
      <path d="M3 6h18v12H3zM7 10v4m5-4v4m5-4v4M6 18v3m4-3v3m4-3v3m4-3v3" />
    </>
  ),
  activity: <path d="M2 12h5l3-8 4 16 3-8h5" />,
  shield: (
    <>
      <path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  terminal: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="1" />
      <path d="m6 9 3 3-3 3m6 0h5" />
    </>
  ),
  box: (
    <>
      <path d="m12 2 10 5v10l-10 5L2 17V7l10-5ZM2 7l10 5 10-5m-10 5v10M7 4.5l10 5v5" />
    </>
  ),
  network: (
    <>
      <rect x="8" y="2" width="8" height="6" />
      <rect x="2" y="16" width="8" height="6" />
      <rect x="14" y="16" width="8" height="6" />
      <path d="M12 8v4M6 16v-4h12v4" />
    </>
  ),
  settings: (
    <>
      <path d="M4 4v16m8-16v16m8-16v16" />
      <path d="M1 8h6m2 8h6m2-10h6" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H4v20h16V8l-6-6Zm0 0v6h6M8 13h8m-8 4h8" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7m0-7L10 14M10 3H3v18h18v-7" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  className,
  style,
}: {
  name: Name;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
export function WindowsIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="m2 4 9-1v8H2V4Zm11-1 9-1v9h-9V3ZM2 13h9v8l-9-1v-7Zm11 0h9v9l-9-1v-8Z" />
    </svg>
  );
}
