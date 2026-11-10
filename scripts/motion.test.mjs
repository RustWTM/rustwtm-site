import test from "node:test";
import assert from "node:assert/strict";
import { createFrameLoop, createFieldNodes, lanePoints, cubicPoint } from "../src/lib/motion.ts";

function fixture() {
  let visible = true,
    next = 0;
  const pending = new Map(),
    frames = [];
  const loop = createFrameLoop({
    request: (callback) => {
      pending.set(++next, callback);
      return next;
    },
    cancel: (id) => pending.delete(id),
    visible: () => visible,
    render: (time, delta) => frames.push({ time, delta }),
    fps: 60,
  });
  const advance = (time) => {
    const entry = pending.entries().next().value;
    assert.ok(entry, "a frame is pending");
    pending.delete(entry[0]);
    entry[1](time);
  };
  return {
    loop,
    pending,
    frames,
    advance,
    setVisible: (value) => {
      visible = value;
    },
  };
}
test("motion loop owns one frame and cannot render a queued callback after disposal", () => {
  const f = fixture();
  f.loop.start();
  f.loop.start();
  assert.equal(f.pending.size, 1);
  f.advance(0);
  assert.equal(f.frames.length, 1);
  assert.equal(f.pending.size, 1);
  const stale = [...f.pending.values()][0];
  f.loop.stop();
  assert.equal(f.pending.size, 0);
  stale(100);
  assert.equal(f.frames.length, 1);
  assert.equal(f.pending.size, 0);
});
test("hidden tabs cancel work and repeated visibility changes never multiply loops", () => {
  const f = fixture();
  f.loop.start();
  f.advance(0);
  const stale = [...f.pending.values()][0];
  f.setVisible(false);
  f.loop.syncVisibility();
  assert.equal(f.pending.size, 0);
  stale(20);
  assert.equal(f.frames.length, 1);
  f.setVisible(true);
  f.loop.syncVisibility();
  f.loop.syncVisibility();
  assert.equal(f.pending.size, 1);
  f.advance(50000);
  assert.equal(f.frames.length, 2);
  assert.ok(f.frames[1].delta <= 0.05);
  f.loop.stop();
  f.loop.syncVisibility();
  assert.equal(f.pending.size, 0);
});
test("a cancelled callback cannot consume a newer frame after restarting", () => {
  const f = fixture();
  f.loop.start();
  const stale = [...f.pending.values()][0];
  f.loop.stop();
  f.loop.start();
  const current = [...f.pending.keys()][0];
  stale(100);
  assert.equal(f.frames.length, 0);
  assert.deepEqual([...f.pending.keys()], [current]);
  f.advance(120);
  assert.equal(f.frames.length, 1);
  f.loop.stop();
});
test("frame throttling skips renders and bounds the delta after interruption", () => {
  const f = fixture();
  f.loop.start();
  f.advance(0);
  f.advance(5);
  assert.equal(f.frames.length, 1);
  f.advance(17);
  assert.equal(f.frames.length, 2);
  f.advance(1000);
  assert.equal(f.frames.at(-1).delta, 0.05);
  f.loop.stop();
});
test("field geometry remains finite at mobile and 4K sizes with bounded mobile work", () => {
  assert.equal(createFieldNodes(true, 3840).length, 16);
  assert.equal(createFieldNodes(false, 3840).length, 42);
  for (const width of [320, 375, 768, 1440, 3840])
    for (let lane = 0; lane < 5; lane++) {
      const points = lanePoints(lane, width, 1000, 600, { x: width / 2, y: 500 });
      for (const position of [-1, 0, 0.5, 1, 2]) {
        const p = cubicPoint(points, position);
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
      }
      assert.deepEqual(cubicPoint(points, 0), points[0]);
      assert.deepEqual(cubicPoint(points, 1), points[3]);
      assert.ok(points[0].x < 0 && points[3].x > width, "flows extend past both viewport edges");
    }
});
