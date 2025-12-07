import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState, useEffect, Fragment } from "react";
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
import { Tooltip } from "@/components/ui/Tooltip";

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
  // Negative values shown as (12,345) in red
  const formatValueForTable = (value: number | undefined) => {
    if (isStealthMode) return "••••";
    if (value === undefined) return "-";

    // Convert to millions and format with comma separator
    const inMillions = value / 1e6;
    const absValue = Math.abs(inMillions);
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(absValue);

    // Negative values: (12,345) format
    return inMillions < 0 ? `(${formatted})` : formatted;
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

  // Tooltip descriptions for financial metrics
  const getMetricTooltip = (metricName: string): string => {
    const tooltips: Record<string, string> = {
      "Total Revenue": "The total amount of money generated from sales of goods or services before any expenses are deducted.",
      "Gross Profit": "Revenue minus Cost of Goods Sold (COGS). Shows profitability before operating expenses.",
      "Cost Of Revenue": "Direct costs attributable to the production of goods sold or services provided.",
      "Costof Goods And Services Sold": "Direct costs attributable to the production of goods sold or services provided.",
      "Operating Income": "Profit from core business operations before interest and taxes (EBIT).",
      "Net Income": "The bottom line profit after all expenses, taxes, and costs have been deducted from revenue.",
      "EBITDA": "Earnings Before Interest, Taxes, Depreciation, and Amortization. A measure of operating performance.",
      "Operating Expenses": "Costs incurred in running the day-to-day business operations.",
      "Research And Development": "Expenses related to researching and developing new products or services.",
      "Selling General And Administrative": "Overhead costs including sales, marketing, and administrative expenses.",
      "Total Assets": "Sum of all assets owned by the company, including current and non-current assets.",
      "Total Liabilities": "Sum of all debts and obligations the company owes.",
      "Stockholders Equity": "The residual interest in assets after deducting liabilities. Also known as shareholders' equity.",
      "Cash And Cash Equivalents": "Liquid assets including cash on hand and short-term investments easily convertible to cash.",
      "Total Current Assets": "Assets expected to be converted to cash or used within one year.",
      "Total Current Liabilities": "Obligations due within one year.",
      "Operating Cash Flow": "Cash generated from normal business operations.",
      "Free Cash Flow": "Cash flow available after capital expenditures. Indicates financial flexibility.",
      "Capital Expenditures": "Funds used to acquire or upgrade physical assets like property, equipment, or technology.",
      "Investing Cash Flow": "Cash used for investments in assets, securities, or acquisitions.",
      "Financing Cash Flow": "Cash flow from transactions with the company's owners and creditors.",
    };

    return tooltips[metricName] || "Financial metric from the company's financial statements.";
  };

  // Priority order for common financial metrics (Income Statement)
  const getMetricPriority = (metricName: string): number => {
    const priorityOrder: Record<string, number> = {
      // Top metrics
      "Total Revenue": 1,
      "Gross Profit": 2,
      "Cost Of Revenue": 3,
      "Costof Goods And Services Sold": 3,
      "Operating Income": 4,
      "Operating Expenses": 5,
      "Net Income": 6,
      "Research And Development": 7,
      "Selling General And Administrative": 8,
      // EBITDA lower priority
      "EBITDA": 90,
      "Ebitda": 90,
    };

    return priorityOrder[metricName] || 50; // Default priority for unlisted metrics
  };

  // Sort financial data by priority
  const sortFinancialData = (data: Record<string, Record<string, number>>): Array<[string, Record<string, number>]> => {
    return Object.entries(data).sort((a, b) => {
      const priorityA = getMetricPriority(a[0]);
      const priorityB = getMetricPriority(b[0]);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort alphabetically
      return a[0].localeCompare(b[0]);
    });
  };

  // Group financial data by category
  const getGroupedFinancialData = () => {
    const data = getCurrentData();
    if (!data) return null;

    const allData = data.data;

    // Define financial statement structure based on active tab
    if (activeTab === "income") {
      return {
        groups: [
          {
            title: "Revenue",
            rows: [
              { name: "Total Revenue", data: allData["Total Revenue"], isHighlighted: true },
            ]
          },
          {
            rows: [
              { name: "COGS", data: allData["Cost Of Revenue"] || allData["Costof Goods And Services Sold"] },
            ]
          },
          {
            rows: [
              { name: "Gross Profit", data: allData["Gross Profit"], isHighlighted: true },
            ]
          },
          {
            title: "Operating Expenses & Income",
            rows: [
              { name: "Operating Income", data: allData["Operating Income"] },
              { name: "Total Operating Expenses", data: allData["Operating Expenses"] },
              { name: "R&D Expenses", data: allData["Research And Development"] },
              { name: "Selling General & Admin Expenses", data: allData["Selling General And Administrative"] },
            ]
          },
          {
            title: "Earnings from Continuing Operations",
            rows: [
              { name: "Interest Expense", data: allData["Interest Expense"] },
              { name: "Interest Income", data: allData["Interest Income"] },
              { name: "Income Tax Expense", data: allData["Income Tax Expense"] },
            ]
          },
          {
            title: "Net Income",
            rows: [
              { name: "Net Income", data: allData["Net Income"], isHighlighted: true },
            ]
          },
          {
            title: "Supplemental",
            rows: [
              { name: "EBIT", data: allData["EBIT"] || allData["Ebit"] },
              { name: "EBITDA", data: allData["EBITDA"] || allData["Ebitda"] },
            ]
          },
        ],
        periods: data.periods
      };
    }

    if (activeTab === "balance") {
      return {
        groups: [
          {
            title: "Cash & Short Term Investments",
            rows: [
              { name: "Cash & Equivalents", data: allData["Cash And Cash Equivalents At Carrying Value"] || allData["Cash And Cash Equivalents"] },
              { name: "Short Term Investments", data: allData["Short Term Investments"] },
              { name: "Total Cash & Short Term Investments", data: allData["Cash And Short Term Investments"], isHighlighted: true },
            ]
          },
          {
            title: "Receivables",
            rows: [
              { name: "Total Receivables", data: allData["Current Net Receivables"] || allData["Net Receivables"], isHighlighted: true },
            ]
          },
          {
            title: "Current Assets",
            rows: [
              { name: "Inventory", data: allData["Inventory"] },
              { name: "Other Current Assets", data: allData["Other Current Assets"] },
              { name: "Total Current Assets", data: allData["Total Current Assets"], isHighlighted: true },
            ]
          },
          {
            title: "Long Term Assets",
            rows: [
              { name: "Property, Plant & Equipment", data: allData["Property Plant Equipment"] },
              { name: "Long Term Investments", data: allData["Long Term Investments"] },
              { name: "Intangible Assets", data: allData["Intangible Assets"] },
              { name: "Total Assets", data: allData["Total Assets"], isHighlighted: true },
            ]
          },
          {
            title: "Current Liabilities",
            rows: [
              { name: "Accounts Payable", data: allData["Current Accounts Payable"] },
              { name: "Short Term Debt", data: allData["Short Term Debt"] },
              { name: "Other Current Liabilities", data: allData["Other Current Liabilities"] },
              { name: "Total Current Liabilities", data: allData["Total Current Liabilities"], isHighlighted: true },
            ]
          },
          {
            title: "Long Term Liabilities",
            rows: [
              { name: "Long Term Debt", data: allData["Long Term Debt"] },
              { name: "Other Non-Current Liabilities", data: allData["Other Non Current Liabilities"] },
              { name: "Total Non-Current Liabilities", data: allData["Total Non Current Liabilities"], isHighlighted: true },
              { name: "Total Liabilities", data: allData["Total Liabilities"], isHighlighted: true },
            ]
          },
          {
            title: "Common Equity",
            rows: [
              { name: "Common Stock", data: allData["Common Stock"] },
              { name: "Retained Earnings", data: allData["Retained Earnings"] },
              { name: "Comprehensive Income", data: allData["Accumulated Other Comprehensive Income Loss"] },
              { name: "Total Equity", data: allData["Stockholders Equity"] || allData["Total Stockholder Equity"], isHighlighted: true },
              { name: "Total Liabilities And Equity", data: allData["Total Liabilities And Stockholders Equity"], isHighlighted: true },
            ]
          },
          {
            title: "Supplemental",
            rows: [
              { name: "Total Common Shares Outstanding", data: allData["Common Stock Shares Outstanding"] },
              { name: "Total Debt", data: allData["Short Long Term Debt Total"] },
              { name: "Net Debt", data: allData["Net Debt"] },
              { name: "Enterprise value", data: allData["Enterprise Value"] },
            ]
          },
        ],
        periods: data.periods
      };
    }

    if (activeTab === "cashflow") {
      return {
        groups: [
          {
            title: "Cash Flow From Operations",
            rows: [
              { name: "Depreciation & Amortization", data: allData["Depreciation And Amortization"] },
              { name: "Total Cash From Operations", data: allData["Operating Cash Flow"] || allData["Cash Flow From Operations"], isHighlighted: true },
            ]
          },
          {
            title: "Cash Flow From Investing",
            rows: [
              { name: "Other Investing Activities", data: allData["Other Investing Activites"] },
              { name: "Capital Expenditure", data: allData["Capital Expenditures"] },
              { name: "Investments", data: allData["Investments"] },
              { name: "Total Cash From Investing", data: allData["Investing Cash Flow"], isHighlighted: true },
            ]
          },
          {
            title: "Cash Flow From Financing Activities",
            rows: [
              { name: "Issuance and Repurchase of Common Stocks", data: allData["Sale Purchase Of Stock"] },
              { name: "Dividends Paid", data: allData["Dividends Paid"] },
              { name: "Total Cash From Financing", data: allData["Financing Cash Flow"], isHighlighted: true },
            ]
          },
          {
            title: "Net Change in Cash",
            rows: [
              { name: "Net Change in Cash", data: allData["Change In Cash"] || allData["Net Change In Cash"], isHighlighted: true },
            ]
          },
          {
            title: "Supplemental",
            rows: [
              { name: "Free Cash Flow", data: allData["Free Cash Flow"] },
            ]
          },
        ],
        periods: data.periods
      };
    }

    // For statistics tab - show key metrics
    if (activeTab === "statistics") {
      return {
        groups: [
          {
            title: "Keystats",
            rows: [
              { name: "EPS", data: allData["EPS"] },
              { name: "PE", data: allData["PE Ratio"] },
              { name: "Payout Ratio", data: allData["Payout Ratio"] },
              { name: "Revenue per Share", data: allData["Revenue Per Share"] },
              { name: "Price to Sales", data: allData["Price To Sales Ratio"] },
              { name: "FCF per Share", data: allData["Free Cash Flow Per Share"] },
              { name: "Price to FCF per Share", data: allData["Price To Free Cash Flow"] },
              { name: "Book Value per Share", data: allData["Book Value Per Share"] },
              { name: "Price to Book Value", data: allData["Price To Book Ratio"] },
              { name: "EV to EBITDA", data: allData["Enterprise Value Over EBITDA"] },
              { name: "Net Debt to EBITDA", data: allData["Net Debt To EBITDA"] },
              { name: "Debt to Equity", data: allData["Total Debt To Total Equity"] },
              { name: "Debt Coverage", data: allData["Debt Equity Ratio"] },
              { name: "Interest Coverage Ratio", data: allData["Interest Coverage"] },
              { name: "ROA", data: allData["Return On Assets"] },
              { name: "ROE", data: allData["Return On Equity"] },
              { name: "ROCE", data: allData["Return On Capital Employed"] },
            ]
          },
        ],
        periods: data.periods
      };
    }

    // Fallback to sorted data for other tabs
    const sortedData = sortFinancialData(allData);
    return {
      groups: [
        {
          rows: sortedData.map(([name, values]) => ({ name, data: values }))
        }
      ],
      periods: data.periods
    };
  };

  const renderFinancialTable = () => {
    const groupedData = getGroupedFinancialData();

    if (!groupedData) return null;

    return (
      <div>
        {/* Header Section - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">{getTabTitle()}</span>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <span className="text-gray-600 dark:text-gray-400">Company: <span className="font-medium text-gray-900 dark:text-white">{ticker}</span></span>
            <span className="text-gray-400 dark:text-gray-500">|</span>
            <span className="text-gray-600 dark:text-gray-400">Period: <span className="font-medium text-gray-900 dark:text-white">{periodType}</span></span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Currency: <span className="font-medium text-gray-900 dark:text-white">Millions USD</span>
          </div>
        </div>

        {/* Table Container - Scrollable */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm relative border-collapse">
            <thead className="sticky top-0 isolate" style={{ transform: 'translateZ(0)' }}>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="text-left py-3 px-6 font-medium text-gray-600 dark:text-gray-400 sticky left-0 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-gray-400 dark:text-gray-500">⋮</span>
                    <span>Line Item</span>
                  </div>
                </th>
                {groupedData.periods.map((period) => (
                  <th
                    key={period}
                    className="text-right py-3 px-6 font-medium text-gray-600 dark:text-gray-400 min-w-[120px] bg-gray-50 dark:bg-gray-800"
                  >
                    {period}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="relative">
              {groupedData.groups.map((group, groupIndex) => (
                <Fragment key={groupIndex}>
                  {/* Group Title */}
                  {group.title && (
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <td colSpan={groupedData.periods.length + 1} className="py-2 px-6 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        {group.title}
                      </td>
                    </tr>
                  )}
                  
                  {/* Group Rows */}
                  {group.rows.map((row, rowIndex) => {
                    if (!row.data) return null; // Skip if no data
                    
                    const itemName = row.name;
                    const isSelected = selectedMetrics.includes(itemName);
                    const selectedIndex = selectedMetrics.indexOf(itemName);
                    const barColor = isSelected
                      ? CHART_COLORS.primary[selectedIndex % CHART_COLORS.primary.length]
                      : "transparent";

                    const isHighlighted = row.isHighlighted;

                    return (
                      <tr
                        key={`${groupIndex}-${rowIndex}`}
                        onClick={() => toggleMetric(itemName)}
                        className={`group border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-all relative
                          ${isHighlighted 
                            ? "bg-blue-50 dark:bg-blue-900/30" 
                            : rowIndex % 2 === 0 
                              ? "bg-white dark:bg-gray-900" 
                              : "bg-gray-50 dark:bg-gray-800"
                          }
                          ${isSelected
                            ? "!bg-blue-100 dark:!bg-blue-800 hover:!bg-blue-200 dark:hover:!bg-blue-700"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }
                        `}
                      >
                        <td className={`py-3 px-6 text-gray-700 dark:text-gray-300 sticky left-0 transition-colors
                          ${isHighlighted 
                            ? "bg-blue-50 dark:bg-blue-900/30 font-semibold" 
                            : rowIndex % 2 === 0 
                              ? "bg-white dark:bg-gray-900" 
                              : "bg-gray-50 dark:bg-gray-800"
                          }
                          ${isSelected && "!bg-blue-100 dark:!bg-blue-800"}
                          group-hover:bg-gray-100 dark:group-hover:bg-gray-800
                        `}>
                          <div className="relative flex items-center gap-2">
                            <div
                              className="w-1 h-6 rounded-full transition-all"
                              style={{
                                backgroundColor: barColor,
                                opacity: isSelected ? 1 : 0
                              }}
                            />
                            <Tooltip
                              content={getMetricTooltip(itemName)}
                              position="right"
                            >
                              <span
                                className={`text-sm cursor-help ${
                                  isHighlighted 
                                    ? "font-semibold text-gray-900 dark:text-white" 
                                    : isSelected 
                                      ? "font-medium text-gray-900 dark:text-white" 
                                      : "text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                {itemName}
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                        {groupedData.periods.map((period) => {
                          const cellValue = row.data[period];
                          const isNegative = cellValue !== undefined && cellValue < 0;

                          return (
                            <td
                              key={period}
                              className={`py-3 px-6 text-right text-sm ${
                                isNegative
                                  ? 'text-red-600 dark:text-red-400'
                                  : isHighlighted
                                    ? 'font-semibold text-gray-900 dark:text-white'
                                    : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {formatValueForTable(cellValue)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  
                  {/* Spacer after group (except last group) */}
                  {groupIndex < groupedData.groups.length - 1 && (
                    <tr className="h-2 bg-gray-50 dark:bg-gray-900">
                      <td colSpan={groupedData.periods.length + 1}></td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* Controls - Tabs and Dropdowns */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        {/* Statement Type Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("income")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "income"
              ? "bg-gray-800 dark:bg-gray-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            Income statement
          </button>
          <button
            onClick={() => setActiveTab("balance")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "balance"
              ? "bg-gray-800 dark:bg-gray-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            Balance sheet
          </button>
          <button
            onClick={() => setActiveTab("cashflow")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "cashflow"
              ? "bg-gray-800 dark:bg-gray-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
          >
            Cash flow
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${activeTab === "statistics"
              ? "bg-gray-800 dark:bg-gray-700 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
              className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="annual">Annual</option>
              <option value="quarterly">Quarterly</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
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
              className="appearance-none px-4 py-2 pr-8 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="values">Values, USD</option>
              <option value="changes">Changes, %</option>
              <option value="yoy">YoY Growth, %</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none"
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📊 Visualization
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedMetrics.length} metric
                {selectedMetrics.length > 1 ? "s" : ""} selected
              </p>
            </div>
            <button
              onClick={clearAllMetrics}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
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
      <Card className="p-0 overflow-visible">

        {loading && (
          <div className="text-center py-12 px-6">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-gray-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading financial data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400 m-6">
            <p className="font-medium">Error loading financial data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && renderFinancialTable()}

        {!loading && !error && !getCurrentData() && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No financial data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}
