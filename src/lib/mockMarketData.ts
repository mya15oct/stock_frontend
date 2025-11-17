/**
 * Mock Market Data Generators
 *
 * Tạo mock data cho Market Overview Dashboard
 * TODO: Remove khi WebSocket integration hoàn thiện
 */

import type {
  MarketIndex,
  CandleBar,
  HeatmapData,
  MarketStatus,
  StockHeatmapItem,
  SectorGroup,
  TimeframeType,
  FeaturedNews,
} from "@/types/market";

// ==========================================
// MOCK MARKET INDICES
// ==========================================

const US_INDICES = [
  { code: "SPY", name: "S&P 500 ETF", basePrice: 467.84 },
  { code: "QQQ", name: "NASDAQ-100", basePrice: 387.23 },
  { code: "DIA", name: "Dow Jones", basePrice: 350.15 },
  { code: "IWM", name: "Russell 2000", basePrice: 212.56 },
];

export function generateMockIndices(): MarketIndex[] {
  return US_INDICES.map((index) => {
    const changePercent = (Math.random() - 0.45) * 2; // -0.9% to 1.1%
    const change = index.basePrice * (changePercent / 100);
    const price = index.basePrice + change;

    return {
      code: index.code,
      name: index.name,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 50000000) + 30000000,
      high: Number((price * 1.005).toFixed(2)),
      low: Number((price * 0.995).toFixed(2)),
      sparklineData: generateSparkline(price, changePercent, 50),
      timestamp: new Date().toISOString(),
    };
  });
}

function generateSparkline(
  currentPrice: number,
  changePercent: number,
  points: number
): number[] {
  const data: number[] = [];
  const startPrice = currentPrice * (1 - changePercent / 100);
  const priceRange = currentPrice - startPrice;

  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    // Thêm random noise để realistic
    const noise = (Math.random() - 0.5) * priceRange * 0.1;
    const price = startPrice + priceRange * progress + noise;
    data.push(Number(price.toFixed(2)));
  }

  return data;
}

// ==========================================
// MOCK CANDLESTICK BARS
// ==========================================

export function generateMockCandles(
  ticker: string,
  timeframe: TimeframeType,
  count: number = getDefaultCandleCount(timeframe),
  basePrice: number = 1650 // VNINDEX base price
): CandleBar[] {
  const candles: CandleBar[] = [];
  const now = new Date();

  // Tính interval dựa trên timeframe
  const intervalMs = getIntervalMs(timeframe);

  let currentPrice = basePrice;

  for (let i = count - 1; i >= 0; i--) {
    const timestamp = now.getTime() - i * intervalMs;
    const time = new Date(timestamp).toISOString();

    // Generate OHLC with realistic movements
    const volatility = basePrice * 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility * 2;

    const open = currentPrice;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;

    const volume = Math.floor(Math.random() * 1000000) + 100000;
    const vwap = (open + high + low + close) / 4;

    candles.push({
      timestamp,
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume,
      vwap: Number(vwap.toFixed(2)),
      tradeCount: Math.floor(Math.random() * 500) + 50,
    });

    currentPrice = close; // Next candle starts where this one closed
  }

  return candles;
}

function getIntervalMs(timeframe: TimeframeType): number {
  // NOTE: Timeframe format:
  // - "1d" = 1 ngày (day)
  // - "1m" = 1 tháng (month), NOT 1 minute
  // - "3m" = 3 tháng, "6m" = 6 tháng
  // - "1y" = 1 năm (year)
  const intervals: Record<TimeframeType, number> = {
    "1m": 24 * 60 * 60 * 1000, // Daily candles for 1 MONTH view
    "5m": 5 * 60 * 1000, // 5 minute candles (for intraday)
    "15m": 15 * 60 * 1000, // 15 minute candles (for intraday)
    "30m": 30 * 60 * 1000, // 30 minute candles (for intraday)
    "1h": 60 * 60 * 1000, // 1 hour candles (for intraday)
    "1D": 60 * 60 * 1000, // 1 hour candles for 1 DAY view
    "3m": 24 * 60 * 60 * 1000, // Daily candles for 3 MONTHS view
    "6m": 24 * 60 * 60 * 1000, // Daily candles for 6 MONTHS view
    "1y": 24 * 60 * 60 * 1000, // Daily candles for 1 YEAR view
    "3y": 7 * 24 * 60 * 60 * 1000, // Weekly candles for 3 YEARS view
    "5y": 7 * 24 * 60 * 60 * 1000, // Weekly candles for 5 YEARS view
  };
  return intervals[timeframe];
}

