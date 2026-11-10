import test from "node:test";
import assert from "node:assert/strict";
import { readings, chartPoints, reviewedPackages, previewRule } from "../public/preview/model.mjs";
test("review requests only selected known package identities", () => {
  assert.deepEqual(
    reviewedPackages(["--all", "Example.Editor", "Example.Editor"]).map((p) => p.id),
    ["Example.Editor"],
  );
  assert.deepEqual(reviewedPackages([]), []);
});
test("preview threshold changes matches without running actions", () => {
  assert.equal(previewRule(25).length, 2);
  assert.equal(previewRule(50).length, 0);
  assert.throws(() => previewRule(NaN));
  assert.throws(() => previewRule(100));
});
test("chart values are bounded deterministic and finite", () => {
  const values = readings(40, 10);
  assert.equal(values.length, 61);
  assert.deepEqual(values, readings(40, 10));
  assert.ok(values.every((v) => Number.isFinite(v) && v >= 0 && v <= 100));
  assert.ok(!chartPoints(values).includes("NaN"));
});
