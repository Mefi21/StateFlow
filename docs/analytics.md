# Analytics formulas

All analytics are descriptive. No index is a diagnostic score, and no comparison establishes causation.

## Daily aggregation

For a metric and local day, use the completed Daily Check-in value when present; otherwise use the median of that day’s snapshots. Median is the default because several snapshots can include short-lived extremes.

## Moving averages and baseline

`MA(k,t) = mean(x[t-k+1 … t])`; insufficient windows return no value.

After at least 21 data days, the default baseline compares today with the **previous** 30-day window:

`z = (x[t] - mean(x[t-30 … t-1])) / sampleSD(x[t-30 … t-1])`

No z-score is returned when the prior window has zero variance.

## Spearman correlation

Values become average ranks (ties share their mean rank); Pearson correlation is applied to the ranks. Results are shown only at `N ≥ 14`. Constant inputs return no result. UI copy includes sample size, period, and the causality disclaimer.

Lagged correlations align `X(day 0)` with `Y(day + lag)` for lags 0, 1, 2, and 3. Pairwise missing observations are removed before ranking.

## Within-Day Lability

For consecutive snapshots and enabled metrics:

`L(day) = mean(|s(i,m) - s(i-1,m)|)`

Core metrics are Future Wanting, Pleasure, Energy, Anxiety, Activation, and Emotional Intensity. Since scales are 0–10, the raw mean is already normalized. A day needs at least two snapshots.

## Descriptive indices

- Future Engagement: `0.40 × Future Wanting + 0.25 × Anticipation + 0.20 × Goal Drive + 0.15 × Mastery`.
- Positive Experience: `0.50 × Current Pleasure + 0.25 × Life Interest + 0.25 × Pride`.
- Activation: `0.25 × Energy + 0.20 × Activation + 0.20 × Thought Speed + 0.15 × Impulsivity + 0.20 × Emotional Intensity`.

Weights are visible. The Activation index never receives a diagnostic label.

## Sleep Regularity

For a window, calculate local-clock bedtime SD, wake-time SD, and duration SD in minutes:

`Regularity = clamp(100 - (0.40 × bedtimeSD + 0.40 × wakeSD + 0.20 × durationSD) / 1.8, 0, 100)`

The divisor maps roughly three hours of weighted timing variability to zero. This is a product-readable indicator, not a validated clinical instrument. Raw duration and timing statistics remain visible.

## Positive-state persistence (experimental)

A positive spike is a Pleasure or Future Wanting observation at least one sample SD above the preceding 30-day baseline. Later snapshots are grouped around +15 min, +30 min, +1 h, +2 h, and +4 h. Values are expressed relative to baseline; the median across spikes forms the curve. A point requires at least ten matched spikes.

## Reliability thresholds

- context summaries: `N ≥ 10`;
- correlation/lag cells: `N ≥ 14`;
- period comparison: seven distinct days per period;
- personal baseline: 21 prior data days;
- context transition aggregation: `N ≥ 10` matched pairs.
