/**
 * PeriodSelector Component
 * 
 * Hiển thị các nút chọn period với % thay đổi
 * Giống TradingView style
 */

import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/services/apiBase";

interface PeriodData {
  period: string;
  label: string;
  changePercent: number | null;
  isLoading: boolean;
}

interface PeriodSelectorProps {
  ticker: string;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  currentPrice: number;
}

export default function PeriodSelector({
  ticker,
  selectedPeriod,
  onPeriodChange,
  currentPrice,
}: PeriodSelectorProps) {
  const [periodsData, setPeriodsData] = useState<PeriodData[]>([
    { period: "5d", label: "5 days", changePercent: null, isLoading: false },
    { period: "1m", label: "1 month", changePercent: null, isLoading: false },
    { period: "3m", label: "3 months", changePercent: null, isLoading: false },
    { period: "6m", label: "6 months", changePercent: null, isLoading: false },
    { period: "1y", label: "1 year", changePercent: null, isLoading: false },
    { period: "5y", label: "5 years", changePercent: null, isLoading: false },
    { period: "max", label: "All time", changePercent: null, isLoading: false },
  ]);

  // Fetch % change cho mỗi period
  useEffect(() => {
    const fetchPeriodChanges = async () => {
      const updatedPeriods = await Promise.all(
        periodsData.map(async (periodData) => {
          try {
            // Map "ytd" to API period
            const apiPeriod = periodData.period;

            const url = `${BACKEND_URL}/api/stocks/${ticker}/price-history?period=${apiPeriod}`;
            console.log(`[PeriodSelector] Fetching ${periodData.period}:`, url);

            const response = await fetch(url);

            if (!response.ok) {
              console.error(`[PeriodSelector] Failed to fetch ${periodData.period}:`, response.statusText);
              return { ...periodData, changePercent: null, isLoading: false };
            }

            const result = await response.json();

            if (!result.success || !result.data || result.data.length < 2) {
              console.warn(`[PeriodSelector] No data for ${periodData.period}, data length:`, result.data?.length);
              return { ...periodData, changePercent: null, isLoading: false };
            }

            const data = result.data;
            const startPrice = data[0].close;
            const endPrice = data[data.length - 1].close;
            const changePercent = ((endPrice - startPrice) / startPrice) * 100;

            console.log(`[PeriodSelector] ${periodData.period}: start=${startPrice}, end=${endPrice}, change=${changePercent.toFixed(2)}%, records=${data.length}`);

            return { ...periodData, changePercent, isLoading: false };
          } catch (error) {
            console.error(`Error fetching ${periodData.period} data:`, error);
            return { ...periodData, changePercent: null, isLoading: false };
          }
        })
      );

      setPeriodsData(updatedPeriods);
    };

    if (ticker && currentPrice > 0) {
      fetchPeriodChanges();
    }
  }, [ticker, currentPrice]);

  const formatPercent = (percent: number | null) => {
    if (percent === null) return "—";
    const sign = percent >= 0 ? "+" : "";
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getPercentColor = (percent: number | null) => {
    if (percent === null) return "text-gray-400 dark:text-gray-500";
    return percent >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap py-4 border-t border-gray-200 dark:border-gray-700">
      {periodsData.map((periodData) => {
        const isSelected = selectedPeriod === periodData.period;

        return (
          <button
            key={periodData.period}
            onClick={() => onPeriodChange(periodData.period)}
            disabled={periodData.isLoading}
            className={`
              flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
              ${isSelected
                ? "bg-gray-100 dark:bg-gray-800 shadow-sm"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }
              ${periodData.isLoading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <span className={`text-sm font-medium ${isSelected
              ? "text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
              }`}>
              {periodData.label}
            </span>
            <span className={`text-xs font-semibold ${getPercentColor(periodData.changePercent)}`}>
              {periodData.isLoading ? "..." : formatPercent(periodData.changePercent)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
