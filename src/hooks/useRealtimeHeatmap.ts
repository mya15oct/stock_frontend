"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import type { HeatmapData, SectorGroup, StockHeatmapItem } from "@/types/market";
import { useRealtimeContext } from "@/contexts/RealtimeContext";
import { fetchMarketStocks } from "@/services/marketMetadataService";
import { fetchPreviousClosesBatch } from "@/services/marketPreviousCloseService";
import { fetchAccumulatedVolumes } from "@/services/marketVolumeService";
import { computeSize, ensureStockSize } from "@/utils/sizeUtils";
import { retryWithBackoff } from "@/utils/retry";

interface UseRealtimeHeatmapResult {
  data: HeatmapData | null;
  isLoading: boolean;
  error: string | null;
}

export function useRealtimeHeatmap(): UseRealtimeHeatmapResult {
  const [data, setData] = useState<HeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbVolumes, setDbVolumes] = useState<Record<string, number>>({}); // Volumes from DB API
  const { latestTrades, isConnected, lastTradeTimestamp } = useRealtimeContext();
  const lastApplyRef = useRef(0);
  const lastVolumeFetchRef = useRef(0);
  const hasReceivedRealtimeDataRef = useRef(false); // Track if we've ever received realtime data
  const initialLoadTimeRef = useRef<number | null>(null); // Track when initial load completed
  // Lưu baseline price (price đầu tiên) cho mỗi stock để tính changePercent
  const baselinePricesRef = useRef<Map<string, number>>(new Map());
  
  // ✅ Step 6: Optimize Re-renders - Memoize expensive calculations
  // Kiểm tra xem có realtime data không (WS connected và có trade trong 30 giây)
  const hasActiveRealtimeData = useMemo(() => {
    const result = (() => {
      if (!isConnected) {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log("[useRealtimeHeatmap] hasActiveRealtimeData: false (not connected)");
        }
        return false;
      }
      if (latestTrades.size === 0) {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log("[useRealtimeHeatmap] hasActiveRealtimeData: false (no trades)");
        }
        return false;
      }
      if (!lastTradeTimestamp) {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log("[useRealtimeHeatmap] hasActiveRealtimeData: false (no timestamp)");
        }
        return false;
      }
      
      const timeSinceLastTrade = Date.now() - lastTradeTimestamp;
      const REALTIME_TIMEOUT_MS = 30 * 1000; // 30 giây
      const isActive = timeSinceLastTrade < REALTIME_TIMEOUT_MS;
      
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[useRealtimeHeatmap] hasActiveRealtimeData:", isActive, "timeSinceLastTrade:", timeSinceLastTrade, "ms");
      }
      return isActive;
    })();
    return result;
  }, [isConnected, latestTrades.size, lastTradeTimestamp]);
  
  // ✅ Step 2: Optimize Volume Polling - Debounce and increase interval to 5s, only poll when WebSocket connected
  useEffect(() => {
    if (!data) return; // Wait for initial data load
    if (!isConnected) return; // Only poll when WebSocket is connected
    
    const symbols = data.sectors.flatMap((s) => s.stocks.map((stock) => stock.ticker));
    if (symbols.length === 0) return;
    
    const now = Date.now();
    const VOLUME_POLL_INTERVAL_MS = 5000; // ✅ Increased from 2s to 5s to reduce network requests
    
    // Throttle: don't fetch too frequently
    if (now - lastVolumeFetchRef.current < VOLUME_POLL_INTERVAL_MS) {
      return;
    }
    
    lastVolumeFetchRef.current = now;
    
    // Fetch volumes from DB API
    fetchAccumulatedVolumes(symbols)
      .then((volumes) => {
        setDbVolumes(volumes);
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log("[useRealtimeHeatmap] ✅ Fetched volumes from DB:", Object.keys(volumes).length, "symbols");
        }
      })
      .catch((err) => {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn("[useRealtimeHeatmap] Failed to fetch volumes from DB:", err);
        }
        // Don't set error state, just log - volumes will fall back to snapshot volume
      });
    
    // Set up polling interval
    const interval = setInterval(() => {
      // ✅ Only poll if WebSocket is still connected
      if (!isConnected) return;
      
      fetchAccumulatedVolumes(symbols)
        .then((volumes) => {
          setDbVolumes(volumes);
        })
        .catch((err) => {
          // ✅ Step 4: Dev-only logging
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn("[useRealtimeHeatmap] Failed to fetch volumes from DB (polling):", err);
          }
        });
    }, VOLUME_POLL_INTERVAL_MS);
    
    return () => {
      clearInterval(interval);
    };
  }, [data, isConnected]); // ✅ Added isConnected dependency

  // Load stock metadata và previousClose từ EOD để tính changePercent đúng
  // Tối ưu: Load metadata trước, set isLoading = false sớm, load previousClose trong background
  useEffect(() => {
    let isMounted = true;

    async function loadMetadata() {
      try {
        setError(null);
        // Load metadata (symbols, names, sectors) - giảm retries cho initial load nhanh hơn
        const stocks = await retryWithBackoff(
          async () => {
            return await fetchMarketStocks();
          },
          {
            maxRetries: 2, // Giảm từ 5 xuống 2 để load nhanh hơn
            initialDelay: 200, // Giảm delay ban đầu
            maxDelay: 2000, // Giảm max delay
            backoffMultiplier: 2,
            onRetry: (attempt) => {
              // eslint-disable-next-line no-console
              console.warn(
                `[useRealtimeHeatmap] Retry attempt ${attempt}/2 for fetchMarketStocks`
              );
            },
          }
        );

        if (!isMounted) return;

        // Tạo structure ngay với metadata (không cần chờ previousClose)
        // previousClose sẽ được load trong background và update sau
        const sectorsMap = new Map<string, StockHeatmapItem[]>();
        stocks.forEach((meta) => {
          const sectorKey = meta.sector || "Unknown";
          const existing = sectorsMap.get(sectorKey) ?? [];
          const normalizedSymbol = meta.symbol.toUpperCase();

          const marketCap =
            typeof meta.marketCap === "number" ? meta.marketCap : undefined;

          // Tạo item với previousClose = undefined tạm thời (sẽ update sau)
          const item: StockHeatmapItem = {
            ticker: normalizedSymbol,
            name: meta.name || normalizedSymbol,
            sector: sectorKey,
            price: 0, // Sẽ được update từ realtime
            change: 0,
            changePercent: 0,
            volume: 0, // Sẽ được update từ DB API
            previousClose: undefined, // Sẽ được update sau khi fetch xong
            size: 1, // Minimum size, sẽ được update khi có volume
            marketCap,
          };

          existing.push(ensureStockSize(item));
          sectorsMap.set(sectorKey, existing);
        });

        const sectors: SectorGroup[] = Array.from(sectorsMap.entries()).map(
          ([sectorKey, sectorStocks]) => {
            const totalSize = sectorStocks.reduce(
              (sum, s) => sum + (s.size ?? 0),
              0
            );

            return {
              sector: sectorKey,
              displayName: sectorKey,
              color: "#3b82f6",
              stocks: sectorStocks,
              totalMarketCap: totalSize,
              avgChange: 0,
            };
          }
        );

        const base: HeatmapData = {
          sectors,
          totalStocks: stocks.length,
          lastUpdate: new Date().toISOString(),
        };

        // Set data ngay để hiển thị skeleton/empty state, không cần chờ previousClose
        setData(base);
        setError(null);
        setIsLoading(false); // Set loading = false sớm để UI hiển thị ngay

        // Fetch previousClose trong background và update sau (không block UI)
        const symbols = stocks.map((s) => s.symbol);
        fetchPreviousClosesBatch(symbols)
          .then((previousCloses) => {
            if (!isMounted) return;
            // ✅ Step 4: Dev-only logging
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.log(
                `[useRealtimeHeatmap] ✅ Fetched previousClose from EOD (batch) for ${Object.keys(previousCloses).length} symbols`
              );
            }
            // Update previousClose cho từng stock
            setData((prev) => {
              if (!prev) return prev;
              const updatedSectors = prev.sectors.map((sector) => ({
                ...sector,
                stocks: sector.stocks.map((stock) => ({
                  ...stock,
                  previousClose: previousCloses[stock.ticker],
                })),
              }));
              return {
                ...prev,
                sectors: updatedSectors,
              };
            });
          })
          .catch((err) => {
            // ✅ Step 4: Dev-only logging
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.warn(
                "[useRealtimeHeatmap] Failed to fetch previousClose from EOD, will use first trade price as baseline",
                err
              );
            }
            // Không set error, chỉ log warning - UI vẫn hoạt động bình thường
          });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load stock metadata";
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.error("[useRealtimeHeatmap] Failed to load metadata:", error);
        }
        if (isMounted) {
          setError(errorMessage);
          setData({
            sectors: [],
            totalStocks: 0,
            lastUpdate: new Date().toISOString(),
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMetadata();
  }, []);

  // Chỉ update từ realtime data (không dùng EOD)
  // Chỉ hiển thị khi có WebSocket connection và có trades
  useEffect(() => {
    // Nếu không có data structure → không cập nhật
    if (!data) {
      return;
    }
    
    // Nếu không connected hoặc không có trades → không hiển thị data
    if (!isConnected || latestTrades.size === 0) {
      // Giữ structure nhưng không update (sẽ hiển thị loading hoặc empty)
      return;
    }

    const now = Date.now();
    
    // Tăng throttle để giảm số lượng updates và tránh giật giật
    const isFirstUpdate = !hasReceivedRealtimeDataRef.current;
    const throttleMs = isFirstUpdate ? 1000 : 5000; // 1s cho lần đầu, 5s cho các lần sau
    
    // Đánh dấu đã nhận realtime data (sau khi check isFirstUpdate)
    hasReceivedRealtimeDataRef.current = true;
    
    // Throttle: không update quá thường xuyên
    if (now - lastApplyRef.current < throttleMs) {
      return;
    }
    
    lastApplyRef.current = now;

    // Tạo Map để lookup trades nhanh hơn
    const tradesMap = new Map<string, typeof latestTrades extends Map<string, infer V> ? V : never>();
    latestTrades.forEach((trade, symbol) => {
      if (
        trade &&
        typeof trade.symbol === "string" &&
        typeof trade.price === "number" &&
        !Number.isNaN(trade.price)
      ) {
        tradesMap.set(symbol.toUpperCase(), trade);
      }
    });

    // Tạo object mới hoàn toàn với updates được apply trực tiếp (KHÔNG merge phức tạp)
    setData((prev) => {
      if (!prev) return prev;

      // Tạo sectors mới với stocks được update
      const updatedSectors: SectorGroup[] = prev.sectors.map((sector) => {
        const updatedStocks: StockHeatmapItem[] = sector.stocks.map((stock) => {
          const symbol = stock.ticker.toUpperCase();
          const trade = tradesMap.get(symbol);

          // LUÔN cập nhật volume từ DB API (volume tích lũy từ stock_trades_realtime)
          // Ưu tiên: DB volume > snapshot volume
          const dbVolume = dbVolumes[symbol] ?? 0;
          const safeVolume = dbVolume > 0 ? dbVolume : stock.volume ?? 0;

          // Nếu không có trade update → chỉ update volume và size
          if (!trade) {
            const size = computeSize({
              marketCap: stock.marketCap,
              volume: safeVolume,
              changePercent: stock.changePercent ?? 0,
            });

            return {
              ...stock,
              volume: safeVolume,
              size,
            };
          }

          // Có trade update → tính toán giá trị mới (price, change, changePercent, volume, size)
          const price = trade.price;
          
          // Tính change và changePercent so với previousClose từ EOD (ngày hôm trước)
          // previousClose được lấy từ bảng stock_eod_prices (OFFSET 1 LIMIT 1)
          let baseline: number;
          if (typeof stock.previousClose === "number" && stock.previousClose > 0) {
            // Ưu tiên: dùng previousClose từ EOD (ngày hôm trước)
            baseline = stock.previousClose;
          } else {
            // Fallback: dùng price đầu tiên nhận được làm baseline (nếu không có EOD data)
            let firstPrice = baselinePricesRef.current.get(symbol);
            if (!firstPrice || firstPrice <= 0) {
              // Lưu price đầu tiên làm baseline
              firstPrice = price;
              baselinePricesRef.current.set(symbol, firstPrice);
            }
            baseline = firstPrice;
          }
          
          // Tính change = giá hiện tại - giá close ngày hôm trước
          const change = price - baseline;
          // Tính changePercent = (change / previousClose) * 100
          const changePercent = baseline > 0 ? (change / baseline) * 100 : 0;

          const safePrice = Number.isFinite(price) && price > 0 ? price : stock.price ?? 0;
          const safeChange = Number.isFinite(change) ? change : stock.change ?? 0;
          const safeChangePercent = Number.isFinite(changePercent)
            ? changePercent
            : stock.changePercent ?? 0;

          const size = computeSize({
            marketCap: stock.marketCap,
            volume: safeVolume,
            changePercent: safeChangePercent,
          });

          // Trả về stock mới với giá trị đã update
          return {
            ...stock,
            price: safePrice,
            change: safeChange,
            changePercent: safeChangePercent,
            volume: safeVolume,
            size,
          };
        });

        // Sắp xếp lại stocks theo volume (descending) sau khi update
        const sortedStocks = [...updatedStocks].sort((a, b) => {
          const volA = a.volume ?? 0;
          const volB = b.volume ?? 0;
          return volB - volA; // Descending: lớn nhất trước
        });

        // Tính lại avgChange cho sector
        const stocksWithValidChange = sortedStocks.filter(
          (s) =>
            typeof s.changePercent === "number" &&
            !Number.isNaN(s.changePercent) &&
            Number.isFinite(s.changePercent)
        );
        const avgChange =
          stocksWithValidChange.length > 0
            ? stocksWithValidChange.reduce((sum, s) => sum + (s.changePercent ?? 0), 0) /
              stocksWithValidChange.length
            : sector.avgChange ?? 0;

        return {
          ...sector,
          stocks: sortedStocks, // Đã sắp xếp theo volume
          avgChange: Number.isFinite(avgChange) ? Number(avgChange.toFixed(2)) : sector.avgChange ?? 0,
        };
      });

      // Tạo HeatmapData mới hoàn toàn (luôn tạo mới để trigger re-render)
      // Sử dụng requestAnimationFrame để sync với browser repaint cycle
      const newData: HeatmapData = {
        sectors: updatedSectors,
        totalStocks: updatedSectors.reduce((sum, s) => sum + s.stocks.length, 0),
        lastUpdate: new Date().toISOString(),
      };

      // Giảm logging để tăng performance
      // eslint-disable-next-line no-console
      // console.log("[useRealtimeHeatmap] ✅ Created new heatmap data with", tradesMap.size, "trade updates");

      return newData;
    });
  }, [data, latestTrades, dbVolumes, isConnected]);

  return { data, isLoading, error };
}

// `ensureStockSize` is now imported from utils/sizeUtils


