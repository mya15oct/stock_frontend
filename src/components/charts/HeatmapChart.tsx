/**
 * Market Heatmap Component (Treemap)
 *
 * Hiển thị tất cả stocks grouped by sector
 * - Size: Market Cap
 * - Color: % Change (red = giảm, green = tăng)
 *
 * TODO: Add WebSocket realtime price updates
 */

"use client";

import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { HeatmapData, StockHeatmapItem } from "@/types/market";

export interface HeatmapChartProps {
  data: HeatmapData | null;
  height?: number;
}

export default function HeatmapChart({
  data,
  height = 600,
}: HeatmapChartProps) {
  // Transform data for Recharts Treemap
  const treemapData = useMemo(() => {
    if (!data || !data.sectors) return [];

    return data.sectors
      .filter((sector) => sector.stocks.length > 0)
      .map((sector) => ({
        name: sector.displayName,
        children: sector.stocks
          .filter(stock =>
            stock.marketCap > 0 &&
            typeof stock.changePercent === 'number' &&
            !isNaN(stock.changePercent) &&
            typeof stock.price === 'number' &&
            !isNaN(stock.price)
          )
          .map((stock) => ({
            name: stock.ticker,
            fullName: stock.name,
            value: stock.marketCap, // Size của ô
            changePercent: stock.changePercent,
            price: stock.price,
            change: stock.change,
            sector: sector.displayName,
          })),
      }))
      .filter(sector => sector.children.length > 0);
  }, [data]);

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, fullName, changePercent, price, value, depth } =
      props;

    // Render parent cells (sectors) with background color to avoid black boxes
    if (depth === 1) {
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: "#2a2d3a",
            stroke: "#2a2d3a",
            strokeWidth: 0,
          }}
        />
      );
    }

    // Guard against undefined values
    if (typeof changePercent === "undefined" || typeof price === "undefined") {
      return (
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: "#2a2d3a",
            stroke: "#2a2d3a",
            strokeWidth: 0,
          }}
        />
      );
    }

    // Determine color based on change percentage
    // Green = tăng, Yellow = không đổi, Orange = giảm nhẹ, Red = giảm nhiều
    const getColor = (change: number) => {
      if (change > 0) return "#10b981"; // Green - Tăng
      if (change === 0) return "#fbbf24"; // Yellow - Không đổi
      if (change > -2) return "#fb923c"; // Orange - Giảm nhẹ
      return "#ef4444"; // Red - Giảm nhiều
    };

    const bgColor = getColor(changePercent);
    const textColor = "#ffffff"; // Always white for better contrast

    // Calculate font sizes based on cell size - tăng size lên để dễ đọc hơn
    const tickerFontSize = width > 120 ? 16 : width > 80 ? 13 : width > 50 ? 10 : 8;
    const percentFontSize = width > 120 ? 14 : width > 80 ? 11 : width > 50 ? 9 : 7;
    const priceFontSize = width > 120 ? 11 : 9;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: bgColor,
            stroke: "none",
            strokeWidth: 0,
          }}
        />
        {/* Ticker Symbol */}
        {width > 40 && height > 40 && (
          <text
            x={x + width / 2}
            y={y + height / 2 - (height > 60 ? 5 : 2)}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={tickerFontSize}
            fontWeight="700"
          >
            {name}
          </text>
        )}
        {/* Change Percentage */}
        {width > 40 && height > 40 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + (height > 60 ? 10 : 8)}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={percentFontSize}
            fontWeight="600"
          >
            {changePercent > 0 ? "+" : ""}
            {changePercent?.toFixed(2) ?? "0.00"}%
          </text>
        )}
        {/* Price (if large enough) */}
        {width > 100 && height > 70 && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 22}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={priceFontSize}
            fontWeight="500"
            opacity={0.9}
          >
            {price?.toFixed(2) ?? "0.00"}
          </text>
        )}
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isPositive = data.changePercent >= 0;

    return (
      <div className="bg-[#2a2d3a] border border-gray-700 rounded-lg shadow-xl p-3">
        <div className="space-y-1">
          <div>
            <p className="font-bold text-sm text-gray-100">{data.name}</p>
            <p className="text-xs text-gray-400">
              {data.fullName}
            </p>
          </div>
          <div className="pt-2 space-y-1 text-xs">
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Ngành:</span>
              <span className="font-medium text-gray-200">{data.sector}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Giá:</span>
              <span className="font-semibold text-gray-100">
                {data.price?.toFixed(2) ?? "0.00"} VNĐ
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Thay đổi:</span>
              <span
                className={`font-semibold ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}
                {data.change?.toFixed(2) ?? "0.00"} ({isPositive ? "+" : ""}
                {data.changePercent?.toFixed(2) ?? "0.00"}%)
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">
                Vốn hóa:
              </span>
              <span className="font-medium text-gray-200">{formatMarketCap(data.value)}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!data || treemapData.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-400"
        style={{ height }}
      >
        No heatmap data available
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="value"
          stroke="#2a2d3a"
          fill="#2a2d3a"
          content={<CustomizedContent />}
          isAnimationActive={false}
          aspectRatio={4 / 3}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-gray-300">Tăng</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span className="text-gray-300">Không đổi</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fb923c' }}></div>
          <span className="text-gray-300">Giảm nhẹ</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-300">Giảm nhiều</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatMarketCap(value: number): string {
  if (!value || isNaN(value)) return "$0";

  if (value >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }
  return `$${value.toFixed(0)}`;
}
