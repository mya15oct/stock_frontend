// Portfolio service - API calls for portfolio management
import { apiRequest } from "./apiBase";
import type { PortfolioPosition, PortfolioItem } from "@/types";

export const portfolioService = {
  /**
   * Get portfolio positions
   */
  async getPortfolio(portfolioId: string = 'default_portfolio_id', includeSold: boolean = false): Promise<PortfolioPosition[]> {
    const data = await apiRequest<any[]>(`/api/portfolio/holdings?portfolio_id=${portfolioId}&include_sold=${includeSold}`); // Dynamic ID

    // Map backend response (snake_case) to frontend type (camelCase)
    // Backend returns: stock_ticker, total_shares, avg_cost_basis, current_price, market_value, gain_loss...
    // Frontend expects: ticker, shares, averagePrice, currentPrice, totalValue, gainLoss...

    return data.map((pos: any) => ({
      ticker: pos.stock_ticker,
      shares: Number(pos.total_shares),
      averagePrice: Number(pos.avg_cost_basis),
      currentPrice: Number(pos.current_price),
      totalValue: Number(pos.market_value),
      gainLoss: Number(pos.gain_loss),
      gainLossPercent: Number(pos.gain_loss_percent),
      costBasis: Number(pos.total_cost), // total_cost is shares * avg_cost_basis
      dividendValue: Number(pos.dividend_value || 0), // If we add dividends later
      dividendYield: Number(pos.dividend_yield || 0),
      dailyChange: Number(pos.daily_change || 0),
      dailyChangePercent: Number(pos.daily_change_percent || 0),
      allocation: Number(pos.allocation || 0)
    }));
  },

  /**
   * Create new portfolio
   */
  async createPortfolio(data: import("@/types").PortfolioCreate): Promise<string> {
    const res = await apiRequest<{ success: boolean; portfolio_id: string }>("/api/portfolio/create", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res.portfolio_id;
  },

  /**
   * Add stock to portfolio
   */
  async addStock(item: PortfolioItem): Promise<void> {
    await apiRequest("/api/portfolio", {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  /**
   * Update portfolio position
   */
  async updateStock(
    ticker: string,
    item: Partial<PortfolioItem>
  ): Promise<void> {
    await apiRequest(`/api/portfolio/${ticker}`, {
      method: "PUT",
      body: JSON.stringify(item),
    });
  },

  /**
   * Add transaction
   */
  async addTransaction(data: {
    portfolio_id: string;
    ticker: string;
    transaction_type: 'BUY' | 'SELL';
    quantity: number;
    price: number;
    fee?: number;
    tax?: number;
    note?: string;
    date?: string;
  }): Promise<string> {
    const res = await apiRequest<{ success: boolean; transaction_id: string }>("/api/portfolio/transactions", {
      method: "POST",
      body: JSON.stringify(data)
    });
    return res.transaction_id;
  },

  /**
   * Update transaction
   */
  async updateTransaction(
    transactionId: string,
    portfolioId: string,
    data: {
      ticker: string;
      transaction_type: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      fee?: number;
      tax?: number;
      note?: string;
      date?: string;
    }
  ): Promise<void> {
    await apiRequest(`/api/portfolio/${portfolioId}/transactions/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  },

  /**
   * Get transaction history
   */
  async getTransactions(portfolioId: string = 'default_portfolio_id'): Promise<import("@/types").Transaction[]> {
    const res = await apiRequest<any[]>(`/api/portfolio/transactions?portfolio_id=${portfolioId}`);

    // Map backend response to frontend type
    if (!Array.isArray(res)) {
      console.warn("getTransactions: Expected array but got", res);
      return [];
    }

    return res.map((tx: any) => ({
      id: tx.transaction_id,
      type: tx.transaction_type,
      ticker: tx.stock_ticker,
      name: tx.stock_ticker,
      shares: Number(tx.quantity),
      price: Number(tx.price),
      amount: Number(tx.quantity) * Number(tx.price),
      date: tx.transaction_date,
      status: 'completed',
      fee: Number(tx.fee),
      tax: Number(tx.tax),
      note: tx.note,
      totalProfit: Number(tx.total_profit), // Map realized profit from backend
    }));
  },

  /**
   * Get user portfolios
   */
  async getPortfolios(userId: string): Promise<import("@/types").Portfolio[]> {
    if (!userId) return []; // Guard clause
    const res = await apiRequest<{ portfolios: any[]; total_value: number }>("/api/portfolio/portfolios?user_id=" + userId);

    if (res && Array.isArray(res.portfolios)) {
      return res.portfolios;
    }
    return [];
  },

  /**
   * Delete holding (and all associated transactions)
   */
  async deleteHolding(ticker: string, portfolioId: string = 'default_portfolio_id'): Promise<void> {
    await apiRequest(`/api/portfolio/${portfolioId}/holdings/${ticker}`, {
      method: "DELETE",
    });
  },

  /**
   * Delete transaction
   */
  async deleteTransaction(transactionId: string, portfolioId: string = 'default_portfolio_id'): Promise<void> {
    await apiRequest(`/api/portfolio/${portfolioId}/transactions/${transactionId}`, {
      method: "DELETE",
    });
  },

  /**
   * Delete portfolio
   */
  async deletePortfolio(portfolioId: string, userId: string): Promise<void> {
    await apiRequest(`/api/portfolio/${portfolioId}?user_id=${userId}`, {
      method: "DELETE",
    });
  }
};
