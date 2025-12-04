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

export type BarPayload = {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
  type: "bar";
};

interface RealtimeContextValue {
  latestBars: Map<string, BarPayload>;
}

const RealtimeContext = createContext<RealtimeContextValue | undefined>(
  undefined
);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [bars, setBars] = useState<Map<string, BarPayload>>(new Map());

  useEffect(() => {
    // Validate bar payload before processing
    const isValidBar = (bar: unknown): bar is BarPayload => {
      if (!bar || typeof bar !== "object") return false;
      const b = bar as Partial<BarPayload>;
      return (
        typeof b.symbol === "string" &&
        typeof b.open === "number" &&
        typeof b.high === "number" &&
        typeof b.low === "number" &&
        typeof b.close === "number" &&
        typeof b.volume === "number" &&
        typeof b.timestamp === "number" &&
        b.type === "bar" &&
        !Number.isNaN(b.open) &&
        !Number.isNaN(b.high) &&
        !Number.isNaN(b.low) &&
        !Number.isNaN(b.close) &&
        !Number.isNaN(b.volume)
      );
    };

    const handler = (bar: BarPayload) => {
      // Skip invalid bar payloads
      if (!isValidBar(bar)) {
        // eslint-disable-next-line no-console
        console.warn("[RealtimeContext] Invalid bar payload received:", bar);
        return;
      }

      setBars((prev) => {
        const next = new Map(prev);
        // Normalize symbol to UPPERCASE for consistent internal state
        const normalizedSymbol = bar.symbol.toUpperCase();
        const normalizedBar: BarPayload = {
          ...bar,
          symbol: normalizedSymbol,
        };
        next.set(normalizedSymbol, normalizedBar);
        return next;
      });
    };

    // Define connection handler at function scope so it's accessible in cleanup
    const onConnect = () => {
      socket.on("bar_update", handler);
    };

    // Re-bind handler on reconnect to ensure it's always active
    const onReconnect = () => {
      // Handler is already bound, but ensure it's still active
      // Socket.IO automatically re-binds listeners on reconnect, but we log it
      // eslint-disable-next-line no-console
      console.log("[RealtimeContext] Socket reconnected, bar_update listener active");
    };

    // Ensure socket is connected before adding listener
    if (socket.connected) {
      socket.on("bar_update", handler);
    } else {
      // If not connected, wait for connection
      socket.on("connect", onConnect);
    }

    // Always set up reconnect handler
    socket.on("reconnect", onReconnect);

    return () => {
      socket.off("bar_update", handler);
      socket.off("connect", onConnect);
      socket.off("reconnect", onReconnect);
    };
  }, []);

  const value = useMemo<RealtimeContextValue>(
    () => ({ latestBars: bars }),
    [bars]
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




