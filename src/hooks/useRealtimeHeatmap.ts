"use client";

import { useEffect, useState } from "react";
import type { HeatmapData, SectorGroup, StockHeatmapItem } from "@/types/market";
import { useRealtimeBars } from "@/hooks/useRealtimeBars";
import { fetchMarketStocks } from "@/services/marketMetadataService";
import {
  fetchMarketSnapshots,
  type MarketSnapshot,
} from "@/services/marketSnapshotService";
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
  const latestBars = useRealtimeBars();

  // Initial and periodic load (REST or mock) with retry logic
  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setError(null);
        // Retry with exponential backoff
        const stocks = await retryWithBackoff(
          async () => {
            return await fetchMarketStocks();
          },
          {
            maxRetries: 5,
            initialDelay: 300,
            maxDelay: 3000,
            backoffMultiplier: 2,
            onRetry: (attempt) => {
              // eslint-disable-next-line no-console
              console.warn(
                `[useRealtimeHeatmap] Retry attempt ${attempt}/5 for fetchMarketStocks`
              );
            },
          }
        );

        if (!isMounted) return;

        // Best-effort snapshot fetch; failures fall back to zeroed numeric fields.
        let snapshots: Record<string, MarketSnapshot> = {};
        try {
          const symbols = stocks.map((s) => s.symbol);
          snapshots = await fetchMarketSnapshots(symbols);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            "[useRealtimeHeatmap] Failed to fetch market snapshots, falling back to zeros",
            err
          );
          // Continue with empty snapshots - not a fatal error
        }

        const sectorsMap = new Map<string, StockHeatmapItem[]>();

        stocks.forEach((meta) => {
          const sectorKey = meta.sector || "Unknown";
          const existing = sectorsMap.get(sectorKey) ?? [];

          // Normalize symbol to UPPERCASE for consistent internal state
          // (meta.symbol is already normalized from fetchMarketStocks, but ensure it here too)
          const normalizedSymbol = meta.symbol.toUpperCase();
          const snap = snapshots[normalizedSymbol];
          const price = snap?.price ?? 0;
          const change = snap?.change ?? 0;
          const changePercent = snap?.changePercent ?? 0;
          const volume = snap?.volume ?? 0;

          const marketCap =
            typeof meta.marketCap === "number" ? meta.marketCap : undefined;

          const item: StockHeatmapItem = {
            ticker: normalizedSymbol, // Store as UPPERCASE
            // Use full name for tooltip, fallback to symbol
            name: meta.name || normalizedSymbol,
            sector: sectorKey,
            price,
            change,
            changePercent,
            volume,
            size: computeSize({
              marketCap,
              volume,
              changePercent,
            }),
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
              color: "#3b82f6", // not used by HeatmapChart, kept for compatibility
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

        setData(base);
        setError(null);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load heatmap data";
        // eslint-disable-next-line no-console
        console.error("[useRealtimeHeatmap] Failed to load heatmap:", error);
        if (isMounted) {
          setError(errorMessage);
          // Set empty data structure to prevent UI from showing loading forever
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

    void load();

    // Fallback auto-refresh every 10 seconds (only if there was an error)
    const interval = setInterval(() => {
      // Only retry if we have an error or no data
      if (error || !data) {
        void load();
      }
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Merge latest realtime bar updates into HeatmapData with safety guards
  useEffect(() => {
    if (latestBars.size === 0) return;

    setData((prev) => {
      if (!prev) return prev;

      let next: HeatmapData = prev;
      let hasUpdates = false;

      latestBars.forEach((bar) => {
        // Safety guard: Skip invalid bar payloads
        if (
          !bar ||
          typeof bar.symbol !== "string" ||
          typeof bar.open !== "number" ||
          typeof bar.close !== "number" ||
          typeof bar.volume !== "number" ||
          Number.isNaN(bar.open) ||
          Number.isNaN(bar.close) ||
          Number.isNaN(bar.volume) ||
          bar.open <= 0 // Prevent division by zero
        ) {
          // eslint-disable-next-line no-console
          console.warn("[useRealtimeHeatmap] Skipping invalid bar payload:", bar);
          return;
        }

        next = {
          ...next,
          sectors: next.sectors.map((sector) => {
            const updatedStocks = sector.stocks.map((stock) => {
              // Normalize both sides for case-insensitive comparison
              // (bar.symbol is already normalized in RealtimeContext, but ensure it here)
              if (stock.ticker.toUpperCase() !== bar.symbol.toUpperCase()) return stock;

              hasUpdates = true;
              const price = bar.close;
              const change = price - bar.open;

              // Safety guard: Prevent division by zero when computing changePercent
              const changePercent =
                bar.open > 0 ? (change / bar.open) * 100 : stock.changePercent ?? 0;

              // Safety guard: Ensure valid numeric values
              const safePrice = Number.isFinite(price) ? price : stock.price ?? 0;
              const safeChange = Number.isFinite(change) ? change : stock.change ?? 0;
              const safeChangePercent = Number.isFinite(changePercent)
                ? changePercent
                : stock.changePercent ?? 0;
              const safeVolume = Number.isFinite(bar.volume) ? bar.volume : stock.volume ?? 0;

              const size = computeSize({
                marketCap: stock.marketCap,
                volume: safeVolume,
                changePercent: safeChangePercent,
              });

              return {
                ...stock,
                price: safePrice,
                change: safeChange,
                changePercent: safeChangePercent,
                volume: safeVolume,
                size,
              };
            });

            // Safety guard: Ensure sector arrays remain stable even if some symbols fail
            // Filter out any invalid stocks that might have been created
            const validStocks = updatedStocks.filter(
              (s) =>
                s &&
                typeof s.ticker === "string" &&
                typeof s.price === "number" &&
                !Number.isNaN(s.price)
            );

            // Recompute sector avgChange based on updated stock changePercent
            const stocksWithValidChange = validStocks.filter(
              (s) =>
                typeof s.changePercent === "number" &&
                !Number.isNaN(s.changePercent) &&
                Number.isFinite(s.changePercent)
            );

            // Safety guard: Prevent division by zero when computing avgChange
            const avgChange =
              stocksWithValidChange.length > 0
                ? stocksWithValidChange.reduce(
                    (sum, s) => sum + (s.changePercent ?? 0),
                    0
                  ) / stocksWithValidChange.length
                : sector.avgChange ?? 0; // Fallback to previous value

            return {
              ...sector,
              stocks: validStocks, // Use filtered valid stocks
              avgChange: Number.isFinite(avgChange)
                ? Number(avgChange.toFixed(2))
                : sector.avgChange ?? 0,
            };
          }),
          totalStocks: next.sectors.reduce(
            (sum, s) => sum + s.stocks.length,
            0
          ),
          lastUpdate: hasUpdates ? new Date().toISOString() : next.lastUpdate,
        };
      });

      // Only update if we actually made changes
      return hasUpdates ? next : prev;
    });
  }, [latestBars]);

  return { data, isLoading, error };
}

// `ensureStockSize` is now imported from utils/sizeUtils


