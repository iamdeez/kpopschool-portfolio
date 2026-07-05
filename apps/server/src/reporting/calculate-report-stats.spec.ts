import { averagePercent } from "./calculate-report-stats";

describe("averagePercent", () => {
  it("returns 0 when nobody has started this curriculum yet", () => {
    expect(averagePercent([])).toBe(0);
  });

  it("averages a mix of complete and empty progress", () => {
    expect(averagePercent([0, 100])).toBe(50);
  });

  it("returns the single value when there is only one learner", () => {
    expect(averagePercent([50])).toBe(50);
  });

  it("rounds a non-integer average to the nearest percent", () => {
    expect(averagePercent([0, 0, 100])).toBe(33);
  });
});
