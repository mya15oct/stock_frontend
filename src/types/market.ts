/**
 * Market Data Types
 *
 * Định nghĩa types cho Market Overview Dashboard
 * Bao gồm: Indices, Candlestick bars, Heatmap, Market Status
 */

// ==========================================
// MARKET INDICES (Header Cards)
// ==========================================
export interface MarketIndex {
  code: string; // "SPY", "QQQ", "DIA", "IWM"
  name: string; // "S&P 500 ETF", "NASDAQ-100"
  price: number;
  change: number; // Absolute change
  changePercent: number; // Percentage change
  volume: number;
  high: number; // Day high
  low: number; // Day low
  sparklineData: number[]; // Last 20-50 points for mini chart
  timestamp: string;
}

// ==========================================
// CANDLESTICK DATA
// ==========================================
export interface CandleBar {
  timestamp: number; // Unix timestamp (ms)
  time: string; // ISO string "2024-11-16T09:30:00"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number; // Volume weighted average price
  tradeCount?: number;
}

// IMPORTANT: Timeframe format convention
// - "1d" = 1 ngày (day)
// - "1m" = 1 tháng (month), NOT 1 minute!
// - "3m" = 3 tháng, "6m" = 6 tháng
// - "1y" = 1 năm (year), "3y" = 3 năm, "5y" = 5 năm
// - For intraday: "5m" = 5 phút, "15m" = 15 phút, "30m" = 30 phút, "1h" = 1 giờ
export type TimeframeType = "1m" | "5m" | "15m" | "30m" | "1h" | "1D" | "3m" | "6m" | "1y" | "3y" | "5y";

export interface CandlestickDataset {
  ticker: string;
  timeframe: TimeframeType;
  bars: CandleBar[];

  // WebSocket metadata
  isLive?: boolean;
  lastUpdate?: string;
}

// ==========================================
// HEATMAP DATA (Treemap)
// ==========================================
export interface StockHeatmapItem {
  ticker: string;
  name: string;
  sector: string; // "Technology", "Financials", "Healthcare"
  price: number;
  change: number; // Absolute change
  changePercent: number; // Percentage change
  marketCap: number; // For size calculation
  volume: number;
}

export interface SectorGroup {
  sector: string;
  displayName: string; // "Công nghệ", "Tài chính"
  color: string; // Base color for sector
  stocks: StockHeatmapItem[];
  totalMarketCap: number;
  avgChange: number; // Average % change of sector
}

export interface HeatmapData {
  sectors: SectorGroup[];
  totalStocks: number;
  lastUpdate: string;
}

// ==========================================
// MARKET STATUS (Center Panel)
// ==========================================
export interface MarketStatus {
  // Số lượng mã
  advancing: number; // Mã tăng
  declining: number; // Mã giảm
  unchanged: number; // Không đổi

  // Dòng tiền (Cash Flow)
  cashFlow: {
    advancing: number; // Tỷ VND hoặc $ flowing into advancing
    declining: number; // Tỷ VND hoặc $ flowing into declining
    unchanged: number;
  };

  // Giao dịch nước ngoài (optional)
  foreignTrading?: {
    buy: number; // Khối lượng mua
    sell: number; // Khối lượng bán
    net: number; // Mua - Bán
  };

  timestamp: string;
}

// ==========================================
// FEATURED NEWS (Right Panel)
// ==========================================
export interface FeaturedNews {
  id: string;
  title: string;
  thumbnail: string;
  source: string;
  publishedAt: string; // ISO date string
  category: "market" | "economy" | "stock" | "commodity" | "crypto";
  url?: string;
  // Stock-related fields
  ticker?: string;
  change?: number;
  changePercent?: number;
  // For news with multiple tickers
  ticker2?: string;
  change2?: number;
  changePercent2?: number;
  // Reactions
  reactions?: {
    likes: number;
    dislikes: number;
  };
}

// ==========================================
// TAB TYPES (Market Status Tabs)
// ==========================================
export type MarketStatusTab = "movement" | "index_impact";

export interface TabData {
  label: string;
  value: MarketStatusTab;
  icon?: string;
}

// ==========================================
// WEBSOCKET MESSAGE TYPES
// (For future implementation)
// ==========================================

/**
 * WebSocket message format for realtime candle updates
 *
 * TODO: Uncomment when WebSocket is ready
 */
// export interface WSCandleMessage {
//   type: 'candle_update' | 'new_candle';
//   ticker: string;
//   timeframe: TimeframeType;
//   data: CandleBar;
// }

/**
 * WebSocket message for heatmap price updates
 *
 * TODO: Uncomment when WebSocket is ready
 */
// export interface WSHeatmapMessage {
//   type: 'price_update';
//   updates: Array<{
//     ticker: string;
//     price: number;
//     change: number;
//     changePercent: number;
//   }>;
//   timestamp: string;
// }

/**
 * WebSocket message for index updates
 *
 * TODO: Uncomment when WebSocket is ready
 */
// export interface WSIndexMessage {
//   type: 'index_update';
//   data: MarketIndex;
// }
