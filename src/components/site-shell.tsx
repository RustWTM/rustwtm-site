"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";
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
    document.querySelectorAll(".animated-figure").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [motion, pathname]);
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
      <Background enabled={motion} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="header">
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
                onClick={() => setAppearance(!appearance)}
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
              className="icon-button mobile-menu-button"
              aria-label={menu ? "Close navigation" : "Open navigation"}
              aria-expanded={menu}
              aria-controls="mobile-navigation"
              onClick={() => setMenu(!menu)}
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

function Background({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!enabled || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      time = 0;
    let pointer = { x: -1000, y: -1000 },
      smooth = { x: -1000, y: -1000 };
    let waves: { x: number; y: number; born: number }[] = [];
    let ink = "",
      accent = "";
    const mobile = matchMedia("(pointer: coarse)").matches;
    const dots = Array.from({ length: mobile ? 14 : 32 }, (_, i) => ({
      x: ((i * 137.508) % 100) / 100,
      y: ((i * 47.71) % 100) / 100,
      phase: i * 1.7,
    }));
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const ratio = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const colors = () => {
      const styles = getComputedStyle(document.documentElement);
      ink = styles.getPropertyValue("--effect-ink").trim();
      accent = styles.getPropertyValue("--accent").trim();
    };
    const move = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
    };
    const click = (e: PointerEvent) => {
      waves.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      waves = waves.slice(-4);
    };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - last < 40) return;
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      time += delta;
      ctx.clearRect(0, 0, width, height);
      smooth.x += (pointer.x - smooth.x) * 0.13;
      smooth.y += (pointer.y - smooth.y) * 0.13;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        const y = (height * (i + 0.5)) / 7;
        ctx.beginPath();
        ctx.moveTo(-100, y + 60 * Math.sin(time * 0.12 + i));
        ctx.bezierCurveTo(width * 0.3, y - 90, width * 0.65, y + 100, width + 100, y - 80);
        ctx.stroke();
      }
      dots.forEach((dot, i) => {
        let x = dot.x * width + Math.sin(time * 0.15 + dot.phase) * 24,
          y = dot.y * height + Math.cos(time * 0.12 + dot.phase) * 22;
        const dx = x - smooth.x,
          dy = y - smooth.y,
          distance = Math.hypot(dx, dy);
        if (distance < 180) {
          x += dx * 0.12;
          y += dy * 0.12;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = (1 - distance / 180) * 0.2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(smooth.x, smooth.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = ink;
        ctx.save();
        ctx.translate(x, y);
        if (i % 3 === 0) {
          ctx.strokeRect(-5, -5, 10, 10);
          ctx.strokeRect(-2, -2, 4, 4);
        } else if (i % 3 === 1) {
          ctx.beginPath();
          ctx.moveTo(-7, 0);
          ctx.lineTo(-2, 0);
          ctx.lineTo(0, -6);
          ctx.lineTo(3, 5);
          ctx.lineTo(5, 0);
          ctx.lineTo(9, 0);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, 3, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });
      waves = waves.filter((wave) => now - wave.born < 1500);
      waves.forEach((wave) => {
        const age = (now - wave.born) / 1500;
        ctx.globalAlpha = (1 - age) * 0.3;
        ctx.strokeStyle = accent;
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, 8 + age * 240, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };
    const start = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    resize();
    colors();
    start();
    const observer = new MutationObserver(colors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("resize", resize);
    if (!mobile) window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", click, { passive: true });
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", click);
      document.removeEventListener("visibilitychange", start);
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled]);
  return (
    <div className="background" aria-hidden="true">
      <div className="ambient-glow" />
      <canvas ref={ref} />
    </div>
  );
}
