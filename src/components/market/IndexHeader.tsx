/**
 * Index Header Component
 *
 * Header hiển thị 4 market indices chính: SPY, QQQ, DIA, IWM
 * TODO: Add WebSocket realtime updates
 */

"use client";

import React, { useEffect, useState } from "react";
import type { MarketIndex } from "@/types/market";
import { marketService } from "@/services/marketService";
import IndexCard from "./IndexCard";

export interface IndexHeaderProps {
  onIndexSelect?: (code: string) => void;
}

export default function IndexHeader({ onIndexSelect }: IndexHeaderProps) {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIndices();

    // Auto-refresh every 10 seconds (fallback khi chưa có WebSocket)
    const interval = setInterval(() => {
      loadIndices();
    }, 10000);

    return () => clearInterval(interval);

    // TODO: Replace with WebSocket subscription
    // const ws = new IndexWebSocket((updatedIndex) => {
    //   setIndices((prev) =>
    //     prev.map((idx) => (idx.code === updatedIndex.code ? updatedIndex : idx))
    //   );
    // });
    // ws.connect();
    // return () => ws.disconnect();
  }, []);

  async function loadIndices() {
    try {
      const data = await marketService.getIndices();
      setIndices(data);
    } catch (error) {
      console.error("Failed to load indices:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-rows-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-rows-4 gap-3">
      {indices.map((index) => (
        <IndexCard
          key={index.code}
          index={index}
          onClick={onIndexSelect ? () => onIndexSelect(index.code) : undefined}
        />
      ))}
    </div>
  );
}
