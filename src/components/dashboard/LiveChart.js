"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const formatData = (data) =>
  data.map((value, index) => ({
    index,
    value: typeof value === "number" ? value : Number(value) || 0,
  }));

const LiveChart = ({ data = [] }) => {
  const chartData = formatData(data);

  if (chartData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        Waiting for data…
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 8, right: 0, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="index" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          formatter={(value) => Number(value).toFixed(2)}
          labelFormatter={() => ""}
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            borderRadius: "0.5rem",
            border: "none",
            color: "#f8fafc",
            fontSize: "0.75rem",
          }}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LiveChart;
