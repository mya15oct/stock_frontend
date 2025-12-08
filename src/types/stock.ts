// Stock-related type definitions

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  sector: string;
  industry?: string;
  change?: number;
  changePercent?: number;
  priceChange?: number;
  priceChangePercent?: number;
  dividendYield?: number;
  dividendPerShare?: number;
  exDividendDate?: string;
  dividendDate?: string;
  marketCap?: number;
  pe?: number;
  peRatio?: number;
  eps?: number;
  latestQuarter?: string;
  beta?: number;
  revenueGrowth?: number;
  netIncomeGrowth?: number;
  fcfGrowth?: number;
  exchange?: string;
}

export interface QuoteData {
  currentPrice: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  pe?: number;
  eps?: number;
  beta?: number;
  revenueGrowth?: number;
  netIncomeGrowth?: number;
  fcfGrowth?: number;
}

export interface DividendEvent {
  id: string;
  ticker: string;
  exDate: string;
  payDate: string;
  amount: number;
  frequency: string;
}

// Financial types
export type StatementType = "income" | "balance" | "cash";
export type PeriodType = "annual" | "quarterly";

export interface FinancialDataRequest {
  ticker: string;
  statement: StatementType;
  period: PeriodType;
}

export interface FinancialDataResponse {
  company: string; // Company ticker
  type: string; // Statement type: IS, BS, CF
  period: string; // Period type: annual or quarterly
  periods: string[]; // Array of period labels like ["2025-Q2", "2025-Q1"]
  data: Record<string, Record<string, number>>; // {lineItem: {period: value}}
}

// News types
export interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  category: string;
  sentiment: "positive" | "negative" | "neutral";
  imageUrl: string;
}
