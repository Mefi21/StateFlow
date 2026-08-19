"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date: string; value: number; secondary?: number };

export function MetricTrendChart({
  data,
  color = "#466951",
  label = "Значение",
}: {
  data: Point[];
  color?: string;
  label?: string;
}) {
  return (
    <div
      className="metric-chart"
      role="img"
      aria-label={`График: ${label}. ${data.length} наблюдений.`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 3, left: -28, bottom: 0 }}
        >
          <defs>
            <linearGradient
              id={`fill-${color.replace("#", "")}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e9edea" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "#7a837c", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 5, 10]}
            tick={{ fill: "#8a938c", fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dfe5e0",
              boxShadow: "0 10px 35px rgba(30,45,35,.12)",
              fontSize: 12,
            }}
            formatter={(value) => [Number(value).toFixed(1), label]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#fill-${color.replace("#", "")})`}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
