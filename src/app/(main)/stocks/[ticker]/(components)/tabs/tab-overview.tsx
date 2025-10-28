"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import type { Stock } from "@/types";
import PromotionalBanner from "@/components/ui/PromotionalBanner";
import CompanyInfo from "@/components/shared/CompanyInfo";
import { PriceHistoryChart, type PriceDataPoint } from "@/components/charts";

interface OverviewTabProps {
  stock: Stock;
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode();
  const [selectedPeriod, setSelectedPeriod] = useState("1y");

  // ==========================================
  // MOCK DATA - Thiết kế sẵn sàng để replace bằng real data từ API
  // TODO: Fetch từ API: GET /api/stocks/{ticker}/price-history?period={selectedPeriod}
  // ==========================================
  const mockPriceHistoryData: Record<string, PriceDataPoint[]> = {
    "7d": [
      { date: "2025-10-18", price: 245.27 },
      { date: "2025-10-19", price: 247.50 },
      { date: "2025-10-20", price: 243.80 },
      { date: "2025-10-21", price: 249.20 },
      { date: "2025-10-22", price: 251.30 },
      { date: "2025-10-23", price: 248.90 },
      { date: "2025-10-24", price: 254.04 },
    ],
    "1m": Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2025, 9, i + 1).toISOString().split('T')[0],
      price: 220 + Math.random() * 40,
    })),
    "3m": Array.from({ length: 90 }, (_, i) => ({
      date: new Date(2025, 7, i + 1).toISOString().split('T')[0],
      price: 200 + Math.random() * 60,
    })),
    "6m": Array.from({ length: 180 }, (_, i) => ({
      date: new Date(2025, 4, i + 1).toISOString().split('T')[0],
      price: 190 + Math.random() * 70,
    })),
    "YTD": Array.from({ length: 300 }, (_, i) => ({
      date: new Date(2025, 0, i + 1).toISOString().split('T')[0],
      price: 180 + Math.random() * 80,
    })),
    "1y": [
      { date: "Nov '24", price: 180.00 },
      { date: "Dec '24", price: 195.50 },
      { date: "Jan '25", price: 188.30 },
      { date: "Feb '25", price: 172.40 },
      { date: "Mar '25", price: 158.20 },
      { date: "Apr '25", price: 189.50 },
      { date: "May '25", price: 215.80 },
      { date: "Jun '25", price: 238.40 },
      { date: "Jul '25", price: 245.60 },
      { date: "Aug '25", price: 232.30 },
      { date: "Sep '25", price: 218.90 },
      { date: "Oct '25", price: 245.27 },
    ],
    "5y": Array.from({ length: 60 }, (_, i) => ({
      date: new Date(2020, i, 1).toISOString().split('T')[0],
      price: 100 + Math.random() * 160,
    })),
    "all": Array.from({ length: 120 }, (_, i) => ({
      date: new Date(2015, i, 1).toISOString().split('T')[0],
      price: 50 + Math.random() * 210,
    })),
  };

  // Get price history data dựa trên selected period
  const priceHistoryData = useMemo(
    () => mockPriceHistoryData[selectedPeriod] || mockPriceHistoryData["1y"],
    [selectedPeriod]
  );

  // Tính toán performance metrics
  const performanceMetrics = useMemo(() => {
    if (priceHistoryData.length < 2) {
      return {
        startPrice: 0,
        endPrice: 0,
        change: 0,
        changePercent: 0,
        dateRange: "",
      };
    }

    const startPrice = priceHistoryData[0].price;
    const endPrice = priceHistoryData[priceHistoryData.length - 1].price;
    const change = endPrice - startPrice;
    const changePercent = (change / startPrice) * 100;

    const startDate = priceHistoryData[0].date;
    const endDate = priceHistoryData[priceHistoryData.length - 1].date;

    return {
      startPrice,
      endPrice,
      change,
      changePercent,
      dateRange: `${startDate} - ${endDate}`,
    };
  }, [priceHistoryData]);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <div className="py-6">
        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* Main Chart + Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Left Column - Benchmarks + Price History (takes 3/4 width) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            {/* Benchmarks - Top Left */}
            <Card>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-base">
                    Benchmarks
                  </h4>
                  {/* Lock icon for unauthenticated state */}
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            {/* Price History - Bottom Left - Flex grow to match right column height */}
            <Card className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Price history
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                      Price ($)
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Time Period Buttons & Performance Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {["7d", "1m", "3m", "6m", "YTD", "1y", "5y", "all"].map(
                    (period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedPeriod === period
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                      >
                        {period}
                      </button>
                    )
                  )}
                  <button className="px-2 py-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md ml-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                    </svg>
                  </button>
                </div>

                {/* Performance indicator */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 dark:text-gray-400 font-medium">
                    {isStealthMode ? "•••• - ••••" : performanceMetrics.dateRange}
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span
                    className={`font-semibold ${performanceMetrics.change >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                      }`}
                  >
                    {isStealthMode
                      ? "••••"
                      : `${performanceMetrics.change >= 0 ? "+" : ""}$${performanceMetrics.change.toFixed(2)} (${performanceMetrics.change >= 0 ? "▲" : "▼"} ${Math.abs(performanceMetrics.changePercent).toFixed(2)}%)`}
                  </span>
                </div>
              </div>

              {/* Chart Container - Sử dụng PriceHistoryChart component */}
              <div className="relative min-h-[450px]">
                <PriceHistoryChart
                  data={priceHistoryData}
                  height={450}
                  isStealthMode={isStealthMode}
                  showMinMax={true}
                  color="#3B82F6"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - All Metrics (takes 1/4 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Estimate */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-4">
                Estimate
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">P/E</span>
                  <span className="font-medium text-gray-900 dark:text-white">37.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">EPS</span>
                  <span className="font-medium text-gray-900 dark:text-white">6.58</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Beta</span>
                  <span className="font-medium text-gray-900 dark:text-white">1.165</span>
                </div>
              </div>
            </Card>

            {/* Growth */}
            <Card>
              <h4 className="font-semibold text-gray-900 dark:text-white text-base mb-4">
                Growth
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Revenue, YoY</span>
                  <span className="font-medium text-green-600 dark:text-green-400">9.63%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Net income, YoY</span>
                  <span className="font-medium text-green-600 dark:text-green-400">9.26%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">FCF, YoY</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-8.62%</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Company Information with Description and FAQs */}
        <CompanyInfo ticker={stock.ticker} />
      </div>
    </div>
  );
}
