/**
 * Left Chart Panel Component
 *
 * Vertical panel containing:
 * - TOP: Pie Chart "Số lượng CP Tăng, Giảm, Không đổi" (220-260px height)
 * - BOTTOM: Bar Chart "Phân bổ dòng tiền" (260-300px height)
 *
 * Both charts stacked vertically in a single Card container.
 */

"use client";

import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useRealtimeHeatmap } from "@/hooks/useRealtimeHeatmap";

// Colors aligned with heatmap palette (see utils/colorUtils.ts)
const COLORS = {
  // Use the same strong green as heatmap tiles for gains
  advancing: "#166F00",
  // Moderate loss (-2 → -5%)
  declining: "#F00000",
  // Near-flat / neutral zone around 0
  unchanged: "#FF661A",
};

interface LeftChartPanelProps {
  heatmapData: ReturnType<typeof useRealtimeHeatmap>;
}

// Memoize component để tránh re-render không cần thiết
const LeftChartPanel = React.memo(function LeftChartPanel({ heatmapData }: LeftChartPanelProps) {
  const { data, isLoading, error } = heatmapData;

  const derivedStatus = useMemo(() => {
    if (!data || !data.sectors || !Array.isArray(data.sectors)) return null;

    const allStocks = data.sectors.flatMap((s) => s.stocks);
    if (allStocks.length === 0) return null;

    let advancing = 0;
    let declining = 0;
    let unchanged = 0;

    let flowAdvancing = 0;
    let flowDeclining = 0;
    let flowUnchanged = 0;

    allStocks.forEach((stock) => {
      const cp = stock.changePercent ?? 0;
      const // approximate cash flow = price * volume (scaled down to "tỷ" units)
        cashFlow = (stock.price ?? 0) * (stock.volume ?? 0) / 1_000_000;

      if (cp > 0) {
        advancing += 1;
        flowAdvancing += cashFlow;
      } else if (cp < 0) {
        declining += 1;
        flowDeclining += cashFlow;
      } else {
        unchanged += 1;
        flowUnchanged += cashFlow;
      }
    });

    return {
      advancing,
      declining,
      unchanged,
      cashFlow: {
        advancing: flowAdvancing,
        declining: flowDeclining,
        unchanged: flowUnchanged,
      },
    };
  }, [data]);

  if (isLoading || !derivedStatus || error) {
    return (
      <div className="bg-white dark:bg-[#2a2d3a] border border-gray-200 dark:border-gray-700 rounded-lg p-4 h-full flex flex-col gap-4">
        <div className="animate-pulse space-y-4">
          <div className="h-[240px] bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-[280px] bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Prepare data for Pie Chart
  const pieData = [
    { name: "Advancing", value: derivedStatus.advancing, color: COLORS.advancing },
    { name: "Declining", value: derivedStatus.declining, color: COLORS.declining },
    { name: "Unchanged", value: derivedStatus.unchanged, color: COLORS.unchanged },
  ];

  // Prepare data for Bar Chart (Cash Flow)
  const barData = [
    {
      name: "Advancing",
      value: derivedStatus.cashFlow.advancing,
      color: COLORS.advancing,
    },
    {
      name: "Declining",
      value: derivedStatus.cashFlow.declining,
      color: COLORS.declining,
    },
    {
      name: "Unchanged",
      value: derivedStatus.cashFlow.unchanged,
      color: COLORS.unchanged,
    },
  ];

  return (
    <div className="bg-white dark:bg-[#2a2d3a] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Market Statistics
        </h3>
      </div>

      {/* Content - Vertical Stack */}
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-hidden min-h-0">
        {/* TOP: Pie Chart - Advancing / Declining / Unchanged counts */}
        <div className="flex-shrink-0" style={{ height: "220px" }}>
          <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Number of Advancing, Declining, Unchanged Stocks
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 12, bottom: 12, left: 5, right: 14 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={8}
                outerRadius={55}
                paddingAngle={1}
                dataKey="value"
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  name,
                  value,
                }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 14;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  return (
                    <text
                      x={x}
                      y={y}
                      fill="currentColor"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {`${name} (${value})`}
                    </text>
                  );
                }}
                labelLine={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* BOTTOM: Bar Chart - Phân bổ dòng tiền */}
        <div className="flex-1 min-h-0" style={{ minHeight: "260px", maxHeight: "300px" }}>
          <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Money Flow Distribution
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 16, right: 16, left: 16, bottom: 8 }}
              barCategoryGap="30%"
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
              />
              <YAxis
                width={0}
                tick={false}
                axisLine={false}
                tickFormatter={(value) => `${value.toFixed(0)} tỷ`}
                domain={[0, (dataMax: number) => Math.ceil(dataMax / 1000) * 1000]}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeWidth={0.5}
                vertical
              />
              <Tooltip
                formatter={(value: number) => `${value.toFixed(1)} tỷ`}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value: number) => `${value.toFixed(1)} tỷ`,
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "currentColor",
                }}
              >
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
});

export default LeftChartPanel;



