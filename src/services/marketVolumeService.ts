import { PYTHON_API_URL } from "./apiBase";
import { retryWithBackoff } from "@/utils/retry";

interface VolumesApiResponse {
  success: boolean;
  volumes: Record<string, number>; // { "AAPL": 12345.0, "MSFT": 67890.0, ... }
}

/**
 * Fetch accumulated volumes from DB for multiple symbols (batch query, optimized with Redis cache).
 * 
 * Volume được lấy từ cột `volume` trong `stock_trades_realtime` (đã được cộng dồn).
 * Volume càng to → ticker càng lớn trong heatmap.
 * 
 * Source: GET /api/market/volumes?symbols=AAPL,MSFT,GOOGL on the Python market-api-service.
 * Includes retry logic with exponential backoff for resilience.
 */
export async function fetchAccumulatedVolumes(
  symbols: string[]
): Promise<Record<string, number>> {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase())));
  
  return retryWithBackoff(
    async () => {
      const symbolsParam = uniqueSymbols.join(',');
      const url = `${PYTHON_API_URL}/api/market/volumes?symbols=${encodeURIComponent(symbolsParam)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(
          `Failed to fetch volumes: ${res.status} ${res.statusText} - ${text}`
        );
      }

      const json = (await res.json()) as VolumesApiResponse;
      if (!json.success || !json.volumes) {
        throw new Error("Invalid /api/market/volumes response format");
      }

      // Normalize all symbols to UPPERCASE for consistent internal state
      const normalizedVolumes: Record<string, number> = {};
      for (const [symbol, volume] of Object.entries(json.volumes)) {
        normalizedVolumes[symbol.toUpperCase()] = volume;
      }

      return normalizedVolumes;
    },
    {
      maxRetries: 3,
      initialDelay: 200,
      maxDelay: 2000,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        // eslint-disable-next-line no-console
        console.warn(
          `[fetchAccumulatedVolumes] Retry attempt ${attempt}/3:`,
          error instanceof Error ? error.message : error
        );
      },
    }
  );
}


