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
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-900 sticky left-0 bg-white z-10">
                Line Item
              </th>
              {data.periods.map((period) => (
                <th
                  key={period}
                  className="text-center py-3 px-4 font-medium text-gray-500 min-w-[120px]"
                >
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data.data).map(([itemName, values]) => {
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
                  className={`border-b border-gray-100 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/50 hover:bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 text-gray-700 sticky left-0 bg-inherit">
                    <div className="relative">
                      {/* Color indicator khi được chọn */}
                      <div
                        className="absolute left-[-16px] top-[-12px] bottom-[-12px] w-1 transition-all rounded-r"
                        style={{ backgroundColor: barColor }}
                      />
                      <span
                        className={`font-medium ${
                          isSelected ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {itemName}
                      </span>
                    </div>
                  </td>
                  {data.periods.map((period) => (
                    <td
                      key={period}
                      className="py-3 px-4 text-center text-gray-700"
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

      {/* Hint Card */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <span className="text-yellow-500 text-lg">💡</span>
          <div className="flex-1">
            <p className="font-medium">
              Click on any row in the table to visualize it on the chart
            </p>
            <p className="text-gray-600 text-xs mt-1">
              You can select up to 8 metrics at once
            </p>
          </div>
          {selectedMetrics.length > 0 && (
            <button
              onClick={clearAllMetrics}
              className="ml-auto text-blue-600 hover:text-blue-700 font-medium text-sm whitespace-nowrap"
            >
              Clear all ({selectedMetrics.length})
            </button>
          )}
        </div>
      </Card>

      {/* Controls Card */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Statement Type Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("income")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "income"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Income Statement
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "balance"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Balance Sheet
            </button>
            <button
              onClick={() => setActiveTab("cashflow")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === "cashflow"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cash Flow
            </button>
          </div>

          {/* Period Type Selector */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setPeriodType("quarterly")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodType === "quarterly"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setPeriodType("annual")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                periodType === "annual"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Annual
            </button>
          </div>
        </div>
      </Card>

      {/* Chart Card - Show when metrics are selected */}
      {!loading && !error && getCurrentData() && selectedMetrics.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              📊 Visualization
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {selectedMetrics.length} metric
              {selectedMetrics.length > 1 ? "s" : ""} selected
            </p>
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
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {getTabTitle()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Company: {ticker} | Period: {periodType}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Currency: <span className="font-medium text-gray-700">Millions USD</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading financial data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
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

      {/* Data Summary Card */}
      {!loading && !error && getCurrentData() && (
        <Card className="p-6 bg-blue-50">
          <h4 className="font-semibold text-gray-900 mb-2">Data Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Company</p>
              <p className="font-medium text-gray-900">
                {getCurrentData()?.company}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Statement Type</p>
              <p className="font-medium text-gray-900">
                {getCurrentData()?.type}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Periods Available</p>
              <p className="font-medium text-gray-900">
                {getCurrentData()?.periods.length}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Line Items</p>
              <p className="font-medium text-gray-900">
                {getCurrentData()?.data
                  ? Object.keys(getCurrentData()!.data).length
                  : 0}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
