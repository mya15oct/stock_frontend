"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import type { Stock } from "@/types";
import PromotionalBanner from "@/components/ui/PromotionalBanner";
import { PriceHistoryChart, type PriceDataPoint } from "@/components/charts";

interface OverviewTabProps {
  stock: Stock;
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode();
  const [selectedPeriod, setSelectedPeriod] = useState("1y");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

  const faqData = [
    {
      question: "What sector does Apple Inc (AAPL) operate in?",
      answer:
        "Apple Inc belongs to the Information Technology sector and operates in the Consumer Electronics industry.",
    },
    {
      question: "What is Apple Inc (AAPL) current stock price?",
      answer:
        "As of the latest data, Apple Inc stock price is $245.27, with a previous close of $254.04. Apple Inc lost -$8.77 in the last trading session, representing a -3.45% loss.",
    },
    {
      question: "What is Apple Inc (AAPL) current market capitalization?",
      answer: "Apple Inc market cap is approximately 3.64 trillion.",
    },
    {
      question: "What is Apple Inc (AAPL) Earnings Per Share (EPS)?",
      answer: "The trailing EPS is $6.58, and the forward EPS is $7.94.",
    },
    {
      question: "What is Apple Inc (AAPL) Price-to-Earnings (P/E) ratio?",
      answer:
        "Apple Inc current P/E ratio is 37.28, with a forward P/E of 30.87.",
    },
    {
      question: "What is Apple Inc (AAPL) EBITDA?",
      answer:
        "Apple Inc EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization) is 31.03 billion.",
    },
    {
      question: "Does Apple Inc (AAPL) pay dividends?",
      answer:
        "Yes, Apple Inc pays quarterly dividends with an annualized yield of 0.42% and an estimated annual payout of $1.04 per share.",
    },
    {
      question: "When is the next ex-dividend date for Apple Inc (AAPL)?",
      answer: "The next ex-dividend date is scheduled for November 11, 2025.",
    },
    {
      question:
        "How did Apple Inc (AAPL) perform in its most recent earnings report?",
      answer:
        "In the last report (June 30, 2025), Apple Inc posted an EPS surprise of 11.35% and a revenue surprise of 5.47%.",
    },
    {
      question: "When is Apple Inc (AAPL) next earnings report?",
      answer:
        "Apple Inc is expected to release its next earnings report on September 30, 2025.",
    },
    {
      question: "What is Apple Inc (AAPL) beta (volatility) score?",
      answer:
        "Apple Inc has a beta of 1.165, meaning its volatility is roughly in line with the market.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqQuestions = [
    "What sector does Apple Inc (AAPL) operate in?",
    "What is Apple Inc (AAPL) current stock price?",
    "What is Apple Inc (AAPL) current market capitalization?",
    "What is Apple Inc (AAPL) price-to-earnings ratio?",
    "What is Apple Inc (AAPL) price-to-book ratio?",
    "What is Apple Inc (AAPL) current P/E ratio?",
    "What is Apple Inc (AAPL) PEG ratio?",
    "How does Apple Inc (AAPL) perform vs its most recent earnings report?",
    "What does Apple Inc (AAPL) company do?",
    "What is Apple Inc (AAPL) book value/equity ratio?",
  ];

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {/* Promotional Banner */}
        <PromotionalBanner />

        {/* Main Chart + Metrics Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Benchmarks + Price History (takes 2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Benchmarks - Top Left */}
            <Card className="bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900 text-base">
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
            <Card className="bg-white flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Price history
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium text-sm">
                      Price ($)
                    </span>
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                  <button className="p-1 text-gray-400 hover:text-gray-600">
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
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          selectedPeriod === period
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                        }`}
                      >
                        {period}
                      </button>
                    )
                  )}
                  <button className="px-2 py-1.5 text-gray-500 hover:bg-gray-50 rounded-md ml-1">
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
                  <span className="text-gray-500 font-medium">
                    {isStealthMode ? "•••• - ••••" : performanceMetrics.dateRange}
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span
                    className={`font-semibold ${
                      performanceMetrics.change >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {isStealthMode
                      ? "••••"
                      : `${performanceMetrics.change >= 0 ? "+" : ""}$${performanceMetrics.change.toFixed(2)} (${performanceMetrics.change >= 0 ? "▲" : "▼"} ${Math.abs(performanceMetrics.changePercent).toFixed(2)}%)`}
                  </span>
                </div>
              </div>

              {/* Chart Container - Sử dụng PriceHistoryChart component */}
              <div className="relative min-h-[450px] bg-white">
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

          {/* Right Column - All Metrics (takes 1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            {/* Estimate */}
            <Card className="bg-white">
              <h4 className="font-semibold text-gray-900 text-base mb-4">
                Estimate
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E</span>
                  <span className="font-medium text-gray-900">37.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS</span>
                  <span className="font-medium text-gray-900">6.58</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beta</span>
                  <span className="font-medium text-gray-900">1.165</span>
                </div>
              </div>
            </Card>

            {/* Growth */}
            <Card className="bg-white">
              <h4 className="font-semibold text-gray-900 text-base mb-4">
                Growth
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue, YoY</span>
                  <span className="font-medium text-green-600">9.63%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net income, YoY</span>
                  <span className="font-medium text-green-600">9.26%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FCF, YoY</span>
                  <span className="font-medium text-red-600">-8.62%</span>
                </div>
              </div>
            </Card>

            {/* Forecast */}
            <Card className="bg-white">
              <h4 className="font-semibold text-gray-900 text-base mb-4">
                Forecast
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E (FWD)</span>
                  <span className="font-medium text-gray-900">30.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS (FWD)</span>
                  <span className="font-medium text-gray-900">7.944</span>
                </div>
              </div>
            </Card>

            {/* Dividends */}
            <Card className="bg-white">
              <h4 className="font-semibold text-gray-900 text-base mb-4">
                Dividends
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend yield</span>
                  <span className="font-medium text-gray-900">0.42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual payout</span>
                  <span className="font-medium text-gray-900">$1.04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next ex. div date</span>
                  <span className="font-medium text-gray-900">November 11, 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout</span>
                  <span className="font-medium text-gray-900">15.47%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.growth, 5y</span>
                  <span className="font-medium text-gray-900">4.99%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend growth streak</span>
                  <span className="font-medium text-gray-900">1 year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.rating</span>
                  <span className="font-medium text-yellow-500">⭐</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* About the company */}
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-6">About the company</h3>

