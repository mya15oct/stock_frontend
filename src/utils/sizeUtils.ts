import type { StockHeatmapItem } from "@/types/market";

export interface SizeInputs {
  marketCap?: number | null;
  volume?: number;
  changePercent?: number;
}

/**
 * Compute treemap size for a stock.
 *
 * Volume-driven sizing với normalization để xử lý chênh lệch lớn:
 *  - Volume được normalize bằng square root để giảm chênh lệch quá lớn
 *  - Đảm bảo thẻ nhỏ nhất vẫn có size >= 1
 *  - Volume càng lớn → thẻ càng to (nhưng không quá chênh lệch)
 *
 * Công thức: size = sqrt(volume) * scaleFactor
 * - Giúp các thẻ có volume khác nhau vẫn có thể phân biệt được
 * - Nhưng không làm thẻ lớn nhất quá lớn so với thẻ nhỏ nhất
 */
export function computeSize({
  marketCap,
  volume,
  changePercent,
}: SizeInputs): number {
  // Nếu không có volume, trả về size tối thiểu
  if (!volume || volume <= 0) {
    return 1;
  }

  // Normalize bằng square root để giảm chênh lệch
  // Ví dụ: volume 1,000,000 → sqrt(1,000,000) = 1,000
  //        volume 10,000 → sqrt(10,000) = 100
  // Chênh lệch từ 100x → 10x (dễ nhìn hơn)
  const normalized = Math.sqrt(volume);
  
  // Scale factor để điều chỉnh kích thước tổng thể
  // Có thể điều chỉnh giá trị này để thay đổi độ lớn của thẻ
  const scaleFactor = 0.1; // Giảm xuống để thẻ không quá lớn
  
  let size = normalized * scaleFactor;

  // Đảm bảo size tối thiểu là 1
  if (!Number.isFinite(size) || size <= 0) {
    size = 1;
  }

  // Giới hạn size tối đa để tránh thẻ quá lớn (optional)
  // const MAX_SIZE = 1000;
  // size = Math.min(size, MAX_SIZE);

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






