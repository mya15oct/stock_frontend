import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState, useEffect } from "react";
import {
  getFinancials,
  type PeriodType,
  type FinancialDataResponse,
} from "@/lib/api";
import PromotionalBanner from "@/components/PromotionalBanner";

interface FinancialsTabProps {
  ticker: string;
}

export default function FinancialsTab({ ticker }: FinancialsTabProps) {
  const { isStealthMode } = useStealthMode();
  const [activeTab, setActiveTab] = useState<"income" | "balance" | "cashflow">(
    "income"
  );
  const [periodType, setPeriodType] = useState<PeriodType>("quarterly");

  // API Data States
  const [incomeStatementData, setIncomeStatementData] =
    useState<FinancialDataResponse | null>(null);
  const [balanceSheetData, setBalanceSheetData] =
    useState<FinancialDataResponse | null>(null);
  const [cashFlowData, setCashFlowData] =
    useState<FinancialDataResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [income, balance, cashflow] = await Promise.all([
          getFinancials(ticker, "IS", periodType),
          getFinancials(ticker, "BS", periodType),
          getFinancials(ticker, "CF", periodType),
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

  const formatValue = (value: number | undefined) => {
    if (isStealthMode) return "••••";
    if (value === undefined) return "-";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
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
            {Object.entries(data.data).map(([itemName, values]) => (
              <tr
                key={itemName}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-3 px-4 text-gray-700 sticky left-0 bg-white">
                  {itemName}
                </td>
                {data.periods.map((period) => (
                  <td
                    key={period}
                    className="py-3 px-4 text-center text-gray-700"
                  >
                    {formatValue(values[period])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Promotional Banner */}
      <PromotionalBanner />

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

      {/* Data Card */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {getTabTitle()}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Company: {ticker} | Period: {periodType}
          </p>
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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    "Total revenue",
    "Net Income",
  ]);

  // Company comparison
  const [comparisonCompany, setComparisonCompany] = useState<string>("");
  const [comparisonData, setComparisonData] = useState<{
    income: FinancialDataResponse | null;
    balance: FinancialDataResponse | null;
    cashflow: FinancialDataResponse | null;
  }>({
    income: null,
    balance: null,
    cashflow: null,
  });
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  // Fetch available companies from API
  const [availableCompanies, setAvailableCompanies] = useState<
    Array<{ ticker: string; name: string }>
  >([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Fetch available companies for comparison dropdown
  useEffect(() => {
    const fetchAvailableCompanies = async () => {
      setLoadingCompanies(true);
      try {
        const stocks: Stock[] = await stockService.getStocks();
        // Filter out current company to avoid self-comparison
        const companies = stocks
          .filter((stock: Stock) => stock.ticker !== ticker)
          .map((stock: Stock) => ({
            ticker: stock.ticker,
            name: stock.name,
          }));
        setAvailableCompanies(companies);
      } catch (err) {
        console.error("Error fetching available companies:", err);
        setAvailableCompanies([]);
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchAvailableCompanies();
  }, [ticker]);

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

  // Fetch comparison company data
  useEffect(() => {
    if (!comparisonCompany) {
      setComparisonData({ income: null, balance: null, cashflow: null });
      setComparisonError(null);
      return;
    }

    const fetchComparisonData = async () => {
      setComparisonError(null);
      try {
        const [income, balance, cashflow] = await Promise.all([
          stockService.getFinancials(comparisonCompany, "income", periodType),
          stockService.getFinancials(comparisonCompany, "balance", periodType),
          stockService.getFinancials(comparisonCompany, "cash", periodType),
        ]);

        setComparisonData({ income, balance, cashflow });
      } catch (err) {
        console.error("Error fetching comparison data:", err);
        setComparisonError(
          `Unable to load data for ${comparisonCompany}. This company may not be available in the database.`
        );
        setComparisonData({ income: null, balance: null, cashflow: null });
        // Auto-clear the selection after showing error
        setTimeout(() => {
          setComparisonCompany("");
        }, 3000);
      }
    };

    fetchComparisonData();
  }, [comparisonCompany, periodType]);

  // Calculate percentage change
  const calculateChange = (current: number, previous: number): number => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Format value based on display format
  const formatValue = (
    value: number | undefined,
    periodIndex: number,
    allValues: number[],
    periods: string[]
  ) => {
    if (isStealthMode) return "••••";
    if (value === undefined || value === null) return "-";

    if (displayFormat === "values") {
      return value.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }

    // For percentage changes, we need previous value
    const previousPeriodIndex = periodIndex + 1;

    if (displayFormat === "changes") {
      // Period-over-period change
      if (previousPeriodIndex >= allValues.length) return "-";
      const previousValue = allValues[previousPeriodIndex];
      if (previousValue === undefined) return "-";
      const change = calculateChange(value, previousValue);
      return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
    }

    if (displayFormat === "yoy") {
      // Year-over-Year change (compare with same period last year)
      const yoyOffset = periodType === "quarterly" ? 4 : 1;
      const yoyPeriodIndex = periodIndex + yoyOffset;
      if (yoyPeriodIndex >= allValues.length) return "-";
      const yoyValue = allValues[yoyPeriodIndex];
      if (yoyValue === undefined) return "-";
      const change = calculateChange(value, yoyValue);
      return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
    }

    return "-";
  };

  const getCurrentData = (): FinancialDataResponse | null => {
    switch (activeTab) {
      case "income":
        return incomeStatementData;
      case "balance":
        return balanceSheetData;
      case "cashflow":
        return cashFlowData;
      case "statistics":
        return calculateStatistics();
      default:
        return null;
    }
  };

  // Calculate statistics from financial data
  const calculateStatistics = (): FinancialDataResponse | null => {
    if (!incomeStatementData || !balanceSheetData) return null;

    const periods = incomeStatementData.periods;
    const stats: Record<string, Record<string, number>> = {};

    periods.forEach((period) => {
      // Get data for this period
      const revenue = (incomeStatementData.data["Total revenue"] as any)?.[
        period
      ];
      const netIncome = (incomeStatementData.data["Net Income"] as any)?.[
        period
      ];
      const totalAssets = (balanceSheetData.data["Total assets"] as any)?.[
        period
      ];
      const totalEquity = (balanceSheetData.data["Total equity"] as any)?.[
        period
      ];
      const cogs = (incomeStatementData.data["COGS"] as any)?.[period];

      // Calculate ratios
      if (revenue && netIncome) {
        if (!stats["Net Profit Margin (%)"])
          stats["Net Profit Margin (%)"] = {};
        stats["Net Profit Margin (%)"][period] = (netIncome / revenue) * 100;
      }

      if (revenue && cogs) {
        if (!stats["Gross Profit Margin (%)"])
          stats["Gross Profit Margin (%)"] = {};
        const grossProfit = revenue - cogs;
        stats["Gross Profit Margin (%)"][period] =
          (grossProfit / revenue) * 100;
      }

      if (netIncome && totalAssets && totalAssets > 0) {
        if (!stats["ROA (%)"]) stats["ROA (%)"] = {};
        stats["ROA (%)"][period] = (netIncome / totalAssets) * 100;
      }

      if (netIncome && totalEquity && totalEquity > 0) {
        if (!stats["ROE (%)"]) stats["ROE (%)"] = {};
        stats["ROE (%)"][period] = (netIncome / totalEquity) * 100;
      }

      if (totalAssets && totalEquity && totalAssets > 0) {
        if (!stats["Debt to Equity"]) stats["Debt to Equity"] = {};
        const totalDebt = totalAssets - totalEquity;
        stats["Debt to Equity"][period] =
          totalEquity > 0 ? totalDebt / totalEquity : 0;
      }
    });

    return {
      company: incomeStatementData.company,
      type: "Statistics",
      period: incomeStatementData.period,
      periods: periods,
      data: stats,
    };
  };

  // Toggle metric selection for chart
  const toggleMetric = (metricName: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricName)) {
        return prev.filter((m) => m !== metricName);
      } else {
        return [...prev, metricName];
      }
    });
  };

  // Clear all selected metrics
  const clearAllMetrics = () => {
    setSelectedMetrics([]);
  };

  // Get comparison data based on active tab
  const getComparisonData = (): FinancialDataResponse | null => {
    if (!comparisonCompany) return null;

    switch (activeTab) {
      case "income":
        return comparisonData.income;
      case "balance":
        return comparisonData.balance;
      case "cashflow":
        return comparisonData.cashflow;
      default:
        return null;
    }
  };

  // Get metrics that are available in current tab
  const getAvailableMetrics = (): string[] => {
    const currentData = getCurrentData();
    if (!currentData) return [];

    // Filter selected metrics to only include ones that exist in current tab's data
    return selectedMetrics.filter(
      (metric) => currentData.data[metric] !== undefined
    );
  };

  // Prepare chart data with comparison
  const getChartData = () => {
    const mainData = getCurrentData();
    const compData = getComparisonData();

    if (!mainData) return [];

    // Only use metrics that exist in current tab
    const availableMetrics = getAvailableMetrics();

    return mainData.periods.map((period: string) => {
      const dataPoint: any = { period };

      // Add main company data
      availableMetrics.forEach((metric) => {
        const values = mainData.data[metric] as Record<string, number>;
        if (values && values[period] !== undefined) {
          dataPoint[`${ticker}: ${metric}`] = values[period];
        }
      });

      // Add comparison company data if available
      if (compData && comparisonCompany) {
        availableMetrics.forEach((metric) => {
          const values = compData.data[metric] as Record<string, number>;
          if (values && values[period] !== undefined) {
            dataPoint[`${comparisonCompany}: ${metric}`] = values[period];
          }
        });
      }

      return dataPoint;
    });
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "income":
        return "Income Statement";
      case "balance":
        return "Balance Sheet";
      case "cashflow":
        return "Cash Flow Statement";
      case "statistics":
        return "Financial Statistics";
      default:
        return "";
    }
  };

  const renderFinancialTable = () => {
    const data = getCurrentData();

    if (!data) return null;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50">
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 text-sm">
                {/* Empty for line items column */}
              </th>
              {data.periods.map((period: string) => (
                <th
                  key={period}
                  className="text-center py-4 px-4 font-medium text-gray-600 min-w-[100px] text-xs uppercase tracking-wide"
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
              const colors = [
                "#6366f1", // indigo
                "#a855f7", // purple
                "#ec4899", // pink
                "#f59e0b", // amber
                "#10b981", // green
                "#06b6d4", // cyan
                "#ef4444", // red
                "#f97316", // orange
              ];
              const barColor = isSelected
                ? colors[selectedIndex % colors.length]
                : "transparent";

              return (
                <tr
                  key={itemName}
                  onClick={() => toggleMetric(itemName)}
                  className={`group border-b border-gray-100 cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/50 hover:bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 text-gray-700 sticky left-0 bg-inherit">
                    <div className="relative">
                      <div
                        className="absolute left-[-16px] top-[-12px] bottom-[-12px] w-1 transition-all"
                        style={{ backgroundColor: barColor }}
                      />
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isSelected ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {itemName}
                        </span>
                      </div>
                    </div>
                  </td>
                  {data.periods.map((period: string, periodIndex: number) => {
                    const currentValue = (values as Record<string, number>)[
                      period
                    ];
                    const allValues = data.periods.map(
                      (p) => (values as Record<string, number>)[p]
                    );

                    return (
                      <td
                        key={period}
                        className="py-3 px-4 text-center text-gray-700 text-sm"
                      >
                        {formatValue(
                          currentValue,
                          periodIndex,
                          allValues,
                          data.periods
                        )}
                      </td>
                    );
                  })}
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
      {/* Hints and Comparison Card */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* Hint */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="text-yellow-500">💡</span>
            <p>Click on a row in the table to make it appear on the graph</p>
            {selectedMetrics.length > 0 && (
              <button
                onClick={clearAllMetrics}
                className="ml-auto text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Company Comparison Dropdown */}
          <div>
            {availableCompanies.length === 0 && !loadingCompanies ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  🔍 No other companies available for comparison
                </p>
              </div>
            ) : (
              <select
                value={comparisonCompany}
                onChange={(e) => setComparisonCompany(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
                disabled={loadingCompanies}
              >
                <option value="">
                  {loadingCompanies
                    ? "Loading companies..."
                    : "Select a company for comparison.."}
                </option>
                {availableCompanies.map((company) => (
                  <option key={company.ticker} value={company.ticker}>
                    {company.name} ({company.ticker})
                  </option>
                ))}
              </select>
            )}

            {/* Comparison Error Message */}
            {comparisonError && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">⚠️ {comparisonError}</p>
              </div>
            )}

            {/* Loading indicator for comparison data */}
            {comparisonCompany && !comparisonError && !getComparisonData() && (
              <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading {comparisonCompany} data...</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Chart Card - Only show if there are available metrics in current tab */}
      {!loading &&
        !error &&
        getCurrentData() &&
        getAvailableMetrics().length > 0 && (
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="period"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                  axisLine={{ stroke: "#d1d5db" }}
                />
                <Tooltip
                  formatter={(value: number) =>
                    isStealthMode ? "••••" : value.toLocaleString()
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} iconType="square" />
                {getAvailableMetrics().map((metric, index) => {
                  const colors = [
                    "#3699ff", // blue
                    "#a855f7", // purple
                    "#ec4899", // pink
                    "#f59e0b", // amber
                    "#10b981", // green
                    "#06b6d4", // cyan
                    "#ef4444", // red
                    "#f97316", // orange
                  ];

                  const bars = [];

                  // Main company bar with smooth animation
                  bars.push(
                    <Bar
                      key={`${ticker}-${metric}`}
                      dataKey={`${ticker}: ${metric}`}
                      fill={colors[index % colors.length]}
                      name={`${ticker}: ${metric}`}
                      radius={[8, 8, 0, 0]}
                      // ✨ ANIMATION: Progressive growing effect với easeOutQuart
                      animationDuration={1200}
                      animationEasing="ease-out"
                      // Staggered effect: Mỗi cột trễ hơn cột trước 100ms
                      animationBegin={index * 100}
                      // Hover effect: Tăng opacity khi hover
                      onMouseEnter={(data, index) => {
                        // Recharts tự xử lý hover effect qua cursor
                      }}
                    />
                  );

                  // Comparison company bar (with lighter shade và animation)
                  if (comparisonCompany) {
                    bars.push(
                      <Bar
                        key={`${comparisonCompany}-${metric}`}
                        dataKey={`${comparisonCompany}: ${metric}`}
                        fill={`${colors[index % colors.length]}80`}
                        name={`${comparisonCompany}: ${metric}`}
                        radius={[8, 8, 0, 0]}
                        // Animation cho comparison bar với delay cao hơn một chút
                        animationDuration={1200}
                        animationEasing="ease-out"
                        animationBegin={index * 100 + 50}
                      />
                    );
                  }

                  return bars;
                })}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

      {/* Data Table Card */}
      <Card className="p-6">
        {/* Statement Type Tabs and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          {/* Statement Type Dropdown */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setActiveTab("income")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "income"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Income statement
            </button>
            <button
              onClick={() => setActiveTab("balance")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "balance"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Balance sheet
            </button>
            <button
              onClick={() => setActiveTab("cashflow")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "cashflow"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cash flow
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeTab === "statistics"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Period Type and Display Format Selectors */}
          <div className="flex gap-2 items-center">
            {/* Period Type Dropdown */}
            <select
              value={periodType}
              onChange={(e) =>
                setPeriodType(e.target.value as "quarterly" | "annual")
              }
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
            </select>

            {/* Display Format Dropdown */}
            <select
              value={displayFormat}
              onChange={(e) =>
                setDisplayFormat(e.target.value as DisplayFormat)
              }
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
            >
              <option value="values">Values, USD</option>
              <option value="yoy">Changes YoY, %</option>
              <option value="changes">Changes, %</option>
            </select>
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
