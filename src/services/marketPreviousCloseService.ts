import { PYTHON_API_URL } from "./apiBase";
import { retryWithBackoff } from "@/utils/retry";

interface PreviousClosesApiResponse {
  success: boolean;
  previousCloses: Record<string, number>; // { "AAPL": 284.15, "MSFT": 490.00, ... }
}

/**
 * Batch fetch previousClose from EOD for multiple symbols (tối ưu performance).
 * 
 * Lấy giá close của record đầu tiên (ngày mới nhất) từ bảng stock_eod_prices.
 * Chỉ cần 1 API call thay vì N calls (N = số lượng symbols).
 * 
 * Source: GET /api/quote/previous-closes?symbols=AAPL,MSFT,GOOGL on the Python market-api-service.
 * Includes retry logic with exponential backoff for resilience.
 */
export async function fetchPreviousClosesBatch(
  symbols: string[]
): Promise<Record<string, number>> {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
  
  return retryWithBackoff(
    async () => {
      const symbolsParam = uniqueSymbols.join(',');
      const url = `${PYTHON_API_URL}/api/quote/previous-closes?symbols=${encodeURIComponent(symbolsParam)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to fetch previousCloses: ${res.status} ${res.statusText} - ${text}`
        );
      }

      const json = (await res.json()) as PreviousClosesApiResponse;
      if (!json.success || !json.previousCloses) {
        throw new Error("Invalid /api/quote/previous-closes response format");
      }

      // Normalize all symbols to UPPERCASE for consistent internal state
      const normalizedPreviousCloses: Record<string, number> = {};
      for (const [symbol, previousClose] of Object.entries(json.previousCloses)) {
        normalizedPreviousCloses[symbol.toUpperCase()] = previousClose;
      }

      return normalizedPreviousCloses;
    },
    {
      maxRetries: 2, // Giảm retries để load nhanh hơn
      initialDelay: 150, // Giảm delay ban đầu
      maxDelay: 1500, // Giảm max delay
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        // eslint-disable-next-line no-console
        console.warn(
          `[fetchPreviousClosesBatch] Retry attempt ${attempt}/2:`,
          error instanceof Error ? error.message : error
        );
      },
    }
  );
}

