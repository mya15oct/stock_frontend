/**
 * Market Service - API Client for Market Data
 *
 * Xử lý fetching data từ backend cho Market Overview
 * Bao gồm: REST API calls + WebSocket connections (commented)
 */

import { apiRequest, PYTHON_API_URL } from "./apiBase";
import type {
  MarketIndex,
  CandleBar,
  HeatmapData,
  MarketStatus,
  CandlestickDataset,
  TimeframeType,
} from "@/types/market";

// Import mock data
import {
  MOCK_DATA,
  generateMockCandles,
  refreshMockData,
} from "@/lib/mockMarketData";

// ==========================================
// REST API ENDPOINTS
// ==========================================

export const marketService = {
  /**
   * Get market indices (SPY, QQQ, DIA, IWM)
   *
   * TODO: Khi backend ready, thay đổi thành:
   * return apiRequest<MarketIndex[]>("/api/market/indices");
   */
  async getIndices(): Promise<MarketIndex[]> {
    // MOCK DATA - Comment lại khi có backend
    refreshMockData();
    return Promise.resolve(MOCK_DATA.indices);

    // PRODUCTION CODE (commented)
    // try {
    //   const response = await fetch(`${PYTHON_API_URL}/api/market/indices`);
    //   if (!response.ok) throw new Error("Failed to fetch indices");
    //   return response.json();
    // } catch (error) {
    //   console.error("Error fetching indices:", error);
    //   throw error;
    // }
  },

  /**
   * Get candlestick bars for a ticker
   *
   * @param ticker - Stock ticker (e.g., "SPY")
   * @param timeframe - Timeframe: "1d" = 1 ngày, "1m" = 1 tháng (month), "3m" = 3 tháng, "6m" = 6 tháng, "1y" = 1 năm
   * @param limit - Number of bars to fetch (optional, auto-determined by timeframe)
   *
   * TODO: Backend endpoint
   * GET /api/market/candles/{ticker}?timeframe=1m&limit=390
   *
   * Query from: market_data_oltp.stock_bars
   * Future: market_data_oltp.stock_bars_staging (khi WebSocket ready)
   */
  async getCandles(
    ticker: string,
    timeframe: TimeframeType = "1m",
    limit?: number
  ): Promise<CandlestickDataset> {
    // MOCK DATA - Comment lại khi có backend
    const mockCandles =
      MOCK_DATA.candles[ticker as keyof typeof MOCK_DATA.candles];

    if (!mockCandles) {
      // Generate on-the-fly nếu không có trong MOCK_DATA
      const basePrice =
        ticker === "SPY"
          ? 467.84
          : ticker === "QQQ"
          ? 387.23
          : ticker === "DIA"
          ? 350.15
          : ticker === "VNINDEX"
          ? 1650
          : 212.56;

      const bars = generateMockCandles(ticker, timeframe, limit, basePrice);

      return Promise.resolve({
        ticker,
        timeframe,
        bars,
        isLive: false,
        lastUpdate: new Date().toISOString(),
      });
    }

    const actualLimit = limit || mockCandles.length;

    return Promise.resolve({
      ticker,
      timeframe,
      bars: mockCandles.slice(-actualLimit), // Last N bars
      isLive: false,
      lastUpdate: new Date().toISOString(),
    });

    // PRODUCTION CODE (commented)
    // try {
    //   const params = new URLSearchParams({
    //     timeframe,
    //     limit: limit.toString(),
    //   });
    //
    //   const response = await fetch(
    //     `${PYTHON_API_URL}/api/market/candles/${ticker}?${params}`
    //   );
    //
    //   if (!response.ok) throw new Error("Failed to fetch candles");
    //   return response.json();
    // } catch (error) {
    //   console.error("Error fetching candles:", error);
    //   throw error;
    // }
  },

  /**
   * Get heatmap data (all stocks grouped by sector)
   *
   * TODO: Backend endpoint
   * GET /api/market/heatmap?sector=all
   *
   * Query tất cả stocks từ database với latest prices
   */
  async getHeatmap(): Promise<HeatmapData> {
    // MOCK DATA - Comment lại khi có backend
    refreshMockData();
    return Promise.resolve(MOCK_DATA.heatmap);

    // PRODUCTION CODE (commented)
    // try {
    //   const response = await fetch(`${PYTHON_API_URL}/api/market/heatmap`);
    //   if (!response.ok) throw new Error("Failed to fetch heatmap");
    //   return response.json();
    // } catch (error) {
    //   console.error("Error fetching heatmap:", error);
    //   throw error;
    // }
  },

  /**
   * Get market status (advancing/declining counts, cash flow)
   *
   * TODO: Backend endpoint
   * GET /api/market/status
   */
  async getMarketStatus(): Promise<MarketStatus> {
    // MOCK DATA - Comment lại khi có backend
    refreshMockData();
    return Promise.resolve(MOCK_DATA.status);

    // PRODUCTION CODE (commented)
    // try {
    //   const response = await fetch(`${PYTHON_API_URL}/api/market/status`);
    //   if (!response.ok) throw new Error("Failed to fetch market status");
    //   return response.json();
    // } catch (error) {
    //   console.error("Error fetching market status:", error);
    //   throw error;
    // }
  },
};

