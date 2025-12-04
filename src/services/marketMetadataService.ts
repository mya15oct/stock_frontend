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

/**
 * Fetch market metadata (universe of stocks) from backend.
 *
 * Source: GET /api/market/stocks on the Python market-api-service.
 * Includes retry logic with exponential backoff for resilience.
 */
export async function fetchMarketStocks(): Promise<MarketStockMetadata[]> {
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
      return json.stocks.map((stock) => ({
        ...stock,
        symbol: stock.symbol.toUpperCase(),
      }));
    },
    {
      maxRetries: 5,
      initialDelay: 300,
      maxDelay: 3000,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        // eslint-disable-next-line no-console
        console.warn(
          `[fetchMarketStocks] Retry attempt ${attempt}/5:`,
          error instanceof Error ? error.message : error
        );
      },
    }
  );
}


