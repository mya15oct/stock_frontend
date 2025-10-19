// Portfolio-related type definitions

export interface PortfolioPosition {
  ticker: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
}

export interface PortfolioItem {
  ticker: string;
  quantity: number;
  cost: number;
}