function getDefaultCandleCount(timeframe: TimeframeType): number {
  // NOTE: Timeframe format:
  // - "1d" = 1 ngày, "1m" = 1 tháng (month), "1y" = 1 năm
  const counts: Record<TimeframeType, number> = {
    "1m": 30, // 30 daily candles = 1 MONTH
    "5m": 78, // 6.5 hours of trading (5-minute candles)
    "15m": 26, // 6.5 hours (15-minute candles)
    "30m": 13, // 6.5 hours (30-minute candles)
    "1h": 24, // 24 hours (1-hour candles)
    "1D": 24, // 24 x 1-hour candles = 1 DAY
    "3m": 90, // 90 daily candles = 3 MONTHS
    "6m": 180, // 180 daily candles = 6 MONTHS
    "1y": 252, // 252 daily candles = 1 YEAR (trading days)
    "3y": 156, // 156 weekly candles = 3 YEARS
    "5y": 260, // 260 weekly candles = 5 YEARS
  };
  return counts[timeframe];
}

// ==========================================
// MOCK HEATMAP DATA
// ==========================================

const VN_SECTORS = [
  { sector: "Financials", displayName: "Tài chính", color: "#10b981" },
  { sector: "RealEstate", displayName: "Bất động sản", color: "#f97316" },
  { sector: "Industrials", displayName: "Công nghiệp", color: "#ec4899" },
  { sector: "Materials", displayName: "Vật liệu cơ bản", color: "#14b8a6" },
  { sector: "ConsumerGoods", displayName: "Hàng tiêu dùng", color: "#f59e0b" },
  { sector: "Energy", displayName: "Năng lượng", color: "#8b5cf6" },
  { sector: "Utilities", displayName: "Các dịch vụ hạ tầng", color: "#6366f1" },
  { sector: "Technology", displayName: "Công nghệ", color: "#3b82f6" },
];

