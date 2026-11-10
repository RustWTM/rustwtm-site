"use client";
import { useEffect, useRef } from "react";
import {
  createFieldNodes,
  createFrameLoop,
  cubicPoint,
  lanePoints,
  type Point,
} from "@/lib/motion";

type Wave = Point & { born: number; rotation: number };
export function ResourceField({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const context = canvas?.getContext("2d");
    if (!enabled || !canvas || !context) return;
    const coarse = matchMedia("(pointer: coarse)").matches;
    let width = 0,
      height = 0,
      time = 0;
    let nodes = createFieldNodes(coarse, innerWidth);
    let palette: string[] = [],
      ink = "",
      accent = "";
    let pointer: Point | null = null,
      cursor: Point | null = null;
    let drift = { x: 0, y: 0 };
    let waves: Wave[] = [];
    const colors = () => {
      const style = getComputedStyle(document.documentElement);
      palette = ["--cpu", "--memory", "--green", "--disk", "--network"].map((name) =>
        style.getPropertyValue(name).trim(),
      );
      ink = style.getPropertyValue("--effect-ink").trim();
      accent = style.getPropertyValue("--accent").trim();
    };
    const resize = () => {
      width = innerWidth;
      height = innerHeight;
      const ratio = Math.min(devicePixelRatio, coarse || width > 2000 ? 1 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      nodes = createFieldNodes(coarse, width);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pointer = { x: event.clientX, y: event.clientY };
      cursor ??= { ...pointer };
    };
    const leave = () => {
      pointer = null;
    };
    const click = (event: PointerEvent) => {
      if (
        event.button !== 0 ||
        (event.target instanceof Element &&
          event.target.closest("a,button,input,select,textarea,summary,dialog,label"))
      )
        return;
      waves.push({ x: event.clientX, y: event.clientY, born: performance.now(), rotation: time });
      waves = waves.slice(coarse ? -2 : -4);
    };
    const render = (now: number, delta: number) => {
      time += delta;
      context.clearRect(0, 0, width, height);
      const ease = 1 - Math.exp(-delta * 9);
      if (pointer && cursor) {
        cursor.x += (pointer.x - cursor.x) * ease;
        cursor.y += (pointer.y - cursor.y) * ease;
      }
      const target =
        pointer && cursor ? { x: cursor.x - width / 2, y: cursor.y - height / 2 } : { x: 0, y: 0 };
      drift.x += (target.x - drift.x) * ease * 0.4;
      drift.y += (target.y - drift.y) * ease * 0.4;
      const lanes = Array.from({ length: 5 }, (_, lane) =>
        lanePoints(lane, width, height, time, drift),
      );
      context.lineWidth = 1;
      for (const points of lanes) {
        context.globalAlpha = 0.75;
        context.strokeStyle = ink;
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        context.bezierCurveTo(
          points[1].x,
          points[1].y,
          points[2].x,
          points[2].y,
          points[3].x,
          points[3].y,
        );
        context.stroke();
      }
      if (pointer && cursor) {
        const glow = context.createRadialGradient(cursor.x, cursor.y, 0, cursor.x, cursor.y, 230);
        glow.addColorStop(0, accent);
        glow.addColorStop(1, "transparent");
        context.globalAlpha = 0.055;
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }
      nodes.forEach((node) => {
        const position = (node.offset + time * node.speed) % 1;
        const point = cubicPoint(lanes[node.lane], position);
        const tail = cubicPoint(lanes[node.lane], Math.max(0, position - 0.018));
        const color = palette[node.lane];
        context.globalAlpha = 0.22;
        context.strokeStyle = color;
        context.beginPath();
        context.moveTo(tail.x, tail.y);
        context.lineTo(point.x, point.y);
        context.stroke();
        let proximity = 0;
        if (pointer && cursor) {
          const dx = cursor.x - point.x,
            dy = cursor.y - point.y,
            distance = Math.hypot(dx, dy);
          proximity = Math.max(0, 1 - distance / 210);
          point.x += dx * proximity * 0.12;
          point.y += dy * proximity * 0.12;
          if (proximity > 0) {
            context.globalAlpha = proximity * 0.3;
            context.strokeStyle = color;
            context.beginPath();
            context.moveTo(point.x, point.y);
            context.lineTo(cursor.x, cursor.y);
            context.stroke();
          }
        }
        context.globalAlpha = 0.3 + proximity * 0.55;
        context.strokeStyle = color;
        context.fillStyle = color;
        context.save();
        context.translate(point.x, point.y);
        if (node.kind === 0) {
          context.strokeRect(-5, -5, 10, 10);
          context.strokeRect(-2, -2, 4, 4);
          context.beginPath();
          context.moveTo(-8, -2);
          context.lineTo(-5, -2);
          context.moveTo(5, 2);
          context.lineTo(8, 2);
          context.stroke();
        } else if (node.kind === 1) {
          context.beginPath();
          context.moveTo(-8, 0);
          context.lineTo(-3, 0);
          context.lineTo(0, -5);
          context.lineTo(3, 5);
          context.lineTo(5, 0);
          context.lineTo(9, 0);
          context.stroke();
        } else {
          context.beginPath();
          context.arc(0, 0, 2 + proximity, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      });
      waves = waves.filter((wave) => now - wave.born < 1450);
      waves.forEach((wave) => {
        const age = Math.min(1, (now - wave.born) / 1450),
          progress = 1 - (1 - age) ** 3;
        context.globalAlpha = (1 - age) * 0.42;
        context.strokeStyle = accent;
        context.lineWidth = 1.1;
        context.beginPath();
        context.arc(wave.x, wave.y, 12 + progress * 205, 0, Math.PI * 2);
        context.stroke();
        if (age < 0.8) {
          context.globalAlpha *= 0.45;
          context.beginPath();
          context.arc(wave.x, wave.y, 8 + progress * 155, 0, Math.PI * 2);
          context.stroke();
        }
        for (let index = 0; index < (coarse ? 6 : 10); index++) {
          const angle = wave.rotation + (index * Math.PI * 2) / (coarse ? 6 : 10),
            radius = 18 + progress * (index % 2 ? 155 : 180);
          const x = wave.x + Math.cos(angle) * radius,
            y = wave.y + Math.sin(angle) * radius;
          context.globalAlpha = (1 - age) ** 2 * 0.65;
          context.fillStyle = palette[index % 5];
          context.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      });
      context.globalAlpha = 1;
    };
    const loop = createFrameLoop({
      request: (callback) => requestAnimationFrame(callback),
      cancel: (id) => cancelAnimationFrame(id),
      visible: () => !document.hidden,
      render,
      fps: coarse ? 30 : 60,
    });
    const visibility = () => {
      document.documentElement.dataset.pageVisible = document.hidden ? "hidden" : "visible";
      if (document.hidden) {
        pointer = null;
        cursor = null;
        waves = [];
      }
      loop.syncVisibility();
    };
    resize();
    colors();
    visibility();
    loop.start();
    const themeObserver = new MutationObserver(colors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window.addEventListener("resize", resize);
    if (!coarse) {
      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
    }
    window.addEventListener("pointerdown", click, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    return () => {
      loop.stop();
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", click);
      document.removeEventListener("visibilitychange", visibility);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled]);
  return (
    <div className="background" aria-hidden="true">
      <div className="ambient-glow" />
      <canvas ref={ref} />
    </div>
  );
}
