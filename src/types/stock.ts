// Stock-related type definitions

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  sector: string;
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
