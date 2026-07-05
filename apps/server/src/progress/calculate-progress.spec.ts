import { calculateProgressPercent } from "./calculate-progress";

describe("calculateProgressPercent", () => {
  it("returns 0 when there are no lessons at all (avoids divide-by-zero)", () => {
    expect(calculateProgressPercent(0, 0)).toBe(0);
  });

  it("returns 0 when no lessons are completed yet", () => {
    expect(calculateProgressPercent(8, 0)).toBe(0);
  });

  it("rounds a partial completion to the nearest percent", () => {
    expect(calculateProgressPercent(8, 3)).toBe(38);
  });

  it("returns 100 when every lesson is completed", () => {
    expect(calculateProgressPercent(8, 8)).toBe(100);
  });
});
