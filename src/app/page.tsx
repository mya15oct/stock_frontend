/**
 * Market Overview Page (Homepage)
 *
 * Dashboard chính hiển thị toàn bộ thị trường
 * Layout: 3-column grid with ratio 1:2:1 (25%:50%:25%)
 * - LEFT (25%): Pie Chart + Money Flow Bar Chart (stacked vertically)
 * - CENTER (50%): Realtime Heatmap (520-600px height)
 * - RIGHT (25%): News Feed (internal scroll only)
 *
 * All sections fit on one screen without scrollbars (except news internal scroll).
 */

"use client";

import React, { useEffect } from "react";
import { useRealtimeHeatmap } from "@/hooks/useRealtimeHeatmap";
import { LeftChartPanel, HeatmapPanel } from "@/components/market";
import FeaturedNewsPanel from "@/components/market/FeaturedNewsPanel";
import type { HeatmapData } from "@/types/market";

export default function HomePage() {
  // ✅ Step 1: Consolidate API Calls - Call useRealtimeHeatmap once at page level
  const heatmapData = useRealtimeHeatmap();

  // No need for complex useEffect. CSS classes are sufficient.

  return (
    // Outer container: Fixed height (viewport - header height), no scroll
    // Assuming header is ~64px (h-16). Adjust if needed.
    <div className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">

      {/* MAIN CONTENT - Fit to viewport */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-6 xl:px-8 pt-3 pb-2 flex flex-col overflow-hidden">

        {/* Desktop: 3-column grid layout */}
        <div className="hidden lg:grid gap-5 h-full w-full overflow-hidden"
          style={{
            gridTemplateColumns: "0.8fr 2.4fr 0.8fr",
            alignItems: "start",
          }}
        >
          {/* LEFT COLUMN: Pie Chart + Money Flow Bar (25%) */}
          <div className="h-full overflow-hidden flex flex-col">
            <LeftChartPanel heatmapData={heatmapData} />
          </div>

          {/* CENTER COLUMN: Heatmap (50%) */}
          <div className="h-full overflow-hidden min-w-0 flex flex-col">
            <HeatmapPanel heatmapData={heatmapData} />
          </div>

          {/* RIGHT COLUMN: News Feed (25%) - Internal scroll ONLY */}
          <div className="h-full overflow-hidden flex flex-col">
            {/* Ensure FeaturedNewsPanel handles its own scrolling (overflow-y-auto) */}
            <FeaturedNewsPanel heatmapData={heatmapData.data} />
          </div>
        </div>

        {/* Mobile: Stack vertically (allows scrolling on mobile only) */}
        <div className="lg:hidden flex flex-col gap-4 h-full overflow-y-auto pb-20">
          <div className="flex-shrink-0">
            <LeftChartPanel heatmapData={heatmapData} />
          </div>
          <div className="flex-shrink-0 min-h-[520px]">
            <HeatmapPanel heatmapData={heatmapData} />
          </div>
          <div className="flex-shrink-0">
            <FeaturedNewsPanel heatmapData={heatmapData.data} />
          </div>
        </div>
      </div>
    </div>
  );
}
