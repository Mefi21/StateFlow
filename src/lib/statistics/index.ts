export type CorrelationResult = { rho: number; n: number } | null;

const finite = (values: readonly number[]) => values.filter(Number.isFinite);

export function mean(values: readonly number[]): number | null {
  const clean = finite(values);
  return clean.length
    ? clean.reduce((sum, value) => sum + value, 0) / clean.length
    : null;
}

export function median(values: readonly number[]): number | null {
  const clean = finite(values).toSorted((a, b) => a - b);
  if (!clean.length) return null;
  const middle = Math.floor(clean.length / 2);
  return clean.length % 2
    ? clean[middle]
    : (clean[middle - 1] + clean[middle]) / 2;
}

export function variance(
  values: readonly number[],
  sample = false,
): number | null {
  const clean = finite(values);
  if (clean.length < (sample ? 2 : 1)) return null;
  const average = mean(clean);
  if (average === null) return null;
  return (
    clean.reduce((sum, value) => sum + (value - average) ** 2, 0) /
    (clean.length - (sample ? 1 : 0))
  );
}

export function standardDeviation(
  values: readonly number[],
  sample = false,
): number | null {
  const result = variance(values, sample);
  return result === null ? null : Math.sqrt(result);
}

export function movingAverage(
  values: readonly number[],
  window: number,
): Array<number | null> {
  if (!Number.isInteger(window) || window < 1)
    throw new RangeError("Window must be a positive integer");
  return values.map((_, index) =>
    index + 1 < window
      ? null
      : mean(values.slice(index + 1 - window, index + 1)),
  );
}

export const rollingMean = movingAverage;

export function zScore(
  value: number,
  baseline: readonly number[],
): number | null {
  const average = mean(baseline);
  const deviation = standardDeviation(baseline, true);
  if (
    average === null ||
    deviation === null ||
    deviation === 0 ||
    !Number.isFinite(value)
  )
    return null;
  return (value - average) / deviation;
}

export function rankValues(values: readonly number[]): number[] {
  const indexed = values
    .map((value, index) => ({ value, index }))
    .toSorted((a, b) => a.value - b.value);
  const ranks = Array<number>(values.length);
  for (let start = 0; start < indexed.length;) {
    let end = start;
    while (
      end + 1 < indexed.length &&
      indexed[end + 1].value === indexed[start].value
    )
      end += 1;
    const rank = (start + end) / 2 + 1;
    for (let position = start; position <= end; position += 1)
      ranks[indexed[position].index] = rank;
    start = end + 1;
  }
  return ranks;
}

export function spearmanCorrelation(
  x: readonly number[],
  y: readonly number[],
): CorrelationResult {
  if (x.length !== y.length || x.length < 2) return null;
  const pairs = x
    .map((value, index) => [value, y[index]] as const)
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
  if (pairs.length < 2) return null;
  const rankX = rankValues(pairs.map(([value]) => value));
  const rankY = rankValues(pairs.map(([, value]) => value));
  const sdX = standardDeviation(rankX);
  const sdY = standardDeviation(rankY);
  if (!sdX || !sdY) return null;
  const averageX = mean(rankX)!;
  const averageY = mean(rankY)!;
  const covariance =
    rankX.reduce(
      (sum, value, index) =>
        sum + (value - averageX) * (rankY[index] - averageY),
      0,
    ) / rankX.length;
  return {
    rho: Math.max(-1, Math.min(1, covariance / (sdX * sdY))),
    n: pairs.length,
  };
}

export function lagSeries<T>(values: readonly T[], lag: number): Array<[T, T]> {
  if (!Number.isInteger(lag) || lag < 0)
    throw new RangeError("Lag must be a non-negative integer");
  return values
    .slice(0, Math.max(0, values.length - lag))
    .map((value, index) => [value, values[index + lag]]);
}

export function absoluteTransition(
  previous: number,
  next: number,
): number | null {
  return Number.isFinite(previous) && Number.isFinite(next)
    ? Math.abs(next - previous)
    : null;
}

export function labilityIndex(
  series: readonly (readonly number[])[],
): number | null {
  if (series.length < 2) return null;
  const movements: number[] = [];
  for (let index = 1; index < series.length; index += 1) {
    const width = Math.min(series[index - 1].length, series[index].length);
    for (let metric = 0; metric < width; metric += 1) {
      const movement = absoluteTransition(
        series[index - 1][metric],
        series[index][metric],
      );
      if (movement !== null) movements.push(movement);
    }
  }
  return mean(movements);
}

export function sleepRegularityIndex(
  bedtimeSdMinutes: number,
  wakeTimeSdMinutes: number,
  durationSdMinutes: number,
): number {
  const penalty =
    bedtimeSdMinutes * 0.4 + wakeTimeSdMinutes * 0.4 + durationSdMinutes * 0.2;
  return Math.max(0, Math.min(100, 100 - penalty / 1.8));
}
