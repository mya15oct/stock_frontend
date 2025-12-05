"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { socket } from "@/services/realtimeSocket";

export type TradePayload = {
  symbol: string;
  price: number;
  size: number;
  /**
   * Normalized timestamp in milliseconds since epoch.
   * Backend sends ISO strings; we normalize them to number on the client.
   */
  timestamp: number;
  type: "trade";
};

interface RealtimeContextValue {
  latestTrades: Map<string, TradePayload>;
  isConnected: boolean; // WebSocket connection status
  lastTradeTimestamp: number | null; // Timestamp of last received trade
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined
);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Map<string, TradePayload>>(new Map());
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastTradeTimestamp, setLastTradeTimestamp] = useState<number | null>(null);

  useEffect(() => {
    // Validate trade payload before processing
    const isValidTrade = (payload: unknown): payload is TradePayload => {
      if (!payload || typeof payload !== "object") return false;
      const t = payload as any;

      const toNum = (v: unknown): number =>
        typeof v === "number"
          ? v
          : typeof v === "string"
          ? Number(v)
          : NaN;

      const tsRaw: unknown = t.timestamp;
      const ts =
        typeof tsRaw === "string"
          ? Date.parse(tsRaw)
          : typeof tsRaw === "number"
          ? tsRaw
          : NaN;

      const price = toNum(t.price);
      const size = toNum(t.size);

      return (
        typeof t.symbol === "string" &&
        !Number.isNaN(price) &&
        !Number.isNaN(size) &&
        !Number.isNaN(ts)
      );
    };

    const handler = (trade: any) => {
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[RealtimeContext] Received trade_update:", trade);
      }
      
      // Skip invalid trade payloads
      if (!isValidTrade(trade)) {
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn("[RealtimeContext] Invalid trade payload received:", trade);
        }
        return;
      }

      const tradeTimestamp = typeof trade.timestamp === "string"
        ? Date.parse(trade.timestamp)
        : Number(trade.timestamp);
      
      setTrades((prev) => {
        const next = new Map(prev);
        // Normalize symbol to UPPERCASE for consistent internal state
        const normalizedSymbol = trade.symbol.toUpperCase();
        const normalizedTrade: TradePayload = {
          symbol: normalizedSymbol,
          price: Number(trade.price),
          size: Number(trade.size),
          timestamp: tradeTimestamp,
          type: "trade",
        };
        next.set(normalizedSymbol, normalizedTrade);
        // ✅ Step 4: Dev-only logging
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.log("[RealtimeContext] Updated trades map, size:", next.size, "symbol:", normalizedSymbol);
        }
        return next;
      });
      
      // Update last trade timestamp
      setLastTradeTimestamp(tradeTimestamp);
    };

    // Define connection handler at function scope so it's accessible in cleanup
    const onConnect = () => {
      setIsConnected(true);
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[RealtimeContext] Socket connected, binding trade_update handler");
      }
      socket.on("trade_update", handler);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Re-bind handler on reconnect to ensure it's still active
    const onReconnect = () => {
      setIsConnected(true);
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[RealtimeContext] Socket reconnected, re-binding trade_update handler");
      }
      // Re-bind handler để đảm bảo luôn active
      socket.off("trade_update", handler); // Remove old handler trước
      socket.on("trade_update", handler); // Bind lại
    };

    // Set up connection status listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);

    // Ensure socket is connected before adding listener
    if (socket.connected) {
      setIsConnected(true);
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[RealtimeContext] Socket already connected, binding trade_update handler");
      }
      socket.on("trade_update", handler);
    } else {
      setIsConnected(false);
      // ✅ Step 4: Dev-only logging
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log("[RealtimeContext] Socket not connected, waiting for connect event");
      }
    }

    return () => {
      socket.off("trade_update", handler);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
    };
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({ 
      latestTrades: trades,
      isConnected,
      lastTradeTimestamp,
    }),
    [trades, isConnected, lastTradeTimestamp]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeContext(): RealtimeContextValue {
  const ctx = useContext(RealtimeContext);
  if (!ctx) {
    throw new Error(
      "useRealtimeContext must be used within a RealtimeProvider"
    );
  }
  return ctx;
}