const SAMPLE_STOCKS = [
  // Financials - Tài chính (Top 10 stocks)
  { ticker: "SHB", name: "NH SHB", sector: "Financials", basePrice: 12.5, marketCap: 800 },
  { ticker: "VPB", name: "VPBank", sector: "Financials", basePrice: 23.8, marketCap: 750 },
  { ticker: "VCI", name: "CTCK VCI", sector: "Financials", basePrice: 34.2, marketCap: 650 },
  { ticker: "STB", name: "Sacombank", sector: "Financials", basePrice: 28.5, marketCap: 620 },
  { ticker: "TCB", name: "Techcombank", sector: "Financials", basePrice: 45.7, marketCap: 580 },
  { ticker: "SSI", name: "CTCK SSI", sector: "Financials", basePrice: 42.8, marketCap: 550 },
  { ticker: "CTG", name: "VietinBank", sector: "Financials", basePrice: 35.6, marketCap: 500 },
  { ticker: "TPB", name: "TPBank", sector: "Financials", basePrice: 27.3, marketCap: 480 },
  { ticker: "VIB", name: "VIB", sector: "Financials", basePrice: 22.1, marketCap: 450 },
  { ticker: "ACB", name: "ACB", sector: "Financials", basePrice: 31.4, marketCap: 420 },
  { ticker: "VND", name: "VNDirect", sector: "Financials", basePrice: 19.2, marketCap: 380 },
  { ticker: "HDB", name: "HDBank", sector: "Financials", basePrice: 25.6, marketCap: 350 },

  // Real Estate - Bất động sản (Top 8)
  { ticker: "NVL", name: "Novaland", sector: "RealEstate", basePrice: 8.2, marketCap: 520 },
  { ticker: "VIX", name: "VIX", sector: "RealEstate", basePrice: 15.4, marketCap: 400 },
  { ticker: "MBB", name: "MB", sector: "RealEstate", basePrice: 24.6, marketCap: 380 },
  { ticker: "PDR", name: "Phát Đạt", sector: "RealEstate", basePrice: 16.7, marketCap: 340 },
  { ticker: "DIG", name: "DIC Corp", sector: "RealEstate", basePrice: 11.3, marketCap: 310 },
  { ticker: "DXG", name: "Đất Xanh", sector: "RealEstate", basePrice: 13.8, marketCap: 290 },
  { ticker: "KHG", name: "Khang Điền", sector: "RealEstate", basePrice: 19.5, marketCap: 260 },
  { ticker: "HDC", name: "Hà Đô", sector: "RealEstate", basePrice: 22.4, marketCap: 240 },
  { ticker: "TCH", name: "Tân Cảng", sector: "RealEstate", basePrice: 28.9, marketCap: 220 },
  { ticker: "SCR", name: "SC Real", sector: "RealEstate", basePrice: 7.6, marketCap: 180 },

  // Industrials - Công nghiệp (Top 6)
  { ticker: "CII", name: "HĐTC Hạ tầng", sector: "Industrials", basePrice: 6.3, marketCap: 450 },
  { ticker: "VSC", name: "Container VN", sector: "Industrials", basePrice: 4.8, marketCap: 320 },
  { ticker: "GEX", name: "Gelex", sector: "Industrials", basePrice: 25.1, marketCap: 280 },
  { ticker: "HHV", name: "HHV", sector: "Industrials", basePrice: 18.4, marketCap: 250 },
  { ticker: "HAH", name: "Hang Hải", sector: "Industrials", basePrice: 9.2, marketCap: 180 },
  { ticker: "LCG", name: "LICOGI", sector: "Industrials", basePrice: 12.8, marketCap: 160 },

  // Materials - Vật liệu cơ bản (Top 6)
  { ticker: "HPG", name: "Hòa Phát", sector: "Materials", basePrice: 32.5, marketCap: 900 },
  { ticker: "HAG", name: "HAGL", sector: "Materials", basePrice: 8.7, marketCap: 420 },
  { ticker: "NKG", name: "NAM KIM", sector: "Materials", basePrice: 15.3, marketCap: 280 },
  { ticker: "GVR", name: "Cao su VN", sector: "Materials", basePrice: 21.6, marketCap: 250 },
  { ticker: "HSG", name: "Hoa Sen", sector: "Materials", basePrice: 19.4, marketCap: 220 },
  { ticker: "DCM", name: "Phân bón DCM", sector: "Materials", basePrice: 17.8, marketCap: 180 },

  // Consumer Goods - Hàng tiêu dùng (Top 8)
  { ticker: "MSN", name: "Masan", sector: "ConsumerGoods", basePrice: 89.5, marketCap: 1200 },
  { ticker: "VNM", name: "Vinamilk", sector: "ConsumerGoods", basePrice: 67.2, marketCap: 850 },
  { ticker: "VHC", name: "Vinhomes", sector: "ConsumerGoods", basePrice: 54.8, marketCap: 780 },
  { ticker: "SAB", name: "Sabeco", sector: "ConsumerGoods", basePrice: 78.3, marketCap: 720 },
  { ticker: "MWG", name: "MobileWorld", sector: "ConsumerGoods", basePrice: 52.6, marketCap: 650 },
  { ticker: "PNJ", name: "Phú Nhuận", sector: "ConsumerGoods", basePrice: 91.4, marketCap: 420 },
  { ticker: "FRT", name: "FPT Retail", sector: "ConsumerGoods", basePrice: 38.9, marketCap: 380 },
  { ticker: "DGW", name: "Digiworld", sector: "ConsumerGoods", basePrice: 45.7, marketCap: 280 },

  // Energy - Năng lượng (Top 5)
  { ticker: "PVD", name: "PV Drilling", sector: "Energy", basePrice: 12.8, marketCap: 450 },
  { ticker: "BSR", name: "BSR", sector: "Energy", basePrice: 18.3, marketCap: 380 },
  { ticker: "PVS", name: "PV Service", sector: "Energy", basePrice: 24.6, marketCap: 320 },
  { ticker: "PVC", name: "PV Contr.", sector: "Energy", basePrice: 15.7, marketCap: 220 },
  { ticker: "PVT", name: "PV Trans", sector: "Energy", basePrice: 9.4, marketCap: 180 },

  // Utilities - Dịch vụ hạ tầng (Top 5)
  { ticker: "REE", name: "REE Corp", sector: "Utilities", basePrice: 46.8, marketCap: 450 },
  { ticker: "POW", name: "POW", sector: "Utilities", basePrice: 14.2, marketCap: 520 },
  { ticker: "NT2", name: "Nhiệt Điện", sector: "Utilities", basePrice: 28.5, marketCap: 380 },
  { ticker: "PC1", name: "PC1", sector: "Utilities", basePrice: 22.3, marketCap: 280 },
  { ticker: "GAS", name: "PV Gas", sector: "Utilities", basePrice: 85.6, marketCap: 360 },

  // Technology - Công nghệ (Top 6)
  { ticker: "FPT", name: "FPT", sector: "Technology", basePrice: 112.5, marketCap: 980 },
  { ticker: "CMG", name: "CMC", sector: "Technology", basePrice: 45.8, marketCap: 320 },
  { ticker: "VGI", name: "VGI", sector: "Technology", basePrice: 18.6, marketCap: 180 },
  { ticker: "ELC", name: "Elcom", sector: "Technology", basePrice: 24.3, marketCap: 150 },
  { ticker: "ITD", name: "ITD", sector: "Technology", basePrice: 12.4, marketCap: 120 },
  { ticker: "SAM", name: "Saigon ACE", sector: "Technology", basePrice: 16.8, marketCap: 95 },
];

