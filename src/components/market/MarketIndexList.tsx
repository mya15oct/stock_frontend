/**
 * Market Index List Component
 * 
 * Danh sách các chỉ số thị trường với mini sparkline chart
 * Hiển thị: VNINDEX, HNXINDEX, UPINDEX, VN30, VN30F1M, VN30F2M...
 */

"use client";

import React from "react";
import SparklineChart from "./SparklineChart";

interface MarketIndex {
  code: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  sparklineData: number[];
}

// Mock data - Replace with real API later
const MOCK_INDICES: MarketIndex[] = [
  {
    code: "VNINDEX",
    name: "Chỉ số VNINDEX",
    value: 1654.42,
    change: 18.96,
    changePercent: 1.16,
    sparklineData: [1630, 1635, 1640, 1638, 1645, 1650, 1648, 1654],
  },
  {
    code: "HNXINDEX",
    name: "Chỉ số HNXINDEX",
    value: 268.69,
    change: 1.08,
    changePercent: 0.40,
    sparklineData: [267, 267.5, 268, 267.8, 268.2, 268.5, 268.3, 268.69],
  },
  {
    code: "UPINDEX",
    name: "Chỉ số UPINDEX",
    value: 120.66,
    change: 0.57,
    changePercent: 0.47,
    sparklineData: [120, 120.1, 120.3, 120.2, 120.4, 120.5, 120.6, 120.66],
  },
  {
    code: "VN30",
    name: "Chỉ số VN30",
    value: 1893.54,
    change: 22.00,
    changePercent: 1.18,
    sparklineData: [1870, 1875, 1880, 1878, 1885, 1890, 1888, 1893.54],
  },
  {
    code: "VN30F1M",
    name: "Hợp đồng tương lai VN30F1M",
    value: 1895.2,
    change: 25.5,
    changePercent: 1.36,
    sparklineData: [1868, 1872, 1878, 1880, 1888, 1892, 1890, 1895.2],
  },
  {
    code: "VN30F2M",
    name: "Hợp đồng tương lai VN30F2M",
    value: 1891.1,
    change: 23.8,
    changePercent: 1.28,
    sparklineData: [1866, 1870, 1876, 1878, 1885, 1889, 1887, 1891.1],
  },
];

export default function MarketIndexList() {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {MOCK_INDICES.map((index) => {
          const isPositive = index.change >= 0;

          return (
            <div
              key={index.code}
              className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Code and Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {index.code}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {index.name}
                  </div>
                </div>

                {/* Center: Sparkline */}
                <div className="w-20 h-8">
                  <SparklineChart
                    data={index.sparklineData}
                    color={isPositive ? "#10b981" : "#ef4444"}
                    height={32}
                  />
                </div>

                {/* Right: Value and Change */}
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {index.value.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs font-medium ${
                      isPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {index.change.toFixed(2)} / {isPositive ? "+" : ""}
                    {index.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
