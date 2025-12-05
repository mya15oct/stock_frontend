/**
 * Market Overview Page
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

import React from "react";
import { useRealtimeHeatmap } from "@/hooks/useRealtimeHeatmap";
import { LeftChartPanel, HeatmapPanel } from "@/components/market";
import FeaturedNewsPanel from "@/components/market/FeaturedNewsPanel";
import type { HeatmapData } from "@/types/market";

export default function MarketOverviewPage() {
  // ✅ Step 1: Consolidate API Calls - Call useRealtimeHeatmap once at page level
  const heatmapData = useRealtimeHeatmap();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col overflow-hidden">
      {/* ===================================
          MAIN CONTENT - Fit to viewport
          =================================== */}
      <div className="flex-1 w-full max-w-[1920px] mx-auto px-4 lg:px-6 xl:px-8 pt-3 pb-2 flex flex-col overflow-hidden">
        {/* 3 Column Layout: 0.8:2.4:0.8 ratio (~20%:60%:20%) */}
        {/* Grid: 0.8fr 2.4fr 0.8fr with 20px gap, fits viewport height */}
        {/* Mobile: stack vertically, Desktop: 3 columns */}
        <div 
          className="flex-1 grid gap-5 overflow-hidden"
          style={{
            gridTemplateColumns: "1fr",
          }}
        >
          {/* Desktop: 3-column grid layout */}
          <div 
            className="hidden lg:grid gap-5 h-full overflow-hidden"
            style={{
              gridTemplateColumns: "0.8fr 2.4fr 0.8fr",
              height: "calc(100vh - 120px)",
              alignItems: "start",
            }}
          >
            {/* LEFT COLUMN: Pie Chart + Money Flow Bar (25%) */}
            <div className="h-full overflow-hidden">
              <LeftChartPanel heatmapData={heatmapData} />
            </div>

            {/* CENTER COLUMN: Heatmap (50%) */}
            <div className="h-full overflow-hidden min-w-0">
              <HeatmapPanel heatmapData={heatmapData} />
            </div>

            {/* RIGHT COLUMN: News Feed (25%) - Internal scroll only */}
            <div className="h-full overflow-hidden">
              <FeaturedNewsPanel />
            </div>
          </div>

          {/* Mobile: Stack vertically */}
          <div className="lg:hidden flex flex-col gap-4 h-full overflow-y-auto">
            <div className="flex-shrink-0">
              <LeftChartPanel heatmapData={heatmapData} />
            </div>
            <div className="flex-shrink-0 min-h-[520px]">
              <HeatmapPanel heatmapData={heatmapData} />
            </div>
            <div className="flex-shrink-0">
              <FeaturedNewsPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


