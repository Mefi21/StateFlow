"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MultiPoint = { date: string; [key: string]: string | number };
const colors = [
  "var(--data-green)",
  "var(--data-warm)",
  "var(--data-purple)",
  "var(--data-red)",
  "var(--data-blue)",
];

export function MultiMetricChart({
  data,
  series,
}: {
  data: MultiPoint[];
  series: Array<{ key: string; label: string }>;
}) {
  return (
    <div
      className="large-chart"
      role="img"
      aria-label={`Сравнение: ${series.map((item) => item.label).join(", ")}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 10, left: -22, bottom: 0 }}
        >
          <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "var(--chart-tick)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid var(--chart-tooltip-border)",
              background: "var(--chart-tooltip-background)",
              color: "var(--text-primary)",
              boxShadow: "var(--chart-tooltip-shadow)",
              fontSize: 12,
            }}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
          />
          {series.map((item, index) => (
            <Line
              key={item.key}
              dataKey={item.key}
              name={item.label}
              type="monotone"
              dot={false}
              strokeWidth={2}
              stroke={colors[index % colors.length]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
