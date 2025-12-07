/**
 * Index Card Component
 *
 * Display thông tin cho 1 market index (SPY, QQQ, DIA, IWM)
 * Hiển thị: giá, change, sparkline mini chart
 */

"use client";

import React from "react";
import type { MarketIndex } from "@/types/market";
import SparklineChart from "./SparklineChart";

export interface IndexCardProps {
  index: MarketIndex;
  onClick?: () => void;
}

export default function IndexCard({ index, onClick }: IndexCardProps) {
  // Guard against undefined values
  if (!index || typeof index.price === "undefined") {
    return null;
  }

  const isPositive = index.changePercent >= 0;

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700
        rounded-lg p-2
        transition-all duration-200
        ${onClick ? "cursor-pointer hover:shadow-md hover:border-blue-400" : ""}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
            {index.code}
          </h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
            {index.name}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            ${index.price?.toFixed(2) ?? "0.00"}
          </span>
          <div
            className={`text-[10px] font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {index.change?.toFixed(2) ?? "0.00"} ({isPositive ? "+" : ""}
            {index.changePercent?.toFixed(2) ?? "0.00"}%)
          </div>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="mt-1 flex items-center justify-between">
        <SparklineChart
          data={index.sparklineData}
          width={100}
          height={24}
          isPositive={isPositive}
        />
        <div className="text-right">
          <div className="text-[10px] text-gray-500 dark:text-gray-400">
            H: ${index.high?.toFixed(2) ?? "0.00"}
          </div>
          <div className="text-[10px] text-gray-500 dark:text-gray-400">
            L: ${index.low?.toFixed(2) ?? "0.00"}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function
function formatVolume(volume: number): string {
  if (!volume || isNaN(volume)) return "0";

  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  } else if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  } else if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}
