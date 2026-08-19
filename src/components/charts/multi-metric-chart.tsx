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
const colors = ["#42664d", "#89744e", "#75638d", "#9b5b56"];

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
          <CartesianGrid stroke="#e8ece9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#778078" }}
            tickLine={false}
            axisLine={false}
            minTickGap={32}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fontSize: 10, fill: "#778078" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #dfe5e0",
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
