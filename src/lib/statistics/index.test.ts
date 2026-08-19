import { describe, expect, it } from "vitest";
import {
  labilityIndex,
  mean,
  median,
  movingAverage,
  rankValues,
  sleepRegularityIndex,
  spearmanCorrelation,
  standardDeviation,
  zScore,
} from ".";

describe("statistics", () => {
  it("handles empty and missing data without NaN", () => {
    expect(mean([])).toBeNull();
    expect(median([])).toBeNull();
    expect(zScore(5, [2, 2, 2])).toBeNull();
  });

  it("calculates descriptive statistics", () => {
    expect(mean([1, 2, 3])).toBe(2);
    expect(median([9, 1, 3, 5])).toBe(4);
    expect(standardDeviation([2, 2, 2])).toBe(0);
    expect(movingAverage([1, 2, 3, 4], 3)).toEqual([null, null, 2, 3]);
  });

  it("uses average ranks for ties", () => {
    expect(rankValues([10, 20, 20, 30])).toEqual([1, 2.5, 2.5, 4]);
  });

  it("calculates Spearman rho and rejects constant inputs", () => {
    expect(spearmanCorrelation([1, 2, 3], [9, 7, 2])?.rho).toBeCloseTo(-1);
    expect(spearmanCorrelation([1, 1, 1], [1, 2, 3])).toBeNull();
  });

  it("calculates normalized lability and sleep regularity", () => {
    expect(
      labilityIndex([
        [1, 4],
        [3, 3],
        [2, 6],
      ]),
    ).toBe(1.75);
    expect(sleepRegularityIndex(0, 0, 0)).toBe(100);
    expect(sleepRegularityIndex(400, 400, 400)).toBe(0);
  });
});
