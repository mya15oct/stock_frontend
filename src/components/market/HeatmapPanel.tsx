/**
 * Heatmap Panel Component
 *
 * Panel bên phải hiển thị heatmap của tất cả stocks
 * Grouped by sector, colored by % change, sized by synthetic `size` field
 * (volume / biến động), không còn phụ thuộc vào marketCap cho kích thước.
 */

"use client";

import React from "react";
import HeatmapChart from "@/components/charts/HeatmapChart";
import { useRealtimeHeatmap } from "@/hooks/useRealtimeHeatmap";
import { useRealtimeContext } from "@/contexts/RealtimeContext";
import type { HeatmapData } from "@/types/market";

interface HeatmapPanelProps {
  heatmapData: ReturnType<typeof useRealtimeHeatmap>;
}

const HeatmapPanel = React.memo(function HeatmapPanel({ heatmapData: heatmapDataProp }: HeatmapPanelProps) {
  const { data: heatmapData, isLoading, error } = heatmapDataProp;
  const { isConnected } = useRealtimeContext();

  return (
    <div className="bg-white dark:bg-[#2a2d3a] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Market Heatmap
            </h3>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              Size: Volume | Color: % Change vs previous close
            </p>
          </div>
          {heatmapData && !isLoading && (
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                {heatmapData.totalStocks} stocks
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Area - Expanded to 520-600px height, no scrollbars */}
      <div className="flex-1 p-3 overflow-visible flex items-center justify-center min-h-0">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Loading heatmap...
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Fetching stock metadata...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="w-full h-full flex items-center justify-center text-red-500 dark:text-red-400">
            <div className="text-center">
              <p className="text-sm font-semibold mb-1">Failed to load heatmap</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{error}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Retrying automatically...
              </p>
            </div>
          </div>
        ) : heatmapData ? (
          // Chỉ hiển thị nếu có realtime data (có trades và connected)
          (() => {
            const hasRealtimeData = heatmapData.sectors.some((sector) =>
              sector.stocks.some((stock) => stock.price > 0 || stock.volume > 0)
            );

            // Removed blocking check for !isConnected || !hasRealtimeData
            // Always render the heatmap, even if data is partial (0 price/volume)
            // The chart handles 0 values gracefully or shows empty state

            return (
              <div
                className="w-full h-full rounded-md border border-white/8 dark:border-white/8 p-2 bg-transparent"
                style={{
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  minHeight: "520px",
                  maxHeight: "600px",
                }}
              >
                <HeatmapChart data={heatmapData} height={undefined} />
              </div>
            );

            return (
              <div
                className="w-full h-full rounded-md border border-white/8 dark:border-white/8 p-2 bg-transparent"
                style={{
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  minHeight: "520px",
                  maxHeight: "600px",
                }}
              >
                <HeatmapChart data={heatmapData} height={undefined} />
              </div>
            );
          })()
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-500">
            <p className="text-sm">No heatmap data available</p>
          </div>
        )}
      </div>

      {/* Footer - Sector Summary */}
      {heatmapData && !isLoading && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-[#1f2229]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 overflow-x-auto">
              {heatmapData.sectors.slice(0, 4).map((sector) => (
                <div
                  key={sector.sector}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {sector.displayName}:
                  </span>
                  <span
                    className={`font-semibold ${sector.avgChange >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                  >
                    {sector.avgChange >= 0 ? "+" : ""}
                    {sector.avgChange?.toFixed(2) ?? "0.00"}%
                  </span>
                </div>
              ))}
            </div>
            <span className="text-gray-500 dark:text-gray-500">
              {new Date(heatmapData.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default HeatmapPanel;
