"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { FeaturedNews, HeatmapData } from "@/types/market";
import { getNews } from "@/services/newsService";
import { fetchMarketStocks } from "@/services/marketMetadataService";
import { hasCompanyData } from "@/utils/company";

// Top 30 popular stock tickers for mock news
const POPULAR_TICKERS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK.B", "V", "JNJ",
  "WMT", "JPM", "MA", "PG", "UNH", "HD", "DIS", "BAC", "ADBE", "NFLX",
  "PYPL", "CMCSA", "PFE", "KO", "NKE", "T", "INTC", "VZ", "CSCO", "MRK"
];

// Mock news templates in English
const NEWS_TEMPLATES = [
  "{TICKER} shares surge {PERCENT}% on strong earnings beat, analysts raise price targets",
  "{TICKER} announces major partnership deal, stock jumps {PERCENT}% in pre-market trading",
  "Institutional investors increase stake in {TICKER}, driving {PERCENT}% gain",
  "{TICKER} reports record quarterly revenue, shares climb {PERCENT}% to new highs",
  "Analysts upgrade {TICKER} rating following positive guidance, stock up {PERCENT}%",
  "{TICKER} unveils new product line, market reacts positively with {PERCENT}% surge",
  "Strong buyback program announced by {TICKER}, shares rally {PERCENT}%",
  "{TICKER} beats expectations on all metrics, stock soars {PERCENT}%",
  "Major acquisition news lifts {TICKER} shares by {PERCENT}%",
  "{TICKER} dividend increase announcement drives {PERCENT}% stock price jump",
  "{TICKER} expands into new markets, shares gain {PERCENT}% on growth outlook",
  "Positive regulatory approval boosts {TICKER} stock by {PERCENT}%",
  "{TICKER} CEO announces strategic initiatives, investors respond with {PERCENT}% rally",
  "Strong technical indicators signal bullish momentum for {TICKER}, up {PERCENT}%",
  "{TICKER} reports better-than-expected margins, stock jumps {PERCENT}%",
];

// Stock market related Unsplash image IDs - verified working URLs
const STOCK_IMAGES = [
  "1486406146926-c627a92ad1ab", // Business building
  "1611273426858-450d8e3c9fce", // Stock chart
  "1611974789855-9c2a0a7236a3", // Financial data
  "1554224155-6726b3ff858f", // Trading floor
  "1582719471137-c3967ffb1c42", // Market analysis
  "1578575437130-527eed3abbec", // Business meeting
  "1474487548417-781cb71495f3", // Technology
  "1460925895917-afdab827c52f", // Finance
  "1551284619-4b062714ba13", // Analytics
  "1552664736-d306d0b0a887", // Business strategy
  "1507003211169-0a1dd7228f2d", // Business person
  "1551434678-e076c223a0d7", // Team meeting
  "1521737852567-9c0c0a0b9c9b", // Growth chart
  "1551284619-4b062714ba13", // Data analytics
  "1460925895917-afdab827c52f", // Finance duplicate
];

// Fallback placeholder image - simple gray placeholder
const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%239ca3af'%3EImage%3C/text%3E%3C/svg%3E";

// Helper function to validate and fix Unsplash URLs
function getImageUrl(imageId: string): string {
  // Ensure proper Unsplash URL format
  if (!imageId || imageId.trim() === '') {
    return FALLBACK_IMAGE;
  }

  // Remove any leading/trailing whitespace
  const cleanId = imageId.trim();

  // Return Unsplash URL with proper format
  return `https://images.unsplash.com/photo-${cleanId}?w=400&h=300&fit=crop&auto=format`;
}

