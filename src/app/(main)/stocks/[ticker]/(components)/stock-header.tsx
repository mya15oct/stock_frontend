"use client";

import type { Stock } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { getCompanyLogo, isLogoImage } from "@/utils/company";
import Image from "next/image";
import { Tooltip } from "@/components/ui/Tooltip";

interface StockHeaderProps {
  stock: Stock;
  exchange?: string;
  logo?: string;
}

export default function StockHeader({
  stock,
  exchange = "NYSE",
  logo,
}: StockHeaderProps) {
  const { formatPrice, isStealthMode } = useStealthMode();

  // Get logo from company data if not provided
  const displayLogo = logo || getCompanyLogo(stock.ticker);
  const isImageLogo = isLogoImage(displayLogo);

  // Use real price change data from database, fallback to defaults if not available
  const priceChange = stock.change ?? stock.priceChange ?? 0;
  const priceChangePercent = stock.changePercent ?? stock.priceChangePercent ?? 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="bg-white dark:bg-gray-800 transition-colors">
      <div className="container mx-auto px-6">
        {/* Company Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
              {isImageLogo ? (
                <Image
                  src={displayLogo}
                  alt={`${stock.name} logo`}
                  width={48}
                  height={48}
                  className="object-contain p-1.5"
                  onError={(e) => {
                    // Fallback to emoji if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = "🏢";
                      target.parentElement.className =
                        "w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100";
                    }
                  }}
                />
              ) : (
                <span className="text-2xl">{displayLogo}</span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{stock.name}</h1>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-medium">
                  {stock.ticker} • {exchange}
                </span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors hide-print"
            onClick={() => window.print()}
            title="Print Financial Report"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>
        </div>

        {/* Price and Key Metrics */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatPrice(stock.price)}
              </span>
              <span
                className={`text-base font-medium ${isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
              >
                {isPositive ? "+" : ""}
                {formatPrice(priceChange)} ({isPositive ? "▲" : "▼"}{" "}
                {Math.abs(priceChangePercent).toFixed(2)}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-6 text-sm">
            {/* Earnings Date */}
            <Tooltip
              content="The latest quarter for which earnings data is available"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Earnings date</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {isStealthMode ? "••••" : (() => {
                    if (!stock.latestQuarter) return "—";
                    // If it matches YYYYQq format (e.g., 2024Q3), display as is
                    if (/^\d{4}Q\d$/.test(stock.latestQuarter)) return stock.latestQuarter;
                    // Otherwise try to parse as date
                    const date = new Date(stock.latestQuarter);
                    return !isNaN(date.getTime())
                      ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : stock.latestQuarter;
                  })()}
                </div>
              </div>
            </Tooltip>

            {/* P/E Ratio */}
            <Tooltip
              content="The ratio of a company's share price to the company's earnings per share"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">P/E</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {isStealthMode ? "••••" : stock.pe ? stock.pe.toFixed(2) : "—"}
                </div>
              </div>
            </Tooltip>

            {/* EPS */}
            <Tooltip
              content="Earnings per share. The portion of a company's profit allocated to each outstanding share of common stock"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">EPS</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {isStealthMode ? "••••" : stock.eps ? `$${stock.eps.toFixed(2)}` : "—"}
                </div>
              </div>
            </Tooltip>

            {/* Market Cap */}
            <Tooltip
              content="The current total value of the company's shares which are in circulation at the moment"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Market cap</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {isStealthMode ? "••••" : (() => {
                    if (!stock.marketCap) return "—";
                    const val = stock.marketCap;
                    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
                    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
                    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
                    return `$${val.toLocaleString()}`;
                  })()}
                </div>
              </div>
            </Tooltip>

            {/* Dividend Yield */}
            <Tooltip
              content="Dividend yield, FWD - the ratio of the amount of dividends for the next 12 months to the share price"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 dark:text-gray-400 mb-1 text-xs">Dividend yield</div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">
                  {isStealthMode ? "••••" : stock.dividendYield !== undefined && stock.dividendYield !== null ? `${stock.dividendYield.toFixed(2)}%` : "—"}
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