export function generateMockHeatmap(): HeatmapData {
  const stocks: StockHeatmapItem[] = SAMPLE_STOCKS.map((stock) => {
    const changePercent = (Math.random() - 0.45) * 6; // -2.7% to 3.3%
    const change = stock.basePrice * (changePercent / 100);
    const price = stock.basePrice + change;

    return {
      ticker: stock.ticker,
      name: stock.name,
      sector: stock.sector,
      price: Number(price.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      marketCap: stock.marketCap * 1_000_000_000, // Billions to actual value
      volume: Math.floor(Math.random() * 50000000) + 1000000,
    };
  }).filter(stock =>
    stock.price > 0 &&
    !isNaN(stock.price) &&
    !isNaN(stock.changePercent) &&
    stock.marketCap > 0
  );

  // Group by sector
  const sectorMap = new Map<string, StockHeatmapItem[]>();
  stocks.forEach((stock) => {
    if (!sectorMap.has(stock.sector)) {
      sectorMap.set(stock.sector, []);
    }
    sectorMap.get(stock.sector)!.push(stock);
  });

  const sectors: SectorGroup[] = VN_SECTORS.map((sectorInfo) => {
    const sectorStocks = sectorMap.get(sectorInfo.sector) || [];
    const totalMarketCap = sectorStocks.reduce(
      (sum, s) => sum + s.marketCap,
      0
    );
    const avgChange =
      sectorStocks.length > 0
        ? sectorStocks.reduce((sum, s) => sum + s.changePercent, 0) /
          sectorStocks.length
        : 0;

    return {
      sector: sectorInfo.sector,
      displayName: sectorInfo.displayName,
      color: sectorInfo.color,
      stocks: sectorStocks,
      totalMarketCap,
      avgChange: Number(avgChange.toFixed(2)),
    };
  }).filter((sector) => sector.stocks.length > 0);

  return {
    sectors,
    totalStocks: stocks.length,
    lastUpdate: new Date().toISOString(),
  };
}

// ==========================================
// MOCK MARKET STATUS
// ==========================================

export function generateMockMarketStatus(): MarketStatus {
  const totalStocks = SAMPLE_STOCKS.length;
  const advancing = Math.floor(totalStocks * (0.4 + Math.random() * 0.2)); // 40-60%
  const declining = Math.floor(totalStocks * (0.3 + Math.random() * 0.2)); // 30-50%
  const unchanged = totalStocks - advancing - declining;

  return {
    advancing,
    declining,
    unchanged,
    cashFlow: {
      advancing: Number((Math.random() * 8000 + 4000).toFixed(2)), // 4-12 tỷ $
      declining: Number((Math.random() * 6000 + 2000).toFixed(2)), // 2-8 tỷ $
      unchanged: Number((Math.random() * 2000 + 500).toFixed(2)), // 0.5-2.5 tỷ $
    },
    foreignTrading: {
      buy: Number((Math.random() * 500 + 200).toFixed(2)),
      sell: Number((Math.random() * 500 + 200).toFixed(2)),
      net: Number(((Math.random() - 0.5) * 300).toFixed(2)),
    },
    timestamp: new Date().toISOString(),
  };
}

// ==========================================
// MOCK DATA EXPORTS
// ==========================================

// ==========================================
// MOCK FEATURED NEWS
// ==========================================

const NEWS_TITLES = [
  "Cập nhật mới nhất về lệ năm giữ của khối ngoại",
  "Dòn bẩy vốn cho tăng trưởng",
  "EU đạt thỏa thuận tạm thời về ngân sách năm 2026",
  "Canada đầu tư 1,4 tỷ USD mở rộng đường ống dẫn dầu xuất khẩu",
  "Vàng và bitcoin tiếp tục được xem như 'tài sản' trước biến động thị trường",
  "Ngại xếp hàng, người dân đổ xô mua bạc 'trao tay'",
  "Fed dự kiến duy trì lãi suất ổn định trong quý I/2026",
  "Thị trường châu Á phục hồi nhờ tín hiệu tích cực từ Trung Quốc",
  "Giá dầu tăng mạnh sau quyết định cắt giảm sản xuất của OPEC+",
  "Cổ phiếu công nghệ dẫn dắt đà tăng của phố Wall",
];

const NEWS_THUMBNAILS = [
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1559526324-593bc073d938?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=300&h=200&fit=crop",
];

const NEWS_SOURCES = [
  "Bloomberg",
  "Reuters",
  "CNBC",
  "Financial Times",
  "Wall Street Journal",
];
const NEWS_CATEGORIES: FeaturedNews["category"][] = [
  "market",
  "economy",
  "stock",
  "commodity",
  "crypto",
];

export function generateMockNews(): FeaturedNews[] {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const publishedAt = new Date(now.getTime() - i * 3600000); // 1 hour intervals
    return {
      id: `news-${i + 1}`,
      title: NEWS_TITLES[i % NEWS_TITLES.length],
      thumbnail: NEWS_THUMBNAILS[i % NEWS_THUMBNAILS.length],
      source: NEWS_SOURCES[Math.floor(Math.random() * NEWS_SOURCES.length)],
      publishedAt: publishedAt.toISOString(),
      category:
        NEWS_CATEGORIES[Math.floor(Math.random() * NEWS_CATEGORIES.length)],
    };
  });
}

/**
 * Pre-generated mock data for quick access
 * Refresh mỗi 5-10 giây trong development
 */
export const MOCK_DATA = {
  indices: generateMockIndices(),
  candles: {
    SPY: generateMockCandles("SPY", "1m", 390, 467.84),
    QQQ: generateMockCandles("QQQ", "1m", 390, 387.23),
    DIA: generateMockCandles("DIA", "1m", 390, 350.15),
    IWM: generateMockCandles("IWM", "1m", 390, 212.56),
  },
  heatmap: generateMockHeatmap(),
  status: generateMockMarketStatus(),
  news: generateMockNews(),
};

/**
 * Refresh mock data
 * Call này để update mock data mới
 */
export function refreshMockData() {
  MOCK_DATA.indices = generateMockIndices();
  MOCK_DATA.heatmap = generateMockHeatmap();
  MOCK_DATA.status = generateMockMarketStatus();
  MOCK_DATA.news = generateMockNews();
  // Không refresh candles vì quá nặng
}
