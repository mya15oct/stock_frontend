"use client";

import { useRealtimeContext } from "@/contexts/RealtimeContext";

export function useRealtimeBars() {
  const { latestBars } = useRealtimeContext();
  return latestBars;
}




