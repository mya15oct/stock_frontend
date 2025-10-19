// API and application constants
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
export const DEFAULT_TICKER = "AAPL";
export const ITEMS_PER_PAGE = 20;

// Stock tabs
export const STOCK_TABS = [
  { id: "overview", label: "Overview" },
  { id: "dividends", label: "Dividends" },
  { id: "financials", label: "Financials" },
  { id: "news", label: "News" },
  { id: "community", label: "Community" },
] as const;

export type StockTabId = (typeof STOCK_TABS)[number]["id"];
