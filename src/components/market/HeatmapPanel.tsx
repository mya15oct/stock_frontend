/**
 * Heatmap Panel Component
 *
 * Panel bên phải hiển thị heatmap của tất cả stocks
 * Grouped by sector, colored by % change, sized by market cap
 *
 * TODO: WebSocket realtime price updates
 */

"use client";

import React, { useState, useEffect } from "react";
import type { HeatmapData } from "@/types/market";
import { marketService } from "@/services/marketService";
import HeatmapChart from "@/components/charts/HeatmapChart";

export default function HeatmapPanel() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHeatmap();

    // Auto-refresh every 10 seconds (fallback khi chưa có WebSocket)
    const interval = setInterval(() => {
      loadHeatmap();
    }, 10000);

    return () => clearInterval(interval);

    // TODO: Replace with WebSocket
    // const ws = new HeatmapWebSocket((updates) => {
    //   // Batch update prices
    //   setHeatmapData((prev) => {
    //     if (!prev) return prev;
    //
    //     const sectors = prev.sectors.map((sector) => ({
    //       ...sector,
    //       stocks: sector.stocks.map((stock) => {
    //         const update = updates.find((u) => u.ticker === stock.ticker);
    //         if (update) {
    //           return {
    //             ...stock,
    //             price: update.price,
    //             change: update.change,
    //             changePercent: update.changePercent,
    //           };
    //         }
    //         return stock;
    //       }),
    //     }));
    //
    //     return { ...prev, sectors, lastUpdate: new Date().toISOString() };
    //   });
    // });
    // ws.connect();
    // return () => ws.disconnect();
  }, []);

  async function loadHeatmap() {
    try {
      const data = await marketService.getHeatmap();
      setHeatmapData(data);
    } catch (error) {
      console.error("Failed to load heatmap:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[#2a2d3a] border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-700 px-3 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-100">
              Biểu đồ nhiệt thị trường
            </h3>
            <p className="text-[10px] text-gray-400">
              Kích thước: Vốn hóa | Màu sắc: % Thay đổi
            </p>
          </div>
          {heatmapData && !isLoading && (
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-100">
                {heatmapData.totalStocks} stocks
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap Area */}
      <div className="flex-1 p-2 overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">
                Loading heatmap...
              </p>
            </div>
          </div>
        ) : heatmapData ? (
          <HeatmapChart data={heatmapData} height={480} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <p className="text-sm">No heatmap data available</p>
          </div>
        )}
      </div>

      {/* Footer - Sector Summary */}
      {heatmapData && !isLoading && (
        <div className="border-t border-gray-700 px-4 py-2 bg-[#1f2229]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 overflow-x-auto">
              {heatmapData.sectors.slice(0, 4).map((sector) => (
                <div
                  key={sector.sector}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <span className="text-gray-400">
                    {sector.displayName}:
                  </span>
                  <span
                    className={`font-semibold ${
                      sector.avgChange >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {sector.avgChange >= 0 ? "+" : ""}
                    {sector.avgChange?.toFixed(2) ?? "0.00"}%
                  </span>
                </div>
              ))}
            </div>
            <span className="text-gray-500">
              {new Date(heatmapData.lastUpdate).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
