'use client'

import { Card } from '@/components/ui/Card'
import { useStealthMode } from '@/contexts/StealthContext'

interface OverviewTabProps {
  stock: Stock
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode()

  const mockMetrics = {
    marketCap: 2800000000000,
    peRatio: 28.5,
    dividendYield: 0.5,
    beta: 1.2,
    eps: 6.48,
    volume: 52441000,
    avgVolume: 58000000,
    high52Week: 198.23,
    low52Week: 124.17
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold mb-4">Current Price</h3>
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {formatPrice(stock.price)}
        </div>
        <div className="text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Key Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-600">Market Cap</div>
            <div className="font-semibold">{formatNumber(mockMetrics.marketCap)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">P/E Ratio</div>
            <div className="font-semibold">{isStealthMode ? '••••' : mockMetrics.peRatio}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Dividend Yield</div>
            <div className="font-semibold">{isStealthMode ? '••••' : `${mockMetrics.dividendYield}%`}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Beta</div>
            <div className="font-semibold">{isStealthMode ? '••••' : mockMetrics.beta}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">EPS</div>
            <div className="font-semibold">{formatPrice(mockMetrics.eps)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Volume</div>
            <div className="font-semibold">{formatNumber(mockMetrics.volume)}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">52 Week Range</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">52W High</span>
            <span className="font-semibold text-green-600">{formatCurrency(mockMetrics.high52Week)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${((stock.price - mockMetrics.low52Week) / (mockMetrics.high52Week - mockMetrics.low52Week)) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">52W Low</span>
            <span className="font-semibold text-red-600">{formatCurrency(mockMetrics.low52Week)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Company Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Sector</span>
            <span className="font-semibold">{stock.sector}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Exchange</span>
            <span className="font-semibold">NASDAQ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Currency</span>
            <span className="font-semibold">USD</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
