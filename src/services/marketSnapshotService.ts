import { PYTHON_API_URL } from "./apiBase";
import { retryWithBackoff } from "@/utils/retry";

export type MarketSnapshot = {
  price: number;
  change: number;
  changePercent: number;
  /**
   * Previous day's close price for the symbol.
   * Used as the baseline to compute price change % on the heatmap.
   */
  previousClose?: number;
  volume?: number;
};

interface QuoteApiResponse {
  success: boolean;
  data: {
    currentPrice: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
    open: number;
    previousClose: number;
  };
}

/**
 * Fetch latest quote/snapshot per symbol using the backend quote API.
 *
 * Source: GET /api/quote?ticker=SYMBOL on the Python market-api-service.
 * NOTE: This is a best-effort snapshot. Missing or failed symbols are simply omitted.
 * Includes retry logic with exponential backoff for resilience.
 */
export async function fetchMarketSnapshots(
  symbols: string[]
): Promise<Record<string, MarketSnapshot>> {
  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));

  const entries = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        return await retryWithBackoff(
          async () => {
            const url = `${PYTHON_API_URL}/api/quote?ticker=${encodeURIComponent(
              symbol
            )}`;
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(
                `Failed to fetch quote for ${symbol}: ${res.status} ${res.statusText}`
              );
            }

            const json = (await res.json()) as QuoteApiResponse;
            if (!json.success || !json.data) {
              throw new Error(`Invalid quote response for ${symbol}`);
            }

            const snap: MarketSnapshot = {
              price: json.data.currentPrice ?? 0,
              change: json.data.change ?? 0,
              changePercent: json.data.percentChange ?? 0,
              previousClose: json.data.previousClose ?? undefined,
              // Volume is not exposed by the current quote API; keep it optional for future use.
            };

            return [symbol, snap] as const;
          },
          {
            maxRetries: 5,
            initialDelay: 300,
            maxDelay: 3000,
            backoffMultiplier: 2,
            onRetry: (attempt) => {
              // eslint-disable-next-line no-console
              console.warn(
                `[fetchMarketSnapshots] Retry attempt ${attempt}/5 for ${symbol}`
              );
            },
          }
        );
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(
          `[fetchMarketSnapshots] Failed to fetch quote for ${symbol} after retries:`,
          err instanceof Error ? err.message : err
        );
        return null;
      }
    })
  );

  const snapshotMap: Record<string, MarketSnapshot> = {};
  for (const entry of entries) {
    if (!entry) continue;
    const [symbol, snap] = entry;
    snapshotMap[symbol] = snap;
  }

  return snapshotMap;
}