          {/* Company Info Table */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 pb-6 border-b border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-600">
                Ticker
              </label>
              <div className="text-base font-semibold text-gray-900">AAPL</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Country
              </label>
              <div className="text-base font-semibold text-gray-900">
                United States of America
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Currency
              </label>
              <div className="text-base font-semibold text-gray-900">USD</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Exchange
              </label>
              <div className="text-base font-semibold text-gray-900">
                NASDAQ
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Industry
              </label>
              <div className="text-base font-semibold text-gray-900">
                Information Technology
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Sector
              </label>
              <div className="text-base font-semibold text-gray-900">
                Technology Hardware & Equipment
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Market cap
              </label>
              <div className="text-base font-semibold text-gray-900">
                $3.77T
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">
                Employees
              </label>
              <div className="text-base font-semibold text-gray-900">
                161,000
              </div>
            </div>
          </div>
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm">
            <p>
              Apple Inc. designs, manufactures, and markets smartphones,
              personal computers, tablets, wearables, and accessories worldwide.
              The company offers iPhone, a line of smartphones; Mac, a line of
              personal computers; iPad, a line of multi-purpose tablets; and
              wearables, home, and accessories comprising AirPods, Apple TV,
              Apple Watch, Beats products, and HomePod.
            </p>
            <p>
              The company also provides AppleCare support and cloud services;
              and operates various platforms, including the App Store that allow
              customers to discover and download applications and digital
              content, such as books, music, video, games, and podcasts. In
              addition, it offers various services, such as Apple Arcade, a game
              subscription service; Apple Fitness+, a personalized fitness
              service; Apple Music, which offers users a curated listening
              experience with on-demand radio stations; Apple News+, a
              subscription news and magazine service; Apple TV+, which offers
              exclusive original content; Apple Card, a co-branded credit card;
              and Apple Pay, a mobile payment service, as well as licenses its
              intellectual property.
            </p>
            <p>
              The company serves consumers, and small and mid-sized businesses;
              and the education, enterprise, and government markets. It
              distributes third-party applications for its products through the
              App Store. The company also sells its products through its retail
              and online stores, and direct sales force; and third-party
              cellular network carriers, wholesalers, retailers, and resellers.
              Apple Inc. was incorporated in 1977 and is headquartered in
              Cupertino, California.
            </p>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="mb-6">
          <h3 className="text-xl font-semibold mb-6">
            Frequently asked questions
          </h3>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-3">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="text-left w-full flex justify-between items-center text-gray-800 hover:text-blue-600 transition-colors py-3"
                >
                  <span className="font-medium pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                      openFAQ === index ? "rotate-180" : ""
                    }`}
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
                </button>

                {openFAQ === index && (
                  <div className="mt-3 pb-3 text-gray-600 text-sm leading-relaxed animate-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
