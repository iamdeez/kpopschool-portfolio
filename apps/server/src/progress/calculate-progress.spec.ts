import { calculateProgressPercent, calculateQuizScore } from "./calculate-progress";

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

describe("calculateQuizScore", () => {
  it("does not pass a quiz with no questions at all", () => {
    expect(calculateQuizScore(0, 0)).toEqual({ score: 0, passed: false });
  });

  it("does not pass with zero correct answers", () => {
    expect(calculateQuizScore(3, 0)).toEqual({ score: 0, passed: false });
  });

  it("does not pass on a partial score, even a high one", () => {
    expect(calculateQuizScore(3, 2)).toEqual({ score: 67, passed: false });
  });

  it("passes only on a perfect score", () => {
    expect(calculateQuizScore(3, 3)).toEqual({ score: 100, passed: true });
  });
});
