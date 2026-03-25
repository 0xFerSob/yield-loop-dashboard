"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { HistoricalDataPoint, DateRange } from "@/lib/types";
import { formatChartDate } from "@/lib/chartUtils";
import ChartEmptyState from "./ChartEmptyState";

interface Props {
  data: HistoricalDataPoint[];
  range: DateRange;
  assetName: string;
}

export default function PriceChart({ data, range, assetName }: Props) {
  if (data.length === 0) {
    return <ChartEmptyState label={`No price history for ${assetName}`} />;
  }

  const formatted = data.map((d) => ({
    ...d,
    date: formatChartDate(d.timestamp, range),
  }));

  return (
    <div className="bg-gray-800/30 rounded-xl border border-gray-700/50 p-4">
      <h4 className="text-sm font-medium text-gray-400 mb-3">Price (USD)</h4>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            axisLine={{ stroke: "#374151" }}
            tickLine={false}
            domain={["auto", "auto"]}
            tickFormatter={(v: number) => `$${v.toFixed(4)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "8px",
              color: "#e5e7eb",
            }}
            formatter={(value) => [`$${Number(value).toFixed(4)}`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            dot={false}
            strokeWidth={1.5}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
