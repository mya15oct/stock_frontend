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

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import type { HeatmapData, StockHeatmapItem } from "@/types/market";
import { getColorFromChangePercent } from "@/utils/colorUtils";

export interface HeatmapChartProps {
  data: HeatmapData | null;
  height?: number;
}

const HeatmapChart = React.memo(function HeatmapChart({
  data,
  height = 600,
}: HeatmapChartProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState<string | null>(null);

  // Handle click on stock tile - navigate to overview tab
  const handleStockClick = (ticker: string) => {
    if (navigating) return; // Prevent multiple clicks
    
    setNavigating(ticker);
    
    // Smooth scroll to top before navigation
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Small delay to allow scroll animation to start
    setTimeout(() => {
      router.push(`/stocks/${ticker.toUpperCase()}?tab=overview`);
      // Reset navigating state after navigation
      setTimeout(() => setNavigating(null), 300);
    }, 100);
  };

  // Transform data for Recharts Treemap
  // Stocks đã được sắp xếp theo volume (descending) trong useRealtimeHeatmap
  // Treemap sẽ tự động sắp xếp từ trái sang phải, trên xuống dưới theo size
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
          .map((stock, index) => ({
            name: stock.ticker,
            fullName: stock.name,
            size: stock.size ?? 1, // Treemap cell size (dựa trên volume)
            changePercent: stock.changePercent,
            price: stock.price,
            change: stock.change,
            sector: sector.sector,
            volume: stock.volume,
            // Thêm index để giữ thứ tự sắp xếp (volume descending)
            sortIndex: index,
          })),
      }))
      .filter((sector) => sector.children.length > 0);
  }, [data]);

  // Custom content for each cell
  const CustomizedContent = (props: any) => {
    const {
      x,
      y,
      width,
      height,
      name,
      fullName,
      changePercent,
      price,
      value,
      depth,
      parent,
      index,
    } = props;
    
    // Only make stock tiles clickable (not sector headers)
    const isStockTile = depth === 2;

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

    // Base adjusted values
    const adjustedX = x + padding / 2;
    const adjustedY = y + padding / 2;
    const adjustedWidth = width - padding;
    const adjustedHeight = height - padding;

    const isNavigating = navigating === name;
    
    return (
      <g
        onClick={() => isStockTile && handleStockClick(name)}
        onMouseEnter={(e) => {
          if (!isStockTile) return;
          // Add hover effect
          const target = e.currentTarget;
          const rect = target.querySelector("rect:not([fill='transparent'])");
          if (rect) {
            (rect as HTMLElement).style.opacity = "0.85";
            (rect as HTMLElement).style.cursor = "pointer";
          }
        }}
        onMouseLeave={(e) => {
          if (!isStockTile) return;
          // Remove hover effect
          const target = e.currentTarget;
          const rect = target.querySelector("rect:not([fill='transparent'])");
          if (rect) {
            (rect as HTMLElement).style.opacity = "1";
            (rect as HTMLElement).style.cursor = "default";
          }
        }}
        style={{
          cursor: isStockTile ? "pointer" : "default",
          transition: "all 0.2s ease-out",
        }}
      >
        {/* Invisible clickable overlay covering entire tile */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          style={{
            cursor: isStockTile ? "pointer" : "default",
            pointerEvents: isStockTile ? "all" : "none",
          }}
        />
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
            transition: "all 0.3s ease-out", // Smooth transition for position/size changes
            opacity: isNavigating ? 0.7 : 1,
            transform: isNavigating ? "scale(0.98)" : "scale(1)",
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
              pointerEvents: "none", // Prevent text from blocking clicks
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
              pointerEvents: "none", // Prevent text from blocking clicks
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
              pointerEvents: "none", // Prevent text from blocking clicks
            }}
          >
            {price?.toFixed(2) ?? "0.00"}
          </text>
        )}

        {/* Overlay sector border + title on top of all child tiles.
            We draw this from the child nodes (depth >= 2) so that the text/border
            appears above the stock rectangles, but we don't touch the layout. */}
        {parent && parent.depth === 1 && parent.x != null && parent.y != null && (
          <>
            <rect
              x={parent.x}
              y={parent.y}
              width={parent.width}
              height={parent.height}
              style={{
                fill: "none",
                stroke: "#4b5563",
                strokeWidth: 1.5,
                strokeDasharray: "0",
                pointerEvents: "none",
              }}
              rx={2}
              ry={2}
            />
            {parent.width > 40 && parent.height > 20 && (
              <text
                x={parent.x + 7}
                y={parent.y + 16}
                textAnchor="start"
                fill="#d0d3d8"
                fontSize={11}
                fontWeight={600}
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                {String(parent.name || "").toUpperCase()}
              </text>
            )}
          </>
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
              <span className="text-gray-400">Sector:</span>
              <span className="font-medium text-gray-200">{data.sector}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">Price:</span>
              <span className="font-semibold text-gray-100">
                {data.price?.toFixed(2) ?? "0.00"}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-400">% Change:</span>
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
              <span className="text-gray-400">Volume:</span>
              <span className="font-medium text-gray-200">
                {Number.isFinite(data.volume)
                  ? data.volume.toLocaleString()
                  : "0"}
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
      className="w-full h-full flex flex-col"
      style={{
        // Let parent container control height; only ensure background is correct
        backgroundColor: "transparent",
      }}
    >
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={treemapData}
            dataKey="size"
            stroke="#1a1d28" // Match sector background for cleaner look
            fill="transparent" // Transparent to inherit panel background
            content={<CustomizedContent />}
            isAnimationActive={true}
            animationDuration={600}
            animationEasing="ease-out"
            aspectRatio={4 / 3}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>

      {/* Legend - aligned with getColorFromChangePercent thresholds */}
      <div className="mt-2 flex items-center justify-center gap-4 text-xs flex-shrink-0">
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#166F00" }}
          ></div>
          <span className="text-gray-300">Strong gain (≥ +5%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#76E600" }}
          ></div>
          <span className="text-gray-300">Mild–moderate gain (0 → +5%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#FF661A" }}
          ></div>
          <span className="text-gray-300">Mild loss (0 → -2%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#F00000" }}
          ></div>
          <span className="text-gray-300">Moderate loss (-2 → -5%)</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: "#A10000" }}
          ></div>
          <span className="text-gray-300">Deep loss (≤ -5%)</span>
        </div>
      </div>
    </div>
  );
});

export default HeatmapChart;

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
