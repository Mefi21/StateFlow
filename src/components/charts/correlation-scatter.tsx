"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CorrelationScatter({
  data,
  xLabel,
  yLabel,
}: {
  data: Array<{ x: number; y: number }>;
  xLabel: string;
  yLabel: string;
}) {
  return (
    <div
      className="scatter-chart"
      role="img"
      aria-label={`${xLabel} и ${yLabel}: ${data.length} пар наблюдений`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 12, left: -8, bottom: 12 }}>
          <CartesianGrid stroke="var(--chart-grid)" />
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
            label={{ value: xLabel, position: "bottom", fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={{ fill: "var(--chart-tick)", fontSize: 10 }}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--chart-tooltip-border)",
              background: "var(--chart-tooltip-background)",
              color: "var(--text-primary)",
              boxShadow: "var(--chart-tooltip-shadow)",
              fontSize: 12,
            }}
          />
          <Scatter data={data} fill="var(--data-blue)" fillOpacity={0.78} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
