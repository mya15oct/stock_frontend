'use client'

export default function PromotionalBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-4 lg:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-start sm:items-center">
        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
          <span className="text-white text-sm">📈</span>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Start your journey to financial independence</h3>
          <p className="text-gray-600 text-sm">Snowball will help you to track your portfolio, plan checklist for your investment and support your passive income investing with tools and community of investors.</p>
        </div>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap self-start sm:self-auto">
        Start for free
      </button>
    </div>
  )
}