"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import StockCard from "@/components/shared/StockCard";
import Breadcrumb, { BreadcrumbItem } from "@/components/layout/Breadcrumb";
import type { Stock } from "@/types";
import { stockService } from "@/services/stockService";

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const country = searchParams.get("country") || "";
  const sector = searchParams.get("sector") || "";

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const stocksData = await stockService.getStocks();

        // Fetch price for each stock
        const stocksWithPrices = await Promise.all(
          stocksData.map(async (stock) => {
            try {
              const quote = await stockService.getQuote(stock.ticker);
              return { ...stock, price: quote.currentPrice };
            } catch {
              return stock; // Keep original if fetch fails
            }
          })
        );

        setStocks(stocksWithPrices);

        // Extract unique sectors from data (normalize to title case)
        const sectors = Array.from(
          new Set(
            stocksWithPrices
              .map((s) => s.sector)
              .filter((s) => s && s !== "Unknown")
              .map((s) => s.toLowerCase()) // Normalize to lowercase first
          )
        )
          .sort()
          .map((s) =>
            // Convert to title case for display
            s.split(' ').map(word =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ')
          );
        setAvailableSectors(sectors);

        let filtered = stocksWithPrices;

        if (sector) {
          filtered = filtered.filter(
            (stock: Stock) =>
              stock.sector?.toLowerCase() === sector.toLowerCase()
          );
        }

        setFilteredStocks(filtered);
      } catch (err) {
        setError("Failed to load stocks");
        console.error("Error fetching stocks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [sector]);

  // Apply search filter
  useEffect(() => {
    let filtered = [...stocks];

    // Filter by sector if selected
    if (sector) {
      filtered = filtered.filter(
        (stock: Stock) =>
          stock.sector?.toLowerCase() === sector.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (stock: Stock) =>
          stock.ticker?.toLowerCase().includes(query) ||
          stock.name?.toLowerCase().includes(query)
      );
    }

    setFilteredStocks(filtered);
  }, [sector, searchQuery, stocks]);

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [{ label: "Stocks", href: "/stocks" }];

    if (country) {
      items.push({
        label: country.charAt(0).toUpperCase() + country.slice(1),
        href: `/stocks?country=${country}`,
      });
    }

    if (sector) {
      items.push({
        label: sector.charAt(0).toUpperCase() + sector.slice(1),
        href: `/stocks?sector=${sector}`,
        active: true,
      });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading stocks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const pageTitle = sector
    ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Stocks`
    : country
      ? `${country.charAt(0).toUpperCase() + country.slice(1)} Stocks`
      : "All Stocks";

  return (
    <div className="space-y-6 px-4 md:px-6 lg:px-8">
      <div className="mb-4">
        <Breadcrumb customItems={getBreadcrumbItems()} />
      </div>

      <div className="pt-2">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">{pageTitle}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {filteredStocks.length} stock{filteredStocks.length !== 1 ? "s" : ""}{" "}
          available
          {sector && ` in ${sector} sector`}
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Sector Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => (window.location.href = "/stocks")}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${!sector && !country
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
          >
            All Sectors
          </button>
          {availableSectors.map((sectorName) => (
            <button
              key={sectorName}
              onClick={() =>
                (window.location.href = `/stocks?sector=${encodeURIComponent(sectorName)}`)
              }
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${sector === sectorName
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
            >
              {sectorName}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="w-full lg:w-96">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ticker or company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-10 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredStocks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStocks.map((stock) => (
            <StockCard key={stock.ticker} stock={stock} />
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">
              No stocks found for the selected criteria.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
