"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import type { Stock } from "@/types";
import { BACKEND_URL } from "@/services/apiBase";

import CompanyInfo from "@/components/shared/CompanyInfo";
import { PriceHistoryChart, type PriceDataPoint, type ChartType } from "@/components/charts";
import PeriodSelector from "../PeriodSelector";
import { DropdownMenu, DropdownItem } from "@/components/ui/DropdownMenu";

interface OverviewTabProps {
  stock: Stock;
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode();
  const [selectedPeriod, setSelectedPeriod] = useState("1m");
  const [priceHistoryData, setPriceHistoryData] = useState<PriceDataPoint[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<PriceDataPoint[]>([]); // S&P 500 Data
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>("line");

  // Fetch real price data from API
  useEffect(() => {
    const fetchPriceHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Map frontend period labels to API period values
        const periodMap: Record<string, string> = {
          "1d": "1d",
          "5d": "5d",
          "1m": "1m",
          "3m": "3m",
          "6m": "6m",
          "ytd": "ytd",
          "1y": "1y",
          "5y": "5y",
          "max": "max",
        };

        const apiPeriod = periodMap[selectedPeriod] || "1m";
        const url = `${BACKEND_URL}/api/stocks/${stock.ticker}/price-history?period=${apiPeriod}`;

        console.log(`[OverviewTab] Fetching price history: ${url}`);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch price history: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
          throw new Error("Invalid API response format");
        }

        // Transform API data to PriceDataPoint format with OHLC
        const transformedData: PriceDataPoint[] = result.data.map((item: any) => ({
          date: item.date,
          price: item.close, // Use closing price for line chart
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        setPriceHistoryData(transformedData);
        console.log(`[OverviewTab] Loaded ${transformedData.length} price records for period ${selectedPeriod}`);
        console.log(`[OverviewTab] Date range: ${transformedData[0]?.date} to ${transformedData[transformedData.length - 1]?.date}`);

        // Fetch Benchmark Data if enabled
        if (showBenchmark) {
          const benchUrl = `${BACKEND_URL}/api/stocks/%5EGSPC/price-history?period=${apiPeriod}`;
          console.log(`[OverviewTab] Fetching benchmark history: ${benchUrl}`);

          try {
            const benchRes = await fetch(benchUrl);
            if (benchRes.ok) {
              const benchResult = await benchRes.json();
              if (benchResult.success && benchResult.data) {
                const benchTransformed: PriceDataPoint[] = benchResult.data.map((item: any) => ({
                  date: item.date,
                  price: item.close,
                }));
                setBenchmarkData(benchTransformed);
              }
            }
          } catch (benchErr) {
            console.error("Failed to fetch benchmark data", benchErr);
            // Don't block main chart rendering on benchmark error
          }
        } else {
          setBenchmarkData([]);
        }

      } catch (err) {
        console.error("[OverviewTab] Error fetching price history:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setPriceHistoryData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriceHistory();
  }, [stock.ticker, selectedPeriod, showBenchmark]);

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
    <div className=" bg-white dark:bg-gray-900 min-h-screen transition-colors">
      <div className="py-6">


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
                  {/* Chart Type Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                    <button
                      onClick={() => setChartType("line")}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${chartType === "line"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      title="Line Chart"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setChartType("candlestick")}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${chartType === "candlestick"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      title="Candlestick Chart"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 3v4m0 4v10m6-18v10m0 4v4M6 13h6m0 0h6"
                        />
                      </svg>
                    </button>
                  </div>

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

                  {/* Dropdown Menu for Compare */}
                  <DropdownMenu
                    trigger={
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
                    }
                  >
                    <DropdownItem
                      onClick={() => setShowBenchmark(!showBenchmark)}
                      active={showBenchmark}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Compare with S&P 500</span>
                        {showBenchmark && (
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </DropdownItem>
                  </DropdownMenu>

                </div>
              </div>

              {/* Chart Container - Sử dụng PriceHistoryChart component */}
              <div className="relative min-h-[450px]">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading chart data...
                      </span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <div className="text-center px-4">
                      <svg
                        className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                        Failed to load chart data
                      </p>
                      <p className="text-xs text-red-500 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  </div>
                ) : (
                  <PriceHistoryChart
                    data={priceHistoryData}
                    benchmarkData={benchmarkData}
                    height={450}
                    isStealthMode={isStealthMode}
                    showMinMax={true}
                    color="#3B82F6"
                    period={selectedPeriod}
                    chartType={chartType}
                  />
                )}
              </div>

              {/* Period Selector with % changes - Below Chart */}
              <PeriodSelector
                ticker={stock.ticker}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                currentPrice={priceHistoryData[priceHistoryData.length - 1]?.price || 0}
              />
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
                  <span className="font-medium text-gray-900 dark:text-white">
                    {isStealthMode ? "••••" : stock.pe ? stock.pe.toFixed(2) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">EPS</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {isStealthMode ? "••••" : stock.eps ? stock.eps.toFixed(2) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Beta</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {isStealthMode ? "••••" : stock.beta ? stock.beta.toFixed(3) : "—"}
                  </span>
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
                  <span className={`font-medium ${stock.revenueGrowth && stock.revenueGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isStealthMode ? "••••" : stock.revenueGrowth ? `${stock.revenueGrowth.toFixed(2)}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Net income, YoY</span>
                  <span className={`font-medium ${stock.netIncomeGrowth && stock.netIncomeGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isStealthMode ? "••••" : stock.netIncomeGrowth ? `${stock.netIncomeGrowth.toFixed(2)}%` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">FCF, YoY</span>
                  <span className={`font-medium ${stock.fcfGrowth && stock.fcfGrowth >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {isStealthMode ? "••••" : stock.fcfGrowth ? `${stock.fcfGrowth.toFixed(2)}%` : "—"}
                  </span>
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
