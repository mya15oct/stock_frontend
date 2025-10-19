import { Card } from '@/components/ui/Card'
import PromotionalBanner from '@/components/PromotionalBanner'

interface NewsTabProps {
  ticker: string
}

export default function NewsTab({ ticker }: NewsTabProps) {
  const mockNews = [
    {
      id: 1,
      title: `${ticker} Reports Strong Q3 Earnings, Beats Analyst Expectations`,
      summary: "Company exceeded revenue forecasts with strong performance across all segments, driving stock price higher in after-hours trading.",
      source: "Financial Times",
      timestamp: "2 hours ago",
      category: "Earnings",
      sentiment: "positive",
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 2,
      title: `Analysts Upgrade ${ticker} Price Target Following Innovation Announcement`,
      summary: "Major investment firms raise price targets after company unveils new product roadmap and strategic partnerships.",
      source: "Reuters",
      timestamp: "5 hours ago",
      category: "Analysis",
      sentiment: "positive",
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 3,
      title: `${ticker} Faces Regulatory Scrutiny Over Market Practices`,
      summary: "Government agencies launch investigation into company's business practices, potentially impacting future operations.",
      source: "Wall Street Journal",
      timestamp: "1 day ago",
      category: "Regulatory",
      sentiment: "negative",
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 4,
      title: `${ticker} Announces Major Acquisition to Expand Market Presence`,
      summary: "Strategic acquisition valued at $2.3B expected to strengthen company's position in emerging markets.",
      source: "Bloomberg",
      timestamp: "2 days ago",
      category: "M&A",
      sentiment: "positive",
      imageUrl: "/api/placeholder/300/200"
    },
    {
      id: 5,
      title: `${ticker} Stock Volatility Increases Amid Market Uncertainty`,
      summary: "Shares experience increased volatility as investors react to broader market conditions and sector trends.",
      source: "MarketWatch",
      timestamp: "3 days ago",
      category: "Market",
      sentiment: "neutral",
      imageUrl: "/api/placeholder/300/200"
    }
  ]

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100'
      case 'negative': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Earnings': return 'text-blue-600 bg-blue-100'
      case 'Analysis': return 'text-purple-600 bg-purple-100'
      case 'Regulatory': return 'text-red-600 bg-red-100'
      case 'M&A': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-6">
      {/* Promotional Banner */}
      <PromotionalBanner />
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Latest News for {ticker}</h3>
        <div className="flex gap-2">
          <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option>All Categories</option>
            <option>Earnings</option>
            <option>Analysis</option>
            <option>Regulatory</option>
            <option>M&A</option>
          </select>
          <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
            <option>All Time</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {mockNews.map((article) => (
          <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15" />
                  </svg>
                </div>
              </div>
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{article.title}</h4>
                  <div className="flex gap-2 ml-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
                      {article.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                      {article.sentiment}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{article.summary}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="font-medium">{article.source}</span>
                  <span>{article.timestamp}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Market Sentiment Analysis</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">68%</div>
            <div className="text-sm text-gray-600">Positive</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">22%</div>
            <div className="text-sm text-gray-600">Neutral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">10%</div>
            <div className="text-sm text-gray-600">Negative</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-green-500" style={{ width: '68%' }}></div>
              <div className="bg-gray-400" style={{ width: '22%' }}></div>
              <div className="bg-red-500" style={{ width: '10%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">News Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex justify-between">
            <span>Bloomberg</span>
            <span className="font-semibold">8 articles</span>
          </div>
          <div className="flex justify-between">
            <span>Reuters</span>
            <span className="font-semibold">12 articles</span>
          </div>
          <div className="flex justify-between">
            <span>WSJ</span>
            <span className="font-semibold">6 articles</span>
          </div>
          <div className="flex justify-between">
            <span>Financial Times</span>
            <span className="font-semibold">4 articles</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
