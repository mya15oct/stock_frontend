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

import React, { useMemo, useState } from "react";
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
import { formatMoneyFlow } from "@/utils/format";


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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
      // approximate cash flow = price * volume (in USD, not scaled)
      const cashFlow = (stock.price ?? 0) * (stock.volume ?? 0);

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

  // Calculate total for percentage calculation
  const totalStocks = derivedStatus.advancing + derivedStatus.declining + derivedStatus.unchanged;

  // Prepare data for Pie Chart with percentage
  const pieData = [
    { 
      name: "Advancing", 
      value: derivedStatus.advancing, 
      color: COLORS.advancing,
      percentage: totalStocks > 0 ? (derivedStatus.advancing / totalStocks) * 100 : 0
    },
    { 
      name: "Declining", 
      value: derivedStatus.declining, 
      color: COLORS.declining,
      percentage: totalStocks > 0 ? (derivedStatus.declining / totalStocks) * 100 : 0
    },
    { 
      name: "Unchanged", 
      value: derivedStatus.unchanged, 
      color: COLORS.unchanged,
      percentage: totalStocks > 0 ? (derivedStatus.unchanged / totalStocks) * 100 : 0
    },
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
              {/* Gradient and filter definitions for 3D effect (only when hovered) */}
              <defs>
                {/* Radial gradient for each slice to create 3D depth when hovered */}
                {pieData.map((entry, index) => {
                  // Create gradient based on original color to maintain color consistency
                  const baseColor = entry.color;
                  // Create a slightly lighter version for highlight effect (center of gradient)
                  // Convert hex to RGB, lighten it
                  const hexToRgb = (hex: string) => {
                    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                    return result ? {
                      r: parseInt(result[1], 16),
                      g: parseInt(result[2], 16),
                      b: parseInt(result[3], 16)
                    } : null;
                  };
                  const rgb = hexToRgb(baseColor);
                  // Lighten color for center highlight (add 40 to each RGB component)
                  const lighterColor = rgb 
                    ? `rgb(${Math.min(255, rgb.r + 40)}, ${Math.min(255, rgb.g + 40)}, ${Math.min(255, rgb.b + 40)})`
                    : baseColor;
                  
                  return (
                    <radialGradient key={`gradient-${index}`} id={`pieGradient-${index}`} cx="30%" cy="30%">
                      <stop offset="0%" stopColor={lighterColor} stopOpacity={1} />
                      <stop offset="50%" stopColor={baseColor} stopOpacity={1} />
                      <stop offset="100%" stopColor={baseColor} stopOpacity={1} />
                    </radialGradient>
                  );
                })}
                {/* Enhanced shadow filter for 3D depth (only when hovered) */}
                <filter id="pieShadow3D" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                  <feOffset dx="3" dy="4" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={8}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
                activeIndex={hoveredIndex ?? undefined}
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  name,
                  value,
                  payload,
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
                      style={{
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                        filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1))",
                      }}
                    >
                      {`${name} (${value})`}
                    </text>
                  );
                }}
                labelLine={{
                  stroke: "#94a3b8",
                  strokeWidth: 1,
                  strokeOpacity: 0.6,
                }}
              >
                {pieData.map((entry, index) => {
                  const isHovered = hoveredIndex === index;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={isHovered ? `url(#pieGradient-${index})` : entry.color}
                      style={{
                        filter: isHovered
                          ? "url(#pieShadow3D) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35))"
                          : "none",
                        transition: "all 0.3s ease-out",
                        transform: isHovered ? "translateZ(0) scale(1.05)" : "translateZ(0)",
                        cursor: "pointer",
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(42, 45, 58, 0.95)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "6px",
                  padding: "8px 10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
                  fontSize: "12px",
                }}
                itemStyle={{
                  color: "#fff",
                  fontSize: "12px",
                  padding: "2px 0",
                }}
                labelFormatter={() => ""}
                formatter={(value: number, name: string, props: any) => {
                  const percentage = props.payload?.percentage ?? 0;
                  return `${name} : ${percentage.toFixed(2)}%`;
                }}
              />
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
                tickFormatter={(value) => formatMoneyFlow(value)}
                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#374151"
                strokeWidth={0.5}
                vertical
              />
              <Tooltip
                formatter={(value: number) => formatMoneyFlow(value)}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "8px",
                }}
              />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value: number) => formatMoneyFlow(value),
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



