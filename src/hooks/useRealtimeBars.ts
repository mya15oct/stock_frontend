"use client";

import { useRealtimeContext } from "@/contexts/RealtimeContext";

export function useRealtimeBars() {
  const { latestTrades } = useRealtimeContext();
  return latestTrades;
}






