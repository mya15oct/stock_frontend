// Stock service - API calls for stock data
import { apiRequest } from "./apiBase";
import type {
  Stock,
  DividendEvent,
  NewsArticle,
  FinancialDataResponse,
  StatementType,
  PeriodType,
} from "@/types";

export const stockService = {
  /**
   * Get all stocks
   */
  async getStocks(): Promise<Stock[]> {
    return apiRequest<Stock[]>("/api/stocks");
  },

  /**
   * Get single stock by ticker
   */
  async getStock(ticker: string): Promise<Stock> {
    return apiRequest<Stock>(`/api/stocks/${ticker}`);
  },

  /**
   * Get dividend events for a stock
   */
  async getDividends(ticker: string): Promise<DividendEvent[]> {
    return apiRequest<DividendEvent[]>(`/api/dividends/${ticker}`);
  },

  /**
   * Get all dividend calendar events
   */
  async getAllDividends(): Promise<DividendEvent[]> {
    return apiRequest<DividendEvent[]>("/api/dividends");
  },

  /**
   * Get financial data for a stock
   */
  async getFinancials(
    company: string,
    type: StatementType,
    period: PeriodType
  ): Promise<FinancialDataResponse> {
    // Map frontend types to backend API types
    const typeMapping: Record<StatementType, string> = {
      income: "IS",
      balance: "BS",
      cash: "CF",
    };

    const params = new URLSearchParams({
      company,
      type: typeMapping[type],
      period,
    });

    return apiRequest<FinancialDataResponse>(`/api/financials?${params}`);
  },

  /**
   * Get news for a stock
   */
  async getNews(ticker: string): Promise<NewsArticle[]> {
    return apiRequest<NewsArticle[]>(`/api/news/${ticker}`);
  },

  /**
   * Search stocks
   */
  async searchStocks(query: string): Promise<Stock[]> {
    return apiRequest<Stock[]>(
      `/api/stocks/search?q=${encodeURIComponent(query)}`
    );
  },
};
