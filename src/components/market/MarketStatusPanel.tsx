/**
 * Market Status Panel Component
 *
 * Panel giữa hiển thị:
 * - Tabs: Biến động | Nước ngoài | Tự doanh | Thanh khoản
 * - Pie Chart: Số lượng mã tăng/giảm/không đổi
 * - Bar Chart: Phân bổ dòng tiền
 */

"use client";

import React, { useState, useEffect } from "react";
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
  Legend,
  CartesianGrid,
} from "recharts";
import type { MarketStatus, MarketStatusTab } from "@/types/market";
import { marketService } from "@/services/marketService";

const TABS = [
  { label: "Dòng tiền", value: "movement" as MarketStatusTab },
  { label: "Tác động tới index", value: "index_impact" as MarketStatusTab },
];

const COLORS = {
  advancing: "#10b981", // Green
  declining: "#ef4444", // Red
  unchanged: "#fbbf24", // Yellow
};

export default function MarketStatusPanel() {
  const [activeTab, setActiveTab] = useState<MarketStatusTab>("movement");
  const [status, setStatus] = useState<MarketStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStatus();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function loadStatus() {
    try {
      const data = await marketService.getMarketStatus();
      setStatus(data);
    } catch (error) {
      console.error("Failed to load market status:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading || !status) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 h-full">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Prepare data for Pie Chart
  const pieData = [
    { name: "Tăng", value: status.advancing, color: COLORS.advancing },
    { name: "Giảm", value: status.declining, color: COLORS.declining },
    { name: "Không đổi", value: status.unchanged, color: COLORS.unchanged },
  ];

  const totalStocks = status.advancing + status.declining + status.unchanged;

  // Prepare data for Bar Chart (Cash Flow)
  const barData = [
    {
      name: "Tăng",
      value: status.cashFlow.advancing,
      color: COLORS.advancing,
    },
    {
      name: "Giảm",
      value: status.cashFlow.declining,
      color: COLORS.declining,
    },
    {
      name: "Kh. đổi",
      value: status.cashFlow.unchanged,
      color: COLORS.unchanged,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`
                flex-1 px-3 py-1.5 text-sm font-medium transition-colors
                ${
                  activeTab === tab.value
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-gray-700"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 overflow-hidden flex items-center">
        {/* Tab: Biến động */}
        {activeTab === "movement" && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {/* LEFT: Pie Chart - Số lượng mã */}
            <div className="flex flex-col justify-center">
              <h3 className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Số lượng CP Tăng, Giảm, Không đổi
              </h3>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={70}
                    paddingAngle={0}
                    dataKey="value"
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      name,
                      value,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 18;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="currentColor"
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          className="text-xs font-medium"
                        >
                          {`${name} (${value})`}
                        </text>
                      );
                    }}
                    labelLine={{
                      stroke: "#94a3b8",
                      strokeWidth: 1,
                    }}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT: Bar Chart - Phân bổ dòng tiền */}
            <div className="flex flex-col justify-center">
              <h3 className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Phân bổ dòng tiền
              </h3>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart
                  data={barData}
                  margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    stroke="#94a3b8"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#94a3b8"
                    tickFormatter={(value) => `${value.toFixed(0)} tỷ`}
                    domain={[0, (dataMax: number) => Math.ceil(dataMax / 1000) * 1000]}
                  />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#374151"
                    strokeWidth={0.5}
                    vertical={false}
                  />
                  <Tooltip
                    formatter={(value: number) => `${value.toFixed(1)} tỷ`}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[4, 4, 0, 0]}
                    label={{
                      position: "top",
                      formatter: (value: number) => `${value.toFixed(1)} tỷ`,
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
        )}

        {/* Tab: Tác động tới index */}
        {activeTab === "index_impact" && (
          <div className="w-full text-center py-12 text-gray-400">
            <p className="text-sm">Dữ liệu tác động tới index đang được cập nhật</p>
            <p className="text-xs mt-2">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
