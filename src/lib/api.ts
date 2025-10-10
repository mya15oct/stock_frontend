import { Stock, PortfolioPosition, ApiResponse } from '../types/shared'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    const data: ApiResponse<T> = await response.json()
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Unknown API error')
    }
    return data.data
  }

  async getStocks(): Promise<Stock[]> {
    return this.request<Stock[]>('/api/stocks')
  }

  async getStock(ticker: string): Promise<Stock> {
    return this.request<Stock>(`/api/stocks/${ticker}`)
  }

  async getPortfolio(): Promise<PortfolioPosition[]> {
    return this.request<PortfolioPosition[]>('/api/portfolio')
  }
}

export const apiClient = new ApiClient(BACKEND_URL)

export const getStocks = () => apiClient.getStocks()
export const getStock = (ticker: string) => apiClient.getStock(ticker)
export const getPortfolio = () => apiClient.getPortfolio()
