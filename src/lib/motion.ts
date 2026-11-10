export type Point = { x: number; y: number };
export type FieldNode = { lane: number; offset: number; speed: number; kind: number };

export function createFieldNodes(coarse: boolean, width: number): FieldNode[] {
  const count = coarse ? 16 : width > 1800 ? 42 : 30;
  return Array.from({ length: count }, (_, index) => ({
    lane: index % 5,
    offset: (index * 0.61803398875) % 1,
    speed: 0.009 + (index % 4) * 0.002,
    kind: index % 3,
  }));
}

export function lanePoints(
  lane: number,
  width: number,
  height: number,
  time: number,
  drift: Point,
): Point[] {
  const base = height * (0.12 + lane * 0.205);
  return [
    { x: -160, y: base + Math.sin(time * 0.12 + lane) * 24 },
    {
      x: width * 0.3 + drift.x * 0.04,
      y: base - height * 0.12 + Math.sin(time * 0.15 + lane) * 36,
    },
    {
      x: width * 0.7 + drift.x * 0.065,
      y: base + height * 0.13 + Math.cos(time * 0.12 + lane) * 36 + drift.y * 0.04,
    },
    { x: width + 160, y: base - height * 0.055 },
  ];
}

export function cubicPoint(points: Point[], position: number): Point {
  const t = Math.max(0, Math.min(1, position));
  const u = 1 - t;
  return {
    x:
      u ** 3 * points[0].x +
      3 * u ** 2 * t * points[1].x +
      3 * u * t ** 2 * points[2].x +
      t ** 3 * points[3].x,
    y:
      u ** 3 * points[0].y +
      3 * u ** 2 * t * points[1].y +
      3 * u * t ** 2 * points[2].y +
      t ** 3 * points[3].y,
  };
}

type FrameOptions = {
  request: (callback: (time: number) => void) => number;
  cancel: (id: number) => void;
  visible: () => boolean;
  render: (time: number, delta: number) => void;
  fps: number;
};

// Own exactly one pending frame, including across repeated visibility changes.
export function createFrameLoop(options: FrameOptions) {
  let active = false;
  let pending: number | undefined;
  let last: number | undefined;
  let generation = 0;
  const schedule = () => {
    if (active && options.visible() && pending === undefined) {
      const version = generation;
      pending = options.request((time) => {
        if (version === generation) tick(time);
      });
    }
  };
  const tick = (time: number) => {
    pending = undefined;
    if (!active || !options.visible()) return;
    if (last === undefined || time - last >= 1000 / options.fps - 0.5) {
      const delta = last === undefined ? 1 / options.fps : Math.min((time - last) / 1000, 0.05);
      last = time;
      try {
        options.render(time, delta);
      } catch (error) {
        stop();
        throw error;
      }
    }
    schedule();
  };
  const pause = () => {
    generation++;
    if (pending !== undefined) options.cancel(pending);
    pending = undefined;
    last = undefined;
  };
  const stop = () => {
    active = false;
    pause();
  };
  return {
    start() {
      active = true;
      schedule();
    },
    stop,
    syncVisibility() {
      pause();
      schedule();
    },
  };
}
