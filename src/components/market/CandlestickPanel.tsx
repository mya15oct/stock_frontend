/**
 * Candlestick Panel Component
 *
 * Panel bên trái hiển thị biểu đồ nến theo phong cách TradingView
 * Features:
 * - Tabs khu vực: Việt Nam, Châu Mỹ, Châu Âu, Châu Á
 * - Period selector: 1d = 1 ngày, 1m = 1 tháng, 3m = 3 tháng, 6m = 6 tháng, 1y = 1 năm, 3y = 3 năm, 5y = 5 năm
 * - OHLC + Volume + MA indicators
 * - Icon controls: Candlestick type, Functions
 *
 * TODO: WebSocket realtime candle updates
 */

"use client";

import React, { useState, useEffect } from "react";
import type { CandlestickDataset, TimeframeType } from "@/types/market";
import { marketService } from "@/services/marketService";
import CandlestickChart from "@/components/charts/CandlestickChart";

const PERIODS: { label: string; value: TimeframeType }[] = [
  { label: "1d", value: "1D" },
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "6m", value: "6m" },
  { label: "1y", value: "1y" },
  { label: "3y", value: "3y" },
  { label: "5y", value: "5y" },
];

const REGIONS = [
  { label: "Việt Nam", value: "vn" },
  { label: "Châu Mỹ", value: "us" },
  { label: "Châu Âu", value: "eu" },
  { label: "Châu Á", value: "asia" },
];

export interface CandlestickPanelProps {
  initialTicker?: string;
}

export default function CandlestickPanel({
  initialTicker = "SPY",
}: CandlestickPanelProps) {
  const [selectedRegion, setSelectedRegion] = useState("vn");
  const [timeframe, setTimeframe] = useState<TimeframeType>("1m");
  const [dataset, setDataset] = useState<CandlestickDataset | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock OHLCV data for display
  const mockOHLCV = {
    open: 1640.47,
    high: 1654.68,
    low: 1640.47,
    close: 1654.42,
    volume: 661.27, // In millions
    ma10: 1627.59,
    ma50: 1688.13,
  };

  useEffect(() => {
    loadCandles();
  }, [selectedRegion, timeframe]);

  async function loadCandles() {
    setIsLoading(true);
    try {
      // Mock data for now - replace with real API
      console.log(`[CandlestickPanel] Loading candles for region=${selectedRegion}, timeframe=${timeframe}`);
      const data = await marketService.getCandles("VNINDEX", timeframe);
      console.log(`[CandlestickPanel] Loaded ${data.bars.length} candles`, data);
      setDataset(data);
    } catch (error) {
      console.error("Failed to load candles:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[#1a1d28] text-white border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header with Region Tabs and Icons */}
      <div className="border-b border-gray-700">
        {/* Region Tabs */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          <div className="flex gap-1">
            {REGIONS.map((region) => (
              <button
                key={region.value}
                onClick={() => setSelectedRegion(region.value)}
                className={`
                  px-4 py-1.5 text-sm font-medium transition-colors rounded
                  ${
                    selectedRegion === region.value
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  }
                `}
              >
                {region.label}
              </button>
            ))}
          </div>

          {/* Icon Controls */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Biểu đồ nến">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="6" y="4" width="3" height="16" />
                <line x1="7.5" y1="4" x2="7.5" y2="2" strokeWidth="1.5" />
                <line x1="7.5" y1="20" x2="7.5" y2="22" strokeWidth="1.5" />
                <rect x="15" y="8" width="3" height="8" />
                <line x1="16.5" y1="8" x2="16.5" y2="4" strokeWidth="1.5" />
                <line x1="16.5" y1="16" x2="16.5" y2="20" strokeWidth="1.5" />
              </svg>
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Functions">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <text x="4" y="18" fontSize="16" fontStyle="italic" fill="currentColor">fx</text>
              </svg>
            </button>
            <button className="p-1.5 hover:bg-gray-700 rounded transition-colors" title="Settings">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6" />
              </svg>
            </button>
          </div>
        </div>

        {/* OHLCV Info */}
        <div className="px-3 py-2 flex items-center gap-4 text-xs">
          <span className="text-gray-400">O</span>
          <span className="text-white font-medium">{mockOHLCV.open.toFixed(2)}</span>
          <span className="text-gray-400">H</span>
          <span className="text-white font-medium">{mockOHLCV.high.toFixed(2)}</span>
          <span className="text-gray-400">L</span>
          <span className="text-white font-medium">{mockOHLCV.low.toFixed(2)}</span>
          <span className="text-gray-400">C</span>
          <span className="text-white font-medium">{mockOHLCV.close.toFixed(2)}</span>
          <span className="text-gray-400">Vol</span>
          <span className="text-white font-medium">{mockOHLCV.volume.toFixed(2)}M</span>
          <span className="text-blue-400 ml-2">MA10</span>
          <span className="text-white font-medium">{mockOHLCV.ma10.toFixed(2)}</span>
          <span className="text-purple-400">MA50</span>
          <span className="text-white font-medium">{mockOHLCV.ma50.toFixed(2)}</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 p-3 overflow-hidden bg-[#131722]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-gray-400">
                Loading candles...
              </p>
            </div>
          </div>
        ) : dataset && dataset.bars.length > 0 ? (
          <CandlestickChart
            data={dataset.bars}
            height={400}
            showVolume={true}
            showGrid={true}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <p className="text-sm">No candle data available</p>
          </div>
        )}
      </div>

      {/* Footer - Period Selector */}
      <div className="border-t border-gray-700 px-3 py-2 bg-[#1a1d28]">
        <div className="flex items-center gap-1">
          {PERIODS.map((period) => (
            <button
              key={period.value}
              onClick={() => setTimeframe(period.value)}
              className={`
                px-3 py-1 text-xs font-medium rounded transition-colors
                ${
                  timeframe === period.value
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                }
              `}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
