/**
 * Hook to accumulate volume from trade size events
 * 
 * Tích lũy volume từ trade.size trong một rolling window (ví dụ: 1 phút, 5 phút)
 * để tính tổng volume giao dịch và cập nhật kích thước thẻ heatmap
 */

import { useEffect, useRef, useState } from "react";
import { useRealtimeBars } from "./useRealtimeBars";
import type { TradePayload } from "@/contexts/RealtimeContext";

interface TradeWithTimestamp extends TradePayload {
  timestamp: number;
}

interface AccumulatedVolume {
  volume: number; // Tổng volume tích lũy
  tradeCount: number; // Số lượng trades
  lastUpdate: number; // Timestamp của trade cuối cùng
}

/**
 * Rolling window để tích lũy volume (mặc định: 60 giây = 1 phút)
 */
const VOLUME_WINDOW_MS = 60 * 1000; // 1 phút

/**
 * Hook để tích lũy volume từ trade events
 * 
 * @param windowMs - Khoảng thời gian rolling window (mặc định: 60 giây)
 * @returns Map<symbol, AccumulatedVolume>
 */
export function useAccumulatedVolume(windowMs: number = VOLUME_WINDOW_MS) {
  const latestTrades = useRealtimeBars();
  
  // Lưu lịch sử trades với timestamp để tính rolling volume
  const tradeHistoryRef = useRef<Map<string, TradeWithTimestamp[]>>(new Map());
  
  // Kết quả tích lũy volume theo symbol
  const [accumulatedVolumes, setAccumulatedVolumes] = useState<Map<string, AccumulatedVolume>>(
    new Map()
  );

  useEffect(() => {
    const now = Date.now();
    const cutoffTime = now - windowMs;

    // Cập nhật lịch sử trades và tính volume tích lũy
    setAccumulatedVolumes((prev) => {
      const next = new Map(prev);
      const history = tradeHistoryRef.current;

      // Thêm trades mới vào lịch sử
      latestTrades.forEach((trade) => {
        const symbol = trade.symbol.toUpperCase();
        const trades = history.get(symbol) || [];
        
        // Thêm trade mới
        trades.push({
          ...trade,
          timestamp: trade.timestamp || now,
        });

        // Lọc bỏ trades cũ hơn window
        const recentTrades = trades.filter((t) => t.timestamp >= cutoffTime);
        history.set(symbol, recentTrades);

        // Tính tổng volume từ các trades trong window
        const volume = recentTrades.reduce((sum, t) => sum + (t.size || 0), 0);
        const tradeCount = recentTrades.length;
        const lastUpdate = recentTrades.length > 0 
          ? Math.max(...recentTrades.map(t => t.timestamp))
          : now;

        next.set(symbol, {
          volume,
          tradeCount,
          lastUpdate,
        });
      });

      // Xóa các symbols không còn trades trong window
      const activeSymbols = new Set(
        Array.from(history.values())
          .flat()
          .filter((t) => t.timestamp >= cutoffTime)
          .map((t) => t.symbol.toUpperCase())
      );

      // Xóa volumes của symbols không còn active
      for (const [symbol] of next) {
        if (!activeSymbols.has(symbol)) {
          next.delete(symbol);
        }
      }

      return next;
    });
  }, [latestTrades, windowMs]);

  return accumulatedVolumes;
}

