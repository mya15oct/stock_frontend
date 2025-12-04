/**
 * Market Heatmap Component (Treemap)
 *
 * Hiển thị tất cả stocks grouped by sector
 * - Size: marketCap-driven synthetic `size` field
 * - Color: % Change (red = giảm, green = tăng)
 *
 * TODO: Add WebSocket realtime price updates
 */

"use client";

import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { HeatmapData, StockHeatmapItem } from "@/types/market";
import { getColorFromChangePercent } from "@/utils/colorUtils";

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
          .filter(
            (stock) =>
              (stock.size ?? 0) > 0 &&
              typeof stock.changePercent === "number" &&
              !isNaN(stock.changePercent) &&
              typeof stock.price === "number" &&
              !isNaN(stock.price)
          )
          .map((stock) => ({
            name: stock.ticker,
            fullName: stock.name,
            size: stock.size ?? 1, // Treemap cell size
            marketCap: stock.marketCap, // Optional legacy display value
            changePercent: stock.changePercent,
            price: stock.price,
            change: stock.change,
            sector: sector.sector,
            volume: stock.volume,
          })),
      }))
      .filter((sector) => sector.children.length > 0);
  }, [data]);

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, fullName, changePercent, price, value, depth } =
      props;

    // Render parent cells (sectors) with FireAnt-style title bar overlay
    // This renders at depth === 1, which is the sector level in the hierarchical Treemap
    if (depth === 1) {
      // Sector container styling
      const sectorBgColor = "#1a1d28"; // Darker background for sector containers
      const sectorBorderColor = "#4b5563"; // Visible border color (gray-600)
      const sectorBorderWidth = 2; // Visible border width

      // FireAnt-style title bar styling
      // Title bar appears at top-left of sector block, does not overlap stock tiles
      const titleBarBg = "rgba(0, 0, 0, 0.35)"; // Dark translucent background
      const titleBarPaddingX = 6; // Horizontal padding
      const titleBarPaddingY = 3; // Vertical padding
      const titleBarFontSize = 11; // Font size as specified
      const titleBarFontWeight = 600; // Font weight as specified
      const titleBarBorderRadius = 3; // Border radius as specified
      const titleBarTextColor = "#ffffff"; // White text for contrast
      const titleBarOffsetX = 4; // Offset from left edge of sector
      const titleBarOffsetY = 4; // Offset from top edge of sector

      // Calculate title bar dimensions based on text
      // Approximate text width: font-size * character-count * 0.6 (average character width factor)
      const estimatedTextWidth = name.length * titleBarFontSize * 0.6;
      const titleBarWidth = estimatedTextWidth + titleBarPaddingX * 2;
      const titleBarHeight = titleBarFontSize + titleBarPaddingY * 2;

      return (
        <g>
          {/* Sector background with border - this is the container for all stock tiles */}
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
            style={{
              fill: sectorBgColor,
              stroke: sectorBorderColor,
              strokeWidth: sectorBorderWidth,
              strokeDasharray: "0", // Solid border
            }}
            rx={2} // Slight rounded corners
            ry={2}
          />
          {/* FireAnt-style sector title bar overlay at top-left */}
          {/* This overlay sits on top of the sector container but does not interfere with stock tiles */}
          {/* pointer-events: none ensures it doesn't block tooltips or interactions */}
          {name && width > 20 && height > 15 && (
            <g>
              {/* Title bar background - dark translucent rectangle */}
              <rect
                x={x + titleBarOffsetX}
                y={y + titleBarOffsetY}
                width={Math.min(titleBarWidth, width - titleBarOffsetX * 2)}
                height={titleBarHeight}
                rx={titleBarBorderRadius}
                ry={titleBarBorderRadius}
                style={{
                  fill: titleBarBg,
                  pointerEvents: "none", // Don't block interactions with stock tiles
                }}
              />
              {/* Sector name text - white text on dark translucent background */}
              {/* Y position calculated to center text vertically in title bar: offset + padding + font-size baseline offset */}
              <text
                x={x + titleBarOffsetX + titleBarPaddingX}
                y={y + titleBarOffsetY + titleBarPaddingY + titleBarFontSize * 0.8}
                textAnchor="start"
                fill={titleBarTextColor}
                fontSize={titleBarFontSize}
                fontWeight={titleBarFontWeight}
                style={{
                  pointerEvents: "none", // Don't block interactions
                  userSelect: "none", // Prevent text selection
                }}
              >
                {name}
              </text>
            </g>
          )}
        </g>
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

    const bgColor = getColorFromChangePercent(changePercent);
    const textColor = "#ffffff"; // Always white for better contrast

    // Calculate font sizes based on cell size - tăng size lên để dễ đọc hơn
    const tickerFontSize = width > 120 ? 16 : width > 80 ? 13 : width > 50 ? 10 : 8;
    const percentFontSize = width > 120 ? 14 : width > 80 ? 11 : width > 50 ? 9 : 7;
    const priceFontSize = width > 120 ? 11 : 9;

    // Add visual padding/gap between stock tiles within sectors
    // This creates a subtle gap effect by slightly reducing the rendered size
    const padding = 1; // 1px visual gap between tiles
    const adjustedX = x + padding / 2;
    const adjustedY = y + padding / 2;
    const adjustedWidth = width - padding;
    const adjustedHeight = height - padding;

    return (
      <g>
        {/* Stock tile with subtle border to separate from sector background */}
        <rect
          x={adjustedX}
          y={adjustedY}
          width={adjustedWidth}
          height={adjustedHeight}
          style={{
            fill: bgColor,
            stroke: "rgba(0, 0, 0, 0.1)", // Subtle border for tile separation
            strokeWidth: 0.5,
          }}
          rx={1} // Slight rounded corners for modern look
          ry={1}
        />
        {/* Ticker Symbol */}
        {adjustedWidth > 40 && adjustedHeight > 40 && (
          <text
            x={adjustedX + adjustedWidth / 2}
            y={adjustedY + adjustedHeight / 2 - (adjustedHeight > 60 ? 5 : 2)}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={tickerFontSize}
            fontWeight="700"
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)", // Text shadow for readability
            }}
          >
            {name}
          </text>
        )}
        {/* Change Percentage */}
        {adjustedWidth > 40 && adjustedHeight > 40 && (
          <text
            x={adjustedX + adjustedWidth / 2}
            y={adjustedY + adjustedHeight / 2 + (adjustedHeight > 60 ? 10 : 8)}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={percentFontSize}
            fontWeight="600"
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
          >
            {changePercent > 0 ? "+" : ""}
            {changePercent?.toFixed(2) ?? "0.00"}%
          </text>
        )}
        {/* Price (if large enough) */}
        {adjustedWidth > 100 && adjustedHeight > 70 && (
          <text
            x={adjustedX + adjustedWidth / 2}
            y={adjustedY + adjustedHeight / 2 + 22}
            textAnchor="middle"
            fill={textColor}
            stroke="none"
            fontSize={priceFontSize}
            fontWeight="500"
            opacity={0.9}
            style={{
              textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
            }}
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
                {data.price?.toFixed(2) ?? "0.00"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">% Thay đổi:</span>
              <span
                className={`font-semibold ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? "+" : ""}
                {data.changePercent?.toFixed(2) ?? "0.00"}%
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Khối lượng:</span>
              <span className="font-medium text-gray-200">
                {Number.isFinite(data.volume)
                  ? data.volume.toLocaleString()
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Vốn hóa:</span>
              <span className="font-medium text-gray-200">
                {typeof data.marketCap === "number" && data.marketCap > 0
                  ? formatMarketCap(data.marketCap)
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Size (debug):</span>
              <span className="font-medium text-gray-200">
                {Number.isFinite(data.size) ? data.size.toFixed(0) : "1"}
              </span>
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
    <div 
      className="w-full h-full" 
      style={{ 
        height,
        // Ensure Treemap background matches panel background (transparent/dark)
        backgroundColor: "transparent",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={treemapData}
          dataKey="size"
          stroke="#1a1d28" // Match sector background for cleaner look
          fill="transparent" // Transparent to inherit panel background
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
