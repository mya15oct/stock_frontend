'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stock } from '@stock-portfolio/shared'
import { getStock } from '@/lib/api'
import Breadcrumb from '@/components/Breadcrumb'
import StockHeader from '@/components/StockHeader'
import OverviewTab from '@/components/tabs/OverviewTab'
import DividendsTab from '@/components/tabs/DividendsTab'
import FinancialsTab from '@/components/tabs/FinancialsTab'
import NewsTab from '@/components/tabs/NewsTab'
import CommunityTab from '@/components/tabs/CommunityTab'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'dividends', label: 'Dividends' },
  { id: 'financials', label: 'Financials' },
  { id: 'news', label: 'News' },
  { id: 'community', label: 'Community' }
]

export default function StockPage({ params }: { params: { ticker: string } }) {
  const router = useRouter()
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dividends')

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const stockData = await getStock(params.ticker)
        setStock(stockData)
      } catch (err) {
        setError('Stock not found')
        console.error('Error fetching stock:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStock()
  }, [params.ticker])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading stock data...</div>
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back Home
        </button>
      </div>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab stock={stock} />
      case 'dividends':
        return <DividendsTab ticker={stock.ticker} />
      case 'financials':
        return <FinancialsTab ticker={stock.ticker} />
      case 'news':
        return <NewsTab ticker={stock.ticker} />
      case 'community':
        return <CommunityTab ticker={stock.ticker} />
      default:
        return <DividendsTab ticker={stock.ticker} />
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-3">
          <Breadcrumb
            country="United States of America"
            sector="Industrials"
            companyName={stock.name}
            ticker={stock.ticker}
          />
        </div>
      </div>

      {/* Stock Header with Company Info and Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          {/* Company Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                🚜
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{stock.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium text-lg">{stock.ticker} • NYSE</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>

          {/* Price and Key Metrics */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-5xl font-bold text-gray-900">$462.88</span>
                <span className="text-xl font-medium text-green-600">
                  +$1.06 (▲ 0.23%)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-8 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Earnings date</div>
                <div className="font-medium text-gray-900">Nov 19</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">P/E</div>
                <div className="font-medium text-gray-900">24.5</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">EPS</div>
                <div className="font-medium text-gray-900">18.88</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Market cap</div>
                <div className="font-medium text-gray-900">$125.13B</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Dividend yield</div>
                <div className="font-medium text-gray-900">1.4%</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="border-b border-gray-200">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-screen">
        {renderTabContent()}
      </div>
    </div>
  )
}
