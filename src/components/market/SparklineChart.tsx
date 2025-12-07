/**
 * Sparkline Chart Component
 *
 * Mini line chart cho index cards
 * Hiển thị trend của giá trong ngày
 */

"use client";

import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

export interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  isPositive?: boolean;
}

export default function SparklineChart({
  data,
  width = 120,
  height = 40,
  color,
  isPositive = true,
}: SparklineChartProps) {
  // Transform data for recharts
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Auto color based on trend if not provided
  const lineColor = color || (isPositive ? "#10b981" : "#ef4444");

  if (!data || data.length < 2) {
    return (
      <div
        style={{ width, height }}
        className="flex items-center justify-center text-gray-400 text-xs"
      >
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart
        data={chartData}
        margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
