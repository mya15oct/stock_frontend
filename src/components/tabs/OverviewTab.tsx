'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { useStealthMode } from '@/contexts/StealthContext'
import { Stock } from '../../types/shared'

interface OverviewTabProps {
  stock: Stock
}

export default function OverviewTab({ stock }: OverviewTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode()
  const [selectedPeriod, setSelectedPeriod] = useState('1D')

  // Mock data matching the screenshot
  const chartData = [
    { time: '9:30', price: 255.50 },
    { time: '10:00', price: 256.20 },
    { time: '10:30', price: 257.80 },
    { time: '11:00', price: 256.90 },
    { time: '11:30', price: 258.30 },
    { time: '12:00', price: 259.10 },
    { time: '12:30', price: 258.70 },
    { time: '1:00', price: 257.40 },
    { time: '1:30', price: 256.80 },
    { time: '2:00', price: 258.00 },
    { time: '2:30', price: 258.90 },
    { time: '3:00', price: 259.50 },
    { time: '3:30', price: 258.305 }
  ]

  const stats = {
    marketCap: '3.83T',
    volume: '47.4M',
    avgVolume: '53.8M',
    peRatio: '39.3',
    eps: '6.58',
    earningsDate: 'Oct 30',
    dividendYield: '0.4%',
    exDividendDate: 'Nov 8',
    yearTarget: '$248.75',
    beta: '1.25',
    nextEarnings: 'Oct 30',
    fiftyTwoWeekHigh: '$237.49',
    fiftyTwoWeekLow: '$164.08'
  }

  const portfolioData = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 195,
      avgCost: 156.88,
      currentPrice: 258.305,
      returns: 19797.83,
      returnsPercent: 64.65,
      totalValue: 50370.48
    }
  ]

  const periods = ['1D', '5D', '1M', '6M', '1Y', '5Y']

  return (
    <div className="space-y-8">
      {/* Price History Chart */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Price history</h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        
        {/* Simple Chart Placeholder */}
        <div className="relative h-64 bg-gradient-to-t from-blue-50 to-transparent rounded-lg">
          <svg className="w-full h-full" viewBox="0 0 600 200">
            <polyline
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              points="50,150 100,140 150,120 200,130 250,110 300,100 350,105 400,125 450,115 500,95 550,80"
            />
            <circle cx="550" cy="80" r="4" fill="#3B82F6" />
          </svg>
          <div className="absolute bottom-4 right-4 text-sm text-gray-600">
            Current: {formatPrice(stock.price)}
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <Card>
        <h3 className="text-xl font-semibold mb-6">Statistics</h3>
        <div className="grid grid-cols-2 gap-x-16 gap-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Market cap</span>
            <span className="font-medium">{stats.marketCap}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">P/E ratio</span>
            <span className="font-medium">{stats.peRatio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Volume</span>
            <span className="font-medium">{stats.volume}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">EPS</span>
            <span className="font-medium">{stats.eps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg volume</span>
            <span className="font-medium">{stats.avgVolume}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Earnings date</span>
            <span className="font-medium">{stats.earningsDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Dividend yield</span>
            <span className="font-medium">{stats.dividendYield}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ex-dividend date</span>
            <span className="font-medium">{stats.exDividendDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">1y target est</span>
            <span className="font-medium">{stats.yearTarget}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Beta (5Y monthly)</span>
            <span className="font-medium">{stats.beta}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Next earnings date</span>
            <span className="font-medium">{stats.nextEarnings}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">52-week high</span>
            <span className="font-medium">{stats.fiftyTwoWeekHigh}</span>
          </div>
        </div>
      </Card>

      {/* My Position */}
      <Card>
        <h3 className="text-xl font-semibold mb-6">My position</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b">
                <th className="pb-3">STOCK PORTFOLIO</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Avg cost</th>
                <th className="pb-3">Returns</th>
                <th className="pb-3">Current</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-4">
                    <div>
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-sm text-gray-500">{item.name}</div>
                    </div>
                  </td>
                  <td className="py-4">{item.quantity} shares</td>
                  <td className="py-4">${item.avgCost.toFixed(2)}</td>
                  <td className="py-4">
                    <div className="text-green-600">
                      <div>${item.returns.toLocaleString()}</div>
                      <div className="text-sm">+{item.returnsPercent}%</div>
                    </div>
                  </td>
                  <td className="py-4">
                    <div>
                      <div className="font-medium">${item.currentPrice}</div>
                      <div className="text-sm text-gray-500">${item.totalValue.toLocaleString()}</div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* About the company */}
      <Card>
        <h3 className="text-xl font-semibold mb-6">About the company</h3>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod.
          </p>
          <p>
            The company also provides AppleCare support and cloud services; and operates various platforms, including the App Store that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts. In addition, it offers various services, such as Apple Arcade, a game subscription service; Apple Fitness+, a personalized fitness service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a mobile payment service, as well as licenses its intellectual property.
          </p>
          <p>
            The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It distributes third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was incorporated in 1977 and is headquartered in Cupertino, California.
          </p>
        </div>
      </Card>

      {/* FAQ */}
      <Card>
        <h3 className="text-xl font-semibold mb-6">Frequently asked questions</h3>
        <div className="space-y-4">
          {[
            "What sector does Apple Inc (AAPL) operate in?",
            "What is Apple Inc (AAPL) current stock price?",
            "What is Apple Inc (AAPL) current market capitalization?",
            "What is Apple Inc (AAPL) price-to-earnings ratio?",
            "What is Apple Inc (AAPL) price-to-book ratio?",
            "What is Apple Inc (AAPL) current P/E ratio?",
            "What is Apple Inc (AAPL) PEG ratio?",
            "How does Apple Inc (AAPL) perform vs its most recent earnings report?",
            "What does Apple Inc (AAPL) company do?",
            "What is Apple Inc (AAPL) book value/equity ratio?"
          ].map((question, index) => (
            <div key={index} className="border-b pb-3">
              <button className="text-left w-full flex justify-between items-center text-gray-800 hover:text-blue-600 transition-colors">
                <span>{question}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
