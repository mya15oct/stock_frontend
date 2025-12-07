"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import type { Stock } from "@/types";
import { stockService } from "@/services/stockService";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StockHeader from "./(components)/stock-header";
import StockTabNavigation from "./(components)/stock-tab-navigation";
import OverviewTab from "./(components)/tabs/tab-overview";
import DividendsTab from "./(components)/tabs/tab-dividends";
import FinancialsTab from "./(components)/tabs/tab-financials";
import NewsTab from "./(components)/tabs/tab-news";
import CommunityTab from "./(components)/tabs/tab-community";
import { useURLTabState } from "@/hooks/useURLTabState";
import { StockTabId } from "@/constants";

function StockPageContent({ params }: { params: Promise<{ ticker: string }> }) {
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState<string>("");
  const { activeTab, changeTab } = useURLTabState("dividends");

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const resolvedParams = await params;
        setTicker(resolvedParams.ticker);
        const stockData = await stockService.getStock(resolvedParams.ticker);

        // Fetch price change data from database
        try {
          const priceChangeData = await stockService.getPriceChange(resolvedParams.ticker);
          stockData.priceChange = priceChangeData.absoluteChange;
          stockData.priceChangePercent = priceChangeData.percentageChange;
        } catch (priceErr) {
          console.warn("Could not fetch price change data:", priceErr);
          // Continue without price change data (fallback to defaults)
        }

        setStock(stockData);
      } catch (err) {
        setError("Stock not found");
        console.error("Error fetching stock:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStock();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading stock data...</div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab stock={stock} />;
      case "dividends":
        return <DividendsTab ticker={stock.ticker} />;
      case "financials":
        return <FinancialsTab ticker={stock.ticker} />;
      case "news":
        return <NewsTab ticker={stock.ticker} />;
      case "community":
        return <CommunityTab ticker={stock.ticker} />;
      default:
        return <DividendsTab ticker={stock.ticker} />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto py-11 px-6">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg mb-4 px-6 py-3">
          <Breadcrumb
            sector={stock.sector}
            companyName={stock.name}
            ticker={stock.ticker}
          />
        </div>

        {/* Stock Header with Company Info */}
        <StockHeader stock={stock} />

        {/* Tab Navigation */}
        <StockTabNavigation
          activeTab={activeTab as StockTabId}
          onTabChange={changeTab}
        />

        {/* Tab Content */}
        <div className="min-h-screen">{renderTabContent()}</div>
      </div>
    </div>
  );
}

export default function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StockPageContent params={params} />
    </Suspense>
  );
}
