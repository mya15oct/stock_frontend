import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState, useEffect } from "react";
import { stockService } from "@/services/stockService";
import type {
  PeriodType,
  FinancialDataResponse,
  StatementType,
  Stock,
} from "@/types";
import PromotionalBanner from "@/components/ui/PromotionalBanner";
import { AnimatedBarChart, CHART_COLORS } from "@/components/charts";
import { formatFinancialNumber, getFinancialScale } from "@/utils/format";

interface FinancialsTabProps {
  ticker: string;
}

type DisplayFormat = "values" | "changes" | "yoy";

export default function FinancialsTab({ ticker }: FinancialsTabProps) {
  const { isStealthMode } = useStealthMode();
  const [activeTab, setActiveTab] = useState<
    "income" | "balance" | "cashflow" | "statistics"
  >("income");
  const [periodType, setPeriodType] = useState<PeriodType>("quarterly");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("values");

  // API Data States
  const [incomeStatementData, setIncomeStatementData] =
    useState<FinancialDataResponse | null>(null);
  const [balanceSheetData, setBalanceSheetData] =
    useState<FinancialDataResponse | null>(null);
  const [cashFlowData, setCashFlowData] =
    useState<FinancialDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected metrics for chart
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [income, balance, cashflow] = await Promise.all([
          stockService.getFinancials(ticker, "income", periodType),
          stockService.getFinancials(ticker, "balance", periodType),
          stockService.getFinancials(ticker, "cash", periodType),
        ]);

        setIncomeStatementData(income);
        setBalanceSheetData(balance);
        setCashFlowData(cashflow);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch financial data"
        );
        console.error("Error fetching financial data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [ticker, periodType]);

  // Toggle metric selection for chart
  const toggleMetric = (metricName: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricName)) {
        return prev.filter((m) => m !== metricName);
      } else {
        // Limit to 8 metrics for better visibility
        if (prev.length >= 8) {
          return [...prev.slice(1), metricName];
        }
        return [...prev, metricName];
      }
    });
  };

  // Clear all selected metrics
  const clearAllMetrics = () => {
    setSelectedMetrics([]);
  };

  // Prepare chart data
  const getChartData = () => {
    const data = getCurrentData();
    if (!data) return [];

    // Filter metrics that exist in current data
    const availableMetrics = selectedMetrics.filter(
      (metric) => data.data[metric] !== undefined
    );

    return data.periods.map((period: string) => {
      const dataPoint: any = { period };
      availableMetrics.forEach((metric) => {
        const values = data.data[metric] as Record<string, number>;
        if (values && values[period] !== undefined) {
          dataPoint[metric] = values[period];
        }
      });
      return dataPoint;
    });
  };

  // Calculate the best scale for Y-axis based on selected metrics
  const getChartScale = () => {
    const chartData = getChartData();
    const allValues: number[] = [];

    chartData.forEach((dataPoint) => {
      selectedMetrics.forEach((metric) => {
        const value = dataPoint[metric];
        if (typeof value === 'number' && !isNaN(value)) {
          allValues.push(Math.abs(value));
        }
      });
    });

    if (allValues.length === 0) {
      return { divisor: 1, label: "USD" };
    }

    const scale = getFinancialScale(allValues);
    return {
      divisor: scale.divisor,
      label: `USD ${scale.label}`,
    };
  };

  // Format for table: Always show in Millions, no suffix
  const formatValueForTable = (value: number | undefined) => {
    if (isStealthMode) return "••••";
    if (value === undefined) return "-";

    // Convert to millions and format with comma separator
    const inMillions = value / 1e6;
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(inMillions);
  };

  // Format for chart: Keep the original function with M/B suffix
  const formatValue = (value: number | undefined) => {
    if (isStealthMode) return "••••";
    if (value === undefined) return "-";
    return formatFinancialNumber(value);
  };

  const getCurrentData = (): FinancialDataResponse | null => {
    switch (activeTab) {
      case "income":
        return incomeStatementData;
      case "balance":
        return balanceSheetData;
      case "cashflow":
        return cashFlowData;
      default:
        return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "income":
        return "Income Statement";
      case "balance":
        return "Balance Sheet";
      case "cashflow":
        return "Cash Flow Statement";
      default:
        return "";
    }
  };

  const renderFinancialTable = () => {
    const data = getCurrentData();

    if (!data) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-6 font-medium text-gray-600 sticky left-0 bg-gray-50 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 text-gray-400">⋮</span>
                </div>
              </th>
              {data.periods.map((period) => (
                <th
                  key={period}
                  className="text-right py-3 px-6 font-medium text-gray-600 min-w-[120px]"
                >
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.data).map(([itemName, values], index) => {
              const isSelected = selectedMetrics.includes(itemName);
              const selectedIndex = selectedMetrics.indexOf(itemName);
              const barColor = isSelected
                ? CHART_COLORS.primary[
                selectedIndex % CHART_COLORS.primary.length
                ]
                : "transparent";

              return (
                <tr
                  key={itemName}
                  onClick={() => toggleMetric(itemName)}
                  className={`border-b border-gray-100 cursor-pointer transition-all ${index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    } ${isSelected
                      ? "!bg-blue-50 hover:!bg-blue-100"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <td className="py-3 px-6 text-gray-700 sticky left-0 bg-inherit">
                    <div className="relative flex items-center gap-2">
                      <div
                        className="w-1 h-6 rounded-full transition-all"
                        style={{
                          backgroundColor: barColor,
                          opacity: isSelected ? 1 : 0
                        }}
                      />
                      <span
                        className={`text-sm ${isSelected ? "font-medium text-gray-900" : "text-gray-700"
                          }`}
                      >
                        {itemName}
                      </span>
                    </div>
                  </td>
                  {data.periods.map((period) => (
                    <td
                      key={period}
                      className="py-3 px-6 text-right text-gray-700 text-sm"
                    >
                      {formatValueForTable(values[period])}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Controls - Tabs and Dropdowns */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        {/* Statement Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("income")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "income"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Income statement
          </button>
          <button
            onClick={() => setActiveTab("balance")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "balance"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Balance sheet
          </button>
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "cashflow"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Cash flow
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "statistics"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Statistics
          </button>
        </div>

        {/* Period Type and Display Format Selectors */}
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
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

          <div className="relative">
            <select
              value={displayFormat}
              onChange={(e) => setDisplayFormat(e.target.value as DisplayFormat)}
              className="appearance-none px-4 py-2 pr-8 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="values">Values, USD</option>
              <option value="changes">Changes, %</option>
              <option value="yoy">YoY Growth, %</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
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
        </div>
      </div>

      {/* Chart Card - Show when metrics are selected */}
      {!loading && !error && getCurrentData() && selectedMetrics.length > 0 && (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                📊 Visualization
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedMetrics.length} metric
                {selectedMetrics.length > 1 ? "s" : ""} selected
              </p>
            </div>
            <button
              onClick={clearAllMetrics}
              className="text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Clear all
            </button>
          </div>
          {(() => {
            const scale = getChartScale();
            return (
              <AnimatedBarChart
                data={getChartData()}
                metrics={selectedMetrics.filter(
                  (m) => getCurrentData()?.data[m] !== undefined
                )}
                colors={CHART_COLORS.primary}
                height={400}
                isStealthMode={isStealthMode}
                animationDuration={1200}
                staggerDelay={100}
                yAxisLabel={scale.label}
                yAxisDivisor={scale.divisor}
              />
            );
          })()}
        </Card>
      )}

      {/* Data Card */}
      <Card className="p-0 overflow-hidden">

        {loading && (
          <div className="text-center py-12 px-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            <p className="mt-4 text-gray-600">Loading financial data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 m-6">
            <p className="font-medium">Error loading financial data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && renderFinancialTable()}

        {!loading && !error && !getCurrentData() && (
          <div className="text-center py-12 text-gray-500">
            <p>No financial data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}