// Generate mock news for multiple tickers with real changePercent from heatmap
function generateMockNews(
  tickers: string[],
  stockDataMap: Map<string, { changePercent: number }>,
  count: number = 6
): FeaturedNews[] {
  const news: FeaturedNews[] = [];
  const baseTime = Date.now();

  // Shuffle templates to avoid repetition
  const shuffledTemplates = [...NEWS_TEMPLATES].sort(() => Math.random() - 0.5);
  // Shuffle images to avoid repetition
  const shuffledImages = [...STOCK_IMAGES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count && i < tickers.length; i++) {
    const ticker = tickers[i];
    const template = shuffledTemplates[i % shuffledTemplates.length];

    // Get real changePercent from heatmap data
    const stockData = stockDataMap.get(ticker);
    let change = stockData?.changePercent ?? 0;

    // If no data from heatmap, use a small random value
    if (!stockData) {
      change = Math.random() * 8 - 2; // Random between -2% and 6%
    }

    const title = template
      .replace("{TICKER}", ticker)
      .replace("{PERCENT}", Math.abs(change).toFixed(2));

    // Select image from shuffled images array
    const imageId = shuffledImages[i % shuffledImages.length];

    news.push({
      id: `mock-${ticker}-${i}`,
      title,
      thumbnail: getImageUrl(imageId),
      source: ticker,
      ticker,
      change,
      changePercent: change,
      publishedAt: new Date(baseTime - (i + 1) * 5 * 60 * 1000).toISOString(),
      category: "stock",
    });
  }

  return news;
}

interface FeaturedNewsPanelProps {
  heatmapData?: HeatmapData | null;
}

/**
 * FeaturedNewsPanel - Featured market news panel
 *
 * FireAnt-style design:
 * - Title "Featured news"
 * - List of articles with thumbnail on the left
 * - Title and time-ago on the right
 * - Uses real changePercent from heatmap data
 */
