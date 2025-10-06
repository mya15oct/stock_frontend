'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/stocks/${searchQuery.toUpperCase()}`
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to StockTracker</h1>
        <p className="text-gray-600 text-lg mb-8">
          Track your investments and explore market data
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search for a stock
            </label>
            <div className="flex gap-2">
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter stock ticker (e.g., AAPL, GOOGL)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Button type="submit" disabled={!searchQuery.trim()}>
                Search
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Quick Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/portfolio">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">My Portfolio</h3>
                <p className="text-gray-600">
                  View your investment holdings, track performance, and analyze gains/losses
                </p>
              </div>
            </Card>
          </Link>

          <Card className="h-full">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Popular Stocks</h3>
              <p className="text-gray-600 mb-4">
                Explore trending stocks and market data
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/stocks/AAPL">
                  <Button variant="outline" size="sm">AAPL</Button>
                </Link>
                <Link href="/stocks/GOOGL">
                  <Button variant="outline" size="sm">GOOGL</Button>
                </Link>
                <Link href="/stocks/MSFT">
                  <Button variant="outline" size="sm">MSFT</Button>
                </Link>
                <Link href="/stocks/TSLA">
                  <Button variant="outline" size="sm">TSLA</Button>
                </Link>
                <Link href="/stocks/AMZN">
                  <Button variant="outline" size="sm">AMZN</Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
