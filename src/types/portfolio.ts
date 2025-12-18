// Portfolio-related type definitions

export interface Portfolio {
  portfolio_id: string;
  user_id: string;
  name: string;
  currency: string;
  goal_type: string;
  target_amount?: number;
  created_at?: string;
}

export interface PortfolioPosition {
  ticker: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  // New fields for design
  costBasis?: number;
  dividendValue?: number;     // Annual dividend value
  dividendYield?: number;     // Dividend yield percent
  dailyChange?: number;
  dailyChangePercent?: number;
}

export interface PortfolioCreate {
  user_id: string;
  name: string;
  currency?: string;
  goal_type?: 'VALUE' | 'PASSIVE_INCOME';
  target_amount?: number;
  note?: string;
}

export interface TransactionCreate {
  portfolio_id: string;
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  fee?: number;
  tax?: number;
  note?: string;
  date?: string;
}

export interface PortfolioItem {
  ticker: string;
  quantity: number;
  cost: number;
}

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';

export interface Transaction {
  id: string;
  type: TransactionType;
  ticker?: string;
  name?: string;
  amount: number;
  price?: number;
  shares?: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  // New fields
  fee?: number;
  tax?: number;
  totalProfit?: number; // For sold positions
  note?: string;
}
