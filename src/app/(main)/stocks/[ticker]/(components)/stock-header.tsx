"use client";

import type { Stock } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { Tooltip } from "@/components/ui/Tooltip";

interface StockHeaderProps {
  stock: Stock;
  exchange?: string;
  logo?: string;
}

export default function StockHeader({
  stock,
  exchange = "NYSE",
  logo = "🏢",
}: StockHeaderProps) {
  const { formatPrice, isStealthMode } = useStealthMode();

  const mockData = {
    earningsDate: "Nov 19",
    pe: "24.5",
    eps: "18.88",
    marketCap: "$125.13B",
    dividendYield: "1.4%",
    priceChange: 1.06,
    priceChangePercent: 0.23,
  };

  const isPositive = mockData.priceChange >= 0;

  return (
    <div className="bg-white">
      <div className="container mx-auto px-6 py-6">
        {/* Company Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
              {logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{stock.name}</h1>
              <div className="flex items-center gap-2 text-gray-600">
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
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-4xl font-bold text-gray-900">
                {formatPrice(stock.price)}
              </span>
              <span
                className={`text-lg font-medium ${
                  isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatPrice(mockData.priceChange)} ({isPositive ? "▲" : "▼"}{" "}
                {mockData.priceChangePercent}%)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-8 text-sm">
            {/* Earnings Date */}
            <Tooltip 
              content="The next date on which the company will report its financial results"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 mb-1">Earnings date</div>
                <div className="font-medium text-gray-900">
                  {mockData.earningsDate}
                </div>
              </div>
            </Tooltip>

            {/* P/E Ratio */}
            <Tooltip 
              content="The price-to-earnings ratio. A measure of how expensive a stock is relative to its earnings"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 mb-1">P/E</div>
                <div className="font-medium text-gray-900">
                  {isStealthMode ? "••••" : mockData.pe}
                </div>
              </div>
            </Tooltip>

            {/* EPS */}
            <Tooltip 
              content="Earnings per share. The portion of a company's profit allocated to each outstanding share of common stock"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 mb-1">EPS</div>
                <div className="font-medium text-gray-900">
                  {isStealthMode ? "••••" : mockData.eps}
                </div>
              </div>
            </Tooltip>

            {/* Market Cap */}
            <Tooltip 
              content="The current total value of the company's shares which are in circulation at the moment"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 mb-1">Market cap</div>
                <div className="font-medium text-gray-900">
                  {isStealthMode ? "••••" : mockData.marketCap}
                </div>
              </div>
            </Tooltip>

            {/* Dividend Yield */}
            <Tooltip 
              content="Dividend yield, FWD - the ratio of the amount of dividends for the next 12 months to the share price"
              position="bottom"
            >
              <div>
                <div className="text-gray-500 mb-1">Dividend yield</div>
                <div className="font-medium text-gray-900">
                  {isStealthMode ? "••••" : mockData.dividendYield}
                </div>
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
