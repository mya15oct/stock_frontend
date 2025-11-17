/**
 * Advanced Candlestick Chart Component
 *
 * Hiển thị biểu đồ nến với OHLCV data
 * Features:
 * - 🕯️ Candlestick rendering with green/red colors
 * - 📊 Volume bars below
 * - 📈 Support multiple timeframes
 * - ✨ Smooth animations
 *
 * TODO: Add realtime WebSocket updates
 */

"use client";

import React, { useMemo, useCallback } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import type { CandleBar } from "@/types/market";

export interface CandlestickChartProps {
  data: CandleBar[];
  height?: number;
  showVolume?: boolean;
  showGrid?: boolean;
}

export default function CandlestickChart({
  data,
  height = 500,
  showVolume = true,
  showGrid = true,
}: CandlestickChartProps) {
  // Calculate min/max for Y-axis domain
  const { minPrice, maxPrice, maxVolume } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 1000000 };
    }

    const prices = data.flatMap((d) => [d.high, d.low]);
    const volumes = data.map((d) => d.volume);

    return {
      minPrice: Math.min(...prices) * 0.998,
      maxPrice: Math.max(...prices) * 1.002,
      maxVolume: Math.max(...volumes),
    };
  }, [data]);

  // Format data for display
  const chartData = useMemo(() => {
    return data.map((candle, index) => ({
      ...candle,
      index,
      time: formatTime(candle.time),
      _time: new Date(candle.time).getTime(),
      // Create range for candlestick body
      range: [Math.min(candle.open, candle.close), Math.max(candle.open, candle.close)],
      isUp: candle.close >= candle.open,
    }));
  }, [data]);

  // Custom Candlestick Shape
  const CandleShape = useCallback((props: any) => {
    const { x, y, width, height, payload } = props;
    
    if (!payload || !x || !y) return null;

    const { open, high, low, close, isUp } = payload;
    const fillColor = isUp ? "#10b981" : "#ef4444";
    const strokeColor = isUp ? "#059669" : "#dc2626";

    // Calculate positions relative to the chart
    const chartHeight = props.height || 400;
    const chartTop = props.y || 0;
    
    // Scale values to pixel positions
    const priceRange = maxPrice - minPrice;
    const pixelPerPrice = chartHeight / priceRange;
    
    const yHigh = chartTop + (maxPrice - high) * pixelPerPrice;
    const yLow = chartTop + (maxPrice - low) * pixelPerPrice;
    const yOpen = chartTop + (maxPrice - open) * pixelPerPrice;
    const yClose = chartTop + (maxPrice - close) * pixelPerPrice;
    
    const bodyTop = Math.min(yOpen, yClose);
    const bodyBottom = Math.max(yOpen, yClose);
    const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
    
    const candleX = x + width / 2;
    const candleWidth = Math.max(width * 0.9, 5);

    return (
      <g>
        {/* Wick */}
        <line
          x1={candleX}
          y1={yHigh}
          x2={candleX}
          y2={yLow}
          stroke={strokeColor}
          strokeWidth={1.5}
        />
        {/* Body */}
        <rect
          x={candleX - candleWidth / 2}
          y={bodyTop}
          width={candleWidth}
          height={bodyHeight}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1}
        />
      </g>
    );
  }, [minPrice, maxPrice]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    if (!data || typeof data.open === "undefined" || typeof data.close === "undefined") {
      return null;
    }

    const isUp = data.close >= data.open;

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-xs text-gray-400 mb-2">
          {formatFullTime(data.time)}
        </p>
        <div className="space-y-1 text-xs text-white">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Open:</span>
            <span className="font-semibold">{data.open?.toFixed(2) ?? "0.00"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">High:</span>
            <span className="font-semibold text-green-400">{data.high?.toFixed(2) ?? "0.00"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Low:</span>
            <span className="font-semibold text-red-400">{data.low?.toFixed(2) ?? "0.00"}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Close:</span>
            <span className={`font-semibold ${isUp ? "text-green-400" : "text-red-400"}`}>
              {data.close?.toFixed(2) ?? "0.00"}
            </span>
          </div>
          {showVolume && (
            <div className="flex justify-between gap-4 pt-1 border-t border-gray-700">
              <span className="text-gray-400">Volume:</span>
              <span className="font-semibold">{formatVolume(data.volume)}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        No candle data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        barGap={1}
        barCategoryGap="8%"
      >
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
        )}

        <XAxis
          dataKey="index"
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickFormatter={(value) => {
            const item = chartData[value];
            return item ? formatAxisTime(item._time) : "";
          }}
          interval="preserveStartEnd"
          minTickGap={50}
          stroke="#374151"
        />

        <YAxis
          yAxisId="price"
          orientation="right"
          domain={[minPrice, maxPrice]}
          tick={{ fill: "#9ca3af", fontSize: 11 }}
          tickFormatter={(value) => `${value?.toFixed(2) ?? "0.00"}`}
          width={65}
          stroke="#374151"
        />

        {showVolume && (
          <YAxis
            yAxisId="volume"
            orientation="left"
            domain={[0, maxVolume * 4]}
            hide
          />
        )}

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6b7280", strokeWidth: 1 }} />

        {/* Volume Bars */}
        {showVolume && (
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#6b7280"
            opacity={0.4}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`vol-${index}`}
                fill={entry.isUp ? "#10b981" : "#ef4444"}
                opacity={0.4}
              />
            ))}
          </Bar>
        )}

        {/* Candlesticks using Bar with custom shape */}
        <Bar
          yAxisId="price"
          dataKey="range"
          shape={<CandleShape height={height} />}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

function formatFullTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

function formatAxisTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatVolume(volume: number): string {
  if (!volume || isNaN(volume)) return "0";

  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}
