"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
import { ResourceField } from "./resource-field";
import { links } from "@/lib/product";

type Theme = "light" | "dark" | "system";
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme>("system");
  const [motion, setMotion] = useState(false);
  const [appearance, setAppearance] = useState(false);
  const [menu, setMenu] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const themeButton = useRef<HTMLButtonElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  useEffect(() => {
    const saved = document.documentElement.dataset.preference as Theme;
    if (["light", "dark", "system"].includes(saved)) setTheme(saved);
    setMotion(document.documentElement.dataset.motion === "on");
    const query = matchMedia("(prefers-color-scheme: dark)");
    const applySystem = () => {
      if (document.documentElement.dataset.preference === "system")
        document.documentElement.dataset.theme = query.matches ? "dark" : "light";
    };
    query.addEventListener("change", applySystem);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const applyReduced = () => {
      if (reduced.matches) {
        setMotion(false);
        document.documentElement.dataset.motion = "off";
      }
    };
    reduced.addEventListener("change", applyReduced);
    return () => {
      query.removeEventListener("change", applySystem);
      reduced.removeEventListener("change", applyReduced);
    };
  }, []);
  useEffect(() => {
    if (!motion) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle("in-view", entry.isIntersecting);
      },
      { rootMargin: "80px" },
    );
    document
      .querySelectorAll(".animated-figure, .section-heading, .capability, .toolbox-grid article")
      .forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motion, pathname]);
  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMenu(false);
    };
    const desktop = matchMedia("(min-width: 600px)");
    const resize = () => {
      if (desktop.matches) setMenu(false);
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    desktop.addEventListener("change", resize);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
      desktop.removeEventListener("change", resize);
    };
  }, [menu]);
  useEffect(() => {
    if (!appearance) return;
    const outside = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !themeButton.current?.contains(event.target as Node)
      )
        setAppearance(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAppearance(false);
        themeButton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    panel.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [appearance]);
  function selectTheme(value: Theme) {
    setTheme(value);
    document.documentElement.dataset.preference = value;
    document.documentElement.dataset.theme =
      value === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : value;
    try {
      localStorage.setItem("rustwtm-theme", value);
    } catch {}
  }
  function toggleMotion() {
    const enabled = !motion;
    setMotion(enabled);
    document.documentElement.dataset.motion = enabled ? "on" : "off";
    try {
      localStorage.setItem("rustwtm-motion", enabled ? "on" : "off");
    } catch {}
  }
  return (
    <>
      <ResourceField enabled={motion} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header" ref={header}>
        <div className="container header-inner">
          <Link href="/" aria-label="RustWTM home" className="brand">
            <img src="/brand/rustwtm-icon.svg" width="36" height="36" alt="" />
            <span>
              Rust<span className="brand-wtm">WTM</span>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/#features">Features</Link>
            <Link href="/#screenshots">The workspace</Link>
            <Link href="/docs/">Documentation</Link>
          </nav>
          <div className="header-actions">
            <div className="theme-wrap">
              <button
                ref={themeButton}
                className="icon-button"
                aria-label="Choose color theme"
                aria-expanded={appearance}
                aria-controls="appearance-panel"
                onClick={() => {
                  setMenu(false);
                  setAppearance(!appearance);
                }}
                title="Choose color theme"
              >
                <Icon name={theme === "light" ? "sun" : theme === "dark" ? "moon" : "monitor"} />
              </button>
              {appearance && (
                <div ref={panel} className="appearance-panel" id="appearance-panel">
                  <strong>Appearance</strong>
                  <p>Make yourself at home.</p>
                  <fieldset>
                    <legend className="sr-only">Color theme</legend>
                    <div className="theme-options">
                      {(["light", "dark", "system"] as Theme[]).map((value) => (
                        <label key={value} className={`theme-option ${value}`}>
                          <input
                            type="radio"
                            name="theme"
                            value={value}
                            checked={theme === value}
                            onChange={() => selectTheme(value)}
                          />
                          <span className="theme-preview">
                            <span className="preview-sidebar" />
                            <span className="preview-lines" />
                            <span className="theme-check">
                              <Icon name="check" size={12} />
                            </span>
                            <Icon
                              name={
                                value === "light" ? "sun" : value === "dark" ? "moon" : "monitor"
                              }
                              size={17}
                            />
                          </span>
                          <span>{value[0].toUpperCase() + value.slice(1)}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="appearance-note">
                    {theme === "system"
                      ? "Follows your device’s appearance."
                      : `${theme === "dark" ? "A little less light. Just as much clarity." : "A lighter view of your workspace."}`}
                  </div>
                </div>
              )}
            </div>
            <button
              className="icon-button motion-toggle"
              aria-label="Background animations"
              aria-pressed={motion}
              title={
                motion
                  ? "Turn off background animations and mouse effects"
                  : "Turn on background animations and mouse effects"
              }
              onClick={toggleMotion}
            >
              <Icon name="mouse" />
              <span className="motion-indicator" />
            </button>
            <a className="github-header" href={links.github} aria-label="RustWTM on GitHub">
              <Icon name="github" />
              <span>GitHub</span>
              <Icon name="external" size={12} />
            </a>
            <Link href="/download/" className="button button-small header-download">
              Download <Icon name="download" size={16} />
            </Link>
            <button
              ref={menuButton}
              className="icon-button mobile-menu-button"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => {
                setAppearance(false);
                setMenu(!menu);
              }}
            >
              <Icon name={menu ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menu && (
          <nav
            className="mobile-nav container"
            id="mobile-navigation"
            aria-label="Mobile navigation"
          >
            {[
              ["/#features", "Features"],
              ["/#screenshots", "The workspace"],
              ["/docs/", "Documentation"],
              ["/download/", "Download"],
            ].map(([url, label]) => (
              <Link key={url} href={url} onClick={() => setMenu(false)}>
                {label}
                <Icon name="arrow" size={17} />
              </Link>
            ))}
          </nav>
        )}
      </header>
      {children}
    </>
  );
}