// ==========================================
// WEBSOCKET CONNECTIONS (Future Implementation)
// ==========================================

/**
 * WebSocket Hook for Realtime Candle Updates
 *
 * TODO: Uncomment khi WebSocket backend ready
 *
 * Usage:
 * const { data, isConnected } = useCandleWebSocket("SPY", "1m");
 */
// export class CandleWebSocket {
//   private ws: WebSocket | null = null;
//   private ticker: string;
//   private timeframe: TimeframeType;
//   private onUpdate: (candle: CandleBar) => void;
//
//   constructor(
//     ticker: string,
//     timeframe: TimeframeType,
//     onUpdate: (candle: CandleBar) => void
//   ) {
//     this.ticker = ticker;
//     this.timeframe = timeframe;
//     this.onUpdate = onUpdate;
//   }
//
//   connect() {
//     const wsUrl = `ws://localhost:8000/ws/market/candles/${this.ticker}?timeframe=${this.timeframe}`;
//     this.ws = new WebSocket(wsUrl);
//
//     this.ws.onopen = () => {
//       console.log(`WebSocket connected for ${this.ticker}`);
//     };
//
//     this.ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "candle_update" || data.type === "new_candle") {
//         this.onUpdate(data.data);
//       }
//     };
//
//     this.ws.onerror = (error) => {
//       console.error("WebSocket error:", error);
//     };
//
//     this.ws.onclose = () => {
//       console.log("WebSocket disconnected, reconnecting in 5s...");
//       setTimeout(() => this.connect(), 5000);
//     };
//   }
//
//   disconnect() {
//     this.ws?.close();
//     this.ws = null;
//   }
// }

/**
 * WebSocket for Heatmap Price Updates
 *
 * TODO: Uncomment khi WebSocket backend ready
 *
 * Batch updates mỗi 5 giây để optimize performance
 */
// export class HeatmapWebSocket {
//   private ws: WebSocket | null = null;
//   private onUpdate: (updates: any[]) => void;
//
//   constructor(onUpdate: (updates: any[]) => void) {
//     this.onUpdate = onUpdate;
//   }
//
//   connect() {
//     const wsUrl = `ws://localhost:8000/ws/market/heatmap`;
//     this.ws = new WebSocket(wsUrl);
//
//     this.ws.onopen = () => {
//       console.log("Heatmap WebSocket connected");
//     };
//
//     this.ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "price_update") {
//         this.onUpdate(data.updates);
//       }
//     };
//
//     this.ws.onerror = (error) => {
//       console.error("Heatmap WebSocket error:", error);
//     };
//
//     this.ws.onclose = () => {
//       console.log("Heatmap WebSocket disconnected, reconnecting...");
//       setTimeout(() => this.connect(), 5000);
//     };
//   }
//
//   disconnect() {
//     this.ws?.close();
//     this.ws = null;
//   }
// }

/**
 * WebSocket for Index Updates
 *
 * TODO: Uncomment khi WebSocket backend ready
 */
// export class IndexWebSocket {
//   private ws: WebSocket | null = null;
//   private onUpdate: (index: MarketIndex) => void;
//
//   constructor(onUpdate: (index: MarketIndex) => void) {
//     this.onUpdate = onUpdate;
//   }
//
//   connect() {
//     const wsUrl = `ws://localhost:8000/ws/market/indices`;
//     this.ws = new WebSocket(wsUrl);
//
//     this.ws.onopen = () => {
//       console.log("Index WebSocket connected");
//     };
//
//     this.ws.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       if (data.type === "index_update") {
//         this.onUpdate(data.data);
//       }
//     };
//
//     this.ws.onerror = (error) => {
//       console.error("Index WebSocket error:", error);
//     };
//
//     this.ws.onclose = () => {
//       console.log("Index WebSocket disconnected");
//       setTimeout(() => this.connect(), 5000);
//     };
//   }
//
//   disconnect() {
//     this.ws?.close();
//     this.ws = null;
//   }
// }
