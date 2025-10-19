// Portfolio service - API calls for portfolio management
import { apiRequest } from "./apiBase";
import type { PortfolioPosition, PortfolioItem } from "@/types";

export const portfolioService = {
  /**
   * Get portfolio positions
   */
  async getPortfolio(): Promise<PortfolioPosition[]> {
    return apiRequest<PortfolioPosition[]>("/api/portfolio");
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
   * Remove stock from portfolio
   */
  async deleteStock(ticker: string): Promise<void> {
    await apiRequest(`/api/portfolio/${ticker}`, {
      method: "DELETE",
    });
  },
};
