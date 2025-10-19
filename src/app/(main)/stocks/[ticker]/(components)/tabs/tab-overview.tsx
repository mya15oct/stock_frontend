"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { useStealthMode } from "@/contexts/StealthContext";
import type { Stock } from "@/types";
import PromotionalBanner from "@/components/PromotionalBanner";

interface OverviewTabProps {
  stock: Stock;
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode();
  const [selectedPeriod, setSelectedPeriod] = useState("1y");
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

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

                {/* Performance indicator moved here */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 font-medium">
                    Oct 11, 24 - Oct 11, 25
                  </span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-green-600 font-semibold">
                    +$17.72 (▲ 7.79%)
                  </span>
                </div>
              </div>

              {/* Chart Container - Flex grow to fill remaining space */}
              <div className="relative flex-1 min-h-[400px] bg-white">
                {/* Professional Chart SVG with Min/Max Indicators */}
                <svg
                  className="w-full h-full"
                  viewBox="0 0 1000 400"
                  role="img"
                  aria-label="Price history Nov '24 – Oct '25"
                >
                  <defs>
                    {/* Gradient fill under the line */}
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#60A5FA"
                        stopOpacity="0.40"
                      />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Background */}
                  <rect x="0" y="0" width="100%" height="100%" fill="#FAFAFA" />

                  {/* Grid lines */}
                  <g stroke="#E5E7EB" strokeWidth="1">
                    <line x1="70" x2="960" y1="340" y2="340" />
                    <line x1="70" x2="960" y1="288.33" y2="288.33" />
                    <line x1="70" x2="960" y1="236.67" y2="236.67" />
                    <line x1="70" x2="960" y1="185" y2="185" />
                    <line x1="70" x2="960" y1="133.33" y2="133.33" />
                    <line x1="70" x2="960" y1="81.67" y2="81.67" />
                    <line x1="70" x2="960" y1="30" y2="30" />
                  </g>

                  {/* Y-axis labels */}
                  <g
                    fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                    fontSize="12"
                    fill="#6B7280"
                    textAnchor="end"
                  >
                    <text x="60" y="343">
                      160
                    </text>
                    <text x="60" y="291.33">
                      180
                    </text>
                    <text x="60" y="239.67">
                      200
                    </text>
                    <text x="60" y="188">
                      220
                    </text>
                    <text x="60" y="136.33">
                      240
                    </text>
                    <text x="60" y="84.67">
                      260
                    </text>
                    <text x="60" y="33">
                      280
                    </text>
                  </g>

                  {/* X-axis labels */}
                  <g
                    fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
                    fontSize="12"
                    fill="#6B7280"
                    textAnchor="middle"
                  >
                    <text x="70" y="370">
                      Nov '24
                    </text>
                    <text x="150.91" y="370">
                      Dec '24
                    </text>
                    <text x="231.82" y="370">
                      2025
                    </text>
                    <text x="312.73" y="370">
                      Feb '25
                    </text>
                    <text x="393.64" y="370">
                      Mar '25
                    </text>
                    <text x="474.55" y="370">
                      Apr '25
                    </text>
                    <text x="555.45" y="370">
                      May '25
                    </text>
                    <text x="636.36" y="370">
                      Jun '25
                    </text>
                    <text x="717.27" y="370">
                      Jul '25
                    </text>
                    <text x="798.18" y="370">
                      Aug '25
                    </text>
                    <text x="879.09" y="370">
                      Sep '25
                    </text>
                    <text x="960" y="370">
                      Oct '25
                    </text>
                  </g>

                  {/* Area under line */}
                  <path
                    d="
                      M 70 159.2
                      C 110 159.2, 110 177.3, 150.91 177.3
                      C 190.91 177.3, 191 164.3, 231.82 164.3
                      C 271.82 164.3, 273 120.4, 312.73 120.4
                      C 352.73 120.4, 354 86.8, 393.64 86.8
                      C 433.64 86.8, 435 309, 474.55 309
                      C 514.55 309, 516 236.67, 555.45 236.67
                      C 595.45 236.67, 597 241.83, 636.36 241.83
                      C 676.36 241.83, 678 223.75, 717.27 223.75
                      C 757.27 223.75, 759 159.2, 798.18 159.2
                      C 838.18 159.2, 840 120.4, 879.09 120.4
                      C 919.09 120.4, 921 107.5, 960 107.5
                      L 960 340 L 70 340 Z"
                    fill="url(#areaGrad)"
                  />

                  {/* Price line */}
                  <path
                    d="
                      M 70 159.2
                      C 110 159.2, 110 177.3, 150.91 177.3
                      C 190.91 177.3, 191 164.3, 231.82 164.3
                      C 271.82 164.3, 273 120.4, 312.73 120.4
                      C 352.73 120.4, 354 86.8, 393.64 86.8
                      C 433.64 86.8, 435 309, 474.55 309
                      C 514.55 309, 516 236.67, 555.45 236.67
                      C 595.45 236.67, 597 241.83, 636.36 241.83
                      C 676.36 241.83, 678 223.75, 717.27 223.75
                      C 757.27 223.75, 759 159.2, 798.18 159.2
                      C 838.18 159.2, 840 120.4, 879.09 120.4
                      C 919.09 120.4, 921 107.5, 960 107.5"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Current price dot */}
                  <circle
                    cx="960"
                    cy="107.5"
                    r="4.5"
                    fill="#3B82F6"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />

                  {/* Max line + label - Full width */}
                  <line
                    x1="70"
                    x2="960"
                    y1="86.8"
                    y2="86.8"
                    stroke="#9CA3AF"
                    strokeDasharray="4,2"
                    strokeWidth="1"
                  />
                  <text
                    x="960"
                    y="82"
                    textAnchor="end"
                    fill="#6B7280"
                    fontSize="12"
                    fontFamily="system-ui"
                  >
                    max: $259.02
                  </text>

                  {/* Min line + label - Full width */}
                  <line
                    x1="70"
                    x2="960"
                    y1="309"
                    y2="309"
                    stroke="#9CA3AF"
                    strokeDasharray="4,2"
                    strokeWidth="1"
                  />
                  <text
                    x="960"
                    y="322"
                    textAnchor="end"
                    fill="#6B7280"
                    fontSize="12"
                    fontFamily="system-ui"
                  >
                    min: $172.42
                  </text>
                </svg>
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
                  <span className="font-medium">37.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS</span>
                  <span className="font-medium">6.58</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beta</span>
                  <span className="font-medium">1.165</span>
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
                  <span className="font-medium">30.9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS (FWD)</span>
                  <span className="font-medium">7.944</span>
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
                  <span className="font-medium">0.42%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual payout</span>
                  <span className="font-medium">$1.04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next ex. div date</span>
                  <span className="font-medium">November 11, 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout</span>
                  <span className="font-medium">15.47%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.growth, 5y</span>
                  <span className="font-medium">4.99%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend growth streak</span>
                  <span className="font-medium">1 year</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.rating</span>
                  <span className="font-medium text-gray-400">⭐</span>
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
