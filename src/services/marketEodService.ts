/**
 * Market EOD Service
 * Fetch latest End-of-Day data when market is closed
 */

import { PYTHON_API_URL } from "./apiBase";

export interface LatestEodData {
  price: number;
  volume: number;
  changePercent: number;
  previousClose: number;
}

export interface LatestEodBatchResponse {
  success: boolean;
  data: Record<string, LatestEodData>;
}

/**
 * Fetch latest EOD data for multiple symbols (batch)
 * Used when market is closed to display data from the last trading session
 */
export async function fetchLatestEodBatch(
  symbols: string[]
): Promise<Record<string, LatestEodData>> {
  if (!symbols || symbols.length === 0) {
    return {};
  }

  const symbolsParam = symbols.join(",");
  const url = `${PYTHON_API_URL}/api/quote/latest-eod?symbols=${symbolsParam}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest EOD data: ${response.statusText}`);
    }

    const result: LatestEodBatchResponse = await response.json();
    if (!result.success || !result.data) {
      throw new Error("Invalid response format");
    }

    return result.data;
  } catch (error) {
    throw error;
  }
}