export default function FeaturedNewsPanel({ heatmapData }: FeaturedNewsPanelProps) {
  const [news, setNews] = useState<FeaturedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);

  // Fix hydration error by only rendering time on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract stock data from heatmap to get real changePercent
  const stockDataMap = useMemo(() => {
    if (!heatmapData?.sectors) return new Map<string, { changePercent: number }>();

    const map = new Map<string, { changePercent: number }>();
    heatmapData.sectors.forEach(sector => {
      sector.stocks.forEach(stock => {
        if (stock.ticker && typeof stock.changePercent === 'number' && !isNaN(stock.changePercent)) {
          map.set(stock.ticker.toUpperCase(), {
            changePercent: stock.changePercent,
          });
        }
      });
    });
    return map;
  }, [heatmapData]);

  // Load market stocks and generate mock news for multiple tickers with real changePercent
  useEffect(() => {
    const loadMockNews = async () => {
      setLoading(true);
      try {
        // Try to fetch real market stocks, fallback to popular tickers
        let allTickers: string[] = POPULAR_TICKERS;
        try {
          const stocks = await fetchMarketStocks();
          if (stocks && stocks.length > 0) {
            // Get first 30 tickers from market data
            allTickers = stocks
              .slice(0, 30)
              .map(s => s.symbol.toUpperCase());
          }
        } catch (err) {
          // Fallback to popular tickers if fetch fails
          if (process.env.NODE_ENV === 'development') {
            if (process.env.NODE_ENV === "development") {
              // eslint-disable-next-line no-console
              console.warn(
                "[FeaturedNewsPanel] Failed to fetch market stocks, using popular tickers"
              );
            }
          }
        }

        // Chỉ giữ những mã có dữ liệu/logo (để ảnh/metadata đầy đủ)
        const filtered = allTickers.filter((t) => hasCompanyData(t));

        // Select 6 different random tickers from the filtered list (fallback to original if empty)
        const source = filtered.length > 0 ? filtered : allTickers;
        const shuffled = [...source].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 6);
        setSelectedTickers(selected);

        // Generate mock news for these tickers with real changePercent from heatmap
        const mockNews = generateMockNews(selected, stockDataMap, 6);
        setNews(mockNews);
      } catch (err) {
        // Fallback to popular tickers if all fails
        const filtered = POPULAR_TICKERS.filter((t) => hasCompanyData(t));
        const source = filtered.length > 0 ? filtered : POPULAR_TICKERS;
        const shuffled = [...source].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 6);
        setSelectedTickers(selected);
        const mockNews = generateMockNews(selected, stockDataMap, 6);
        setNews(mockNews);
      } finally {
        setLoading(false);
      }
    };

    loadMockNews();
  }, []); // Only run once on mount

  // Update news when heatmap data changes (to sync changePercent for all tickers)
  useEffect(() => {
    if (selectedTickers.length === 0 || news.length === 0) return;

    // Update all news items with latest changePercent from heatmap
    setNews(prevNews => {
      return prevNews.map((article) => {
        const ticker = article.ticker?.toUpperCase();
        if (!ticker || !stockDataMap.has(ticker)) {
          return article; // Keep original if no data
        }

        const stockData = stockDataMap.get(ticker);
        const realChangePercent = stockData?.changePercent ?? article.changePercent;

        // Only update if change is significant (> 0.05% difference)
        if (realChangePercent !== undefined && Math.abs(realChangePercent - article.changePercent) < 0.05) {
          return article;
        }

        // Extract template from existing title (remove ticker and percentage)
        // Example: "AAPL shares surge 3.45% on strong earnings..." -> "shares surge {PERCENT}% on strong earnings..."
        let template = article.title;
        // Replace ticker with placeholder
        template = template.replace(new RegExp(ticker, 'gi'), '{TICKER}');
        // Replace percentage with placeholder (match pattern like "3.45%" or "-1.23%")
        template = template.replace(/\d+\.\d+%/g, '{PERCENT}%');

        // Update title with new percentage
        const title = template
          .replace("{TICKER}", ticker)
          .replace("{PERCENT}", Math.abs(realChangePercent).toFixed(2));

        return {
          ...article,
          change: realChangePercent,
          changePercent: realChangePercent,
          title,
        };
      });
    });
  }, [stockDataMap, selectedTickers.length, news.length]);

  // Auto-refresh news every 5 minutes (disabled for now)
  useEffect(() => {
    // const interval = setInterval(async () => {
    //   const data = await getNews(6);
    //   if (data.length > 0) {
    //     setNews(data);
    //   }
    // }, 300000); // 5 minutes
    // return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  const getCategoryColor = (category: FeaturedNews["category"]): string => {
    const colors = {
      market: "text-blue-500",
      economy: "text-green-500",
      stock: "text-purple-500",
      commodity: "text-yellow-500",
      crypto: "text-orange-500",
    };
    return colors[category];
  };

  return (
    <div className="bg-white dark:bg-[#2a2d3a] rounded-lg shadow-lg h-full overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Featured news</h2>
        <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* News List - Internal scroll only */}
      {loading && news.length === 0 ? (
        // Loading skeleton
        <div className="space-y-2 p-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex gap-2 animate-pulse">
              <div className="w-20 h-16 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-2 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 px-2 py-1 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {news.map((article) => {
            const NewsItem = ({ article, formatTimeAgo, mounted }: { article: FeaturedNews; formatTimeAgo: (iso: string) => string; mounted: boolean }) => {
              const [imageError, setImageError] = React.useState(false);
              const imageSrc = imageError ? FALLBACK_IMAGE : article.thumbnail;

              return (
                <div className="group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/30 rounded p-2 transition-colors mb-2">
                  <div className="flex gap-2">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-200 dark:bg-gray-800">
                      <Image
                        src={imageSrc}
                        alt={article.title}
                        fill
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        unoptimized
                        onError={() => {
                          if (!imageError) {
                            setImageError(true);
                          }
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      {/* Ticker info (if exists) */}
                      {article.ticker && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold ${article.changePercent === 0 ? 'text-yellow-500' :
                            article.changePercent! > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {article.ticker}
                          </span>
                          <span className={`text-xs font-medium ${article.changePercent === 0 ? 'text-yellow-500' :
                            article.changePercent! > 0 ? 'text-green-500' : 'text-red-500'
                            }`}>
                            {article.changePercent! >= 0 ? '+' : ''}{article.changePercent?.toFixed(2)}%
                          </span>
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="text-xs text-gray-800 dark:text-gray-200 font-normal line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                        {article.title}
                      </h3>

                      {/* Meta info */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 dark:text-gray-500">
                          {mounted ? formatTimeAgo(article.publishedAt) : '...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            };

            return <NewsItem key={article.id} article={article} formatTimeAgo={formatTimeAgo} mounted={mounted} />;
          })}
        </div>
      )}
    </div>
  );
}
