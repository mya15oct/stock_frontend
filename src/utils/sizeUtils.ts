import type { StockHeatmapItem } from "@/types/market";

export interface SizeInputs {
  marketCap?: number | null;
  volume?: number;
  changePercent?: number;
}

/**
 * Compute treemap size for a stock.
 *
 * Primary rule:
 *  - If marketCap is provided and > 0 → size = marketCap
 *
 * Fallback rule:
 *  - size = volume if volume > 0
 *  - else size = |changePercent| * 100
 *  - Always clamp size >= 1
 */
export function computeSize({
  marketCap,
  volume,
  changePercent,
}: SizeInputs): number {
  if (typeof marketCap === "number" && marketCap > 0) {
    return Math.max(marketCap, 1);
  }

  let size =
    volume && volume > 0
      ? volume
      : Math.abs(changePercent ?? 0) * 100;

  if (!Number.isFinite(size) || size <= 0) {
    size = 1;
  }

  return size;
}

export function ensureStockSize(stock: StockHeatmapItem): StockHeatmapItem {
  const size = computeSize({
    marketCap: stock.marketCap,
    volume: stock.volume,
    changePercent: stock.changePercent,
  });

  return {
    ...stock,
    size,
  };
}




