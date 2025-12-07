import { PYTHON_API_URL } from "./apiBase";
import { retryWithBackoff } from "@/utils/retry";

export type MarketStockMetadata = {
  symbol: string;
  name: string;
  exchange: string | null;
  sector: string | null;
  // Optional market cap placeholder for future backend extensions
  marketCap?: number | null;
};

interface MarketStocksApiResponse {
  success: boolean;
  count: number;
  stocks: MarketStockMetadata[];
}

const CACHE_KEY = 'market_stocks_metadata';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

interface CachedData {
  data: MarketStockMetadata[];
  timestamp: number;
}

/**
 * ✅ Step 3: Cache Market Data - Load from localStorage first, refresh in background
 * Fetch market metadata (universe of stocks) from backend.
 *
 * Source: GET /api/market/stocks on the Python market-api-service.
 * Includes retry logic with exponential backoff for resilience.
 */
export async function fetchMarketStocks(): Promise<MarketStockMetadata[]> {
  // Try to load from cache first
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        
        // If cache is fresh (< 5 minutes), return immediately
        if (age < CACHE_TTL_MS && Array.isArray(parsed.data)) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.log('[fetchMarketStocks] ✅ Loaded from cache');
          }
          
          // Refresh in background (don't await)
          refreshMarketStocksInBackground();
          
          return parsed.data;
        }
      }
    } catch (err) {
      // Cache read failed, continue with API call
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('[fetchMarketStocks] Cache read failed:', err);
      }
    }
  }

  // Cache miss or expired, fetch from API
  return fetchMarketStocksFromAPI();
}

async function fetchMarketStocksFromAPI(): Promise<MarketStockMetadata[]> {
  return retryWithBackoff(
    async () => {
      const res = await fetch(`${PYTHON_API_URL}/api/market/stocks`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to fetch market stocks: ${res.status} ${res.statusText} - ${text}`
        );
      }

      const json = (await res.json()) as MarketStocksApiResponse;
      if (!json.success || !Array.isArray(json.stocks)) {
        throw new Error("Invalid /api/market/stocks response format");
      }

      // Normalize all symbols to UPPERCASE for consistent internal state
      const normalized = json.stocks.map((stock) => ({
        ...stock,
        symbol: stock.symbol.toUpperCase(),
      }));

      // ✅ Step 3: Cache the result
      if (typeof window !== 'undefined') {
        try {
          const cacheData: CachedData = {
            data: normalized,
            timestamp: Date.now(),
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
        } catch (err) {
          // Cache write failed, but continue
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn('[fetchMarketStocks] Cache write failed:', err);
          }
        }
      }

      return normalized;
    },
    {
      maxRetries: 1, // ✅ Step 8: Reduced to 1 retry for initial load
      initialDelay: 200,
      maxDelay: 1000, // ✅ Reduced max delay
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn(
            `[fetchMarketStocks] Retry attempt ${attempt}/1:`,
            error instanceof Error ? error.message : error
          );
        }
      },
    }
  );
}

// Background refresh function (non-blocking)
async function refreshMarketStocksInBackground(): Promise<void> {
  try {
    await fetchMarketStocksFromAPI();
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('[fetchMarketStocks] ✅ Background refresh completed');
    }
  } catch (err) {
    // Silent fail for background refresh
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[fetchMarketStocks] Background refresh failed:', err);
    }
  }
}
