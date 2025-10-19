'use client'

import { Card } from '@/components/ui/Card'
import { useStealthMode } from '@/contexts/StealthContext'
import PromotionalBanner from '@/components/PromotionalBanner'

interface DividendsTabProps {
  ticker: string
}

export default function DividendsTab({ ticker }: DividendsTabProps) {
  const { formatPrice, isStealthMode } = useStealthMode()

  const mockData = {
    summary: {
      dividendYield: '1.4%',
      annualPayout: '$6.48',
      nextExDivDate: 'December 31, 25',
      payout: '32.36%',
      divRating: '★'
    },
    growth: {
      oneYear: '7.46%',
      threeYear: '12.84%',
      fiveYear: '16.34%',
      dividendGrowthStreak: '5 y',
      dividendStreak: '37 y'
    },
    payoutHistory: [
      { state: 'Declared', declarationDate: '08/27/2025', exDividendDate: '09/30/2025', paymentDate: '11/10/2025', amount: '$1.62', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '05/28/2025', exDividendDate: '06/30/2025', paymentDate: '08/08/2025', amount: '$1.62', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '02/26/2025', exDividendDate: '03/31/2025', paymentDate: '05/08/2025', amount: '$1.62', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '12/03/2024', exDividendDate: '12/31/2024', paymentDate: '02/10/2025', amount: '$1.62', period: 'Quarterly', change: '+10.2%' },
      { state: 'Paid', declarationDate: '08/28/2024', exDividendDate: '09/30/2024', paymentDate: '11/08/2024', amount: '$1.47', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '05/29/2024', exDividendDate: '06/28/2024', paymentDate: '08/08/2024', amount: '$1.47', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '02/28/2024', exDividendDate: '03/27/2024', paymentDate: '05/08/2024', amount: '$1.47', period: 'Quarterly' },
      { state: 'Paid', declarationDate: '12/06/2023', exDividendDate: '12/28/2023', paymentDate: '02/08/2024', amount: '$1.47', period: 'Quarterly', change: '+8.89%' },
      { state: 'Paid', declarationDate: '08/30/2023', exDividendDate: '09/28/2023', paymentDate: '11/08/2023', amount: '$1.35', period: 'Quarterly', change: '+8%' },
      { state: 'Paid', declarationDate: '05/31/2023', exDividendDate: '06/29/2023', paymentDate: '08/08/2023', amount: '$1.25', period: 'Quarterly' }
    ]
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {/* Promotional Banner */}
        <PromotionalBanner />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Summary and Growth */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            <Card className="bg-white">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs text-gray-600">?</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Dividend yield</div>
                  <div className="text-xl font-bold">{isStealthMode ? '••••' : mockData.summary.dividendYield}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Annual payout</div>
                  <div className="text-xl font-bold">{isStealthMode ? '••••' : mockData.summary.annualPayout}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Next ex. div date</div>
                  <div className="text-xl font-bold">{mockData.summary.nextExDivDate}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Payout</div>
                  <div className="text-xl font-bold">{isStealthMode ? '••••' : mockData.summary.payout}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-500 mb-1">Div.rating</div>
                  <div className="text-xl">{mockData.summary.divRating}</div>
                </div>
              </div>
            </Card>

            {/* Growth Card */}
            <Card className="bg-white">
              <h3 className="text-lg font-semibold mb-4">Growth</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">1 year</div>
                    <div className="text-lg font-bold">{mockData.growth.oneYear}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">3 years</div>
                    <div className="text-lg font-bold">{mockData.growth.threeYear}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">5 years</div>
                    <div className="text-lg font-bold">{mockData.growth.fiveYear}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Dividend growth streak</div>
                    <div className="text-lg font-bold">{mockData.growth.dividendGrowthStreak}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Dividend streak</div>
                    <div className="text-lg font-bold">{mockData.growth.dividendStreak}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Estimate Card */}
            <Card className="bg-white">
              <h3 className="text-lg font-semibold mb-4">Estimate</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '24.5'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '18.88'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beta</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '1.01'}</span>
                </div>
              </div>

              <h4 className="text-md font-semibold mt-6 mb-3">Growth</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenue, YoY</span>
                  <span className="font-medium text-red-600">-8.29%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Net income, YoY</span>
                  <span className="font-medium text-red-600">-25.66%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FCF, YoY</span>
                  <span className="font-medium text-red-600">-11.13%</span>
                </div>
              </div>

              <h4 className="text-md font-semibold mt-6 mb-3">Forecast</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">P/E (FWD)</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '22'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EPS (FWD)</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '21.01'}</span>
                </div>
              </div>

              <h4 className="text-md font-semibold mt-6 mb-3">Dividends</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend yield</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '1.4%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Annual payout</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '$6.48'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next ex. div date</span>
                  <span className="font-medium">December 31, 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout</span>
                  <span className="font-medium">{isStealthMode ? '••••' : '32.36%'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.growth, 5y</span>
                  <span className="font-medium">16.34%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dividend growth streak</span>
                  <span className="font-medium">5 y</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Div.rating</span>
                  <span className="font-medium">★</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Charts and History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payout History Chart */}
            <Card className="bg-white">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Payout history</h3>
                <div className="flex gap-2">
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>All</option>
                    <option>Last 5 years</option>
                  </select>
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>Annual</option>
                    <option>Quarterly</option>
                  </select>
                </div>
              </div>

              {/* Time Period Buttons */}
              <div className="flex gap-2 mb-6">
                {['1y', '5y', '10y', 'all'].map((period, index) => (
                  <button
                    key={period}
                    className={`px-3 py-1 text-sm rounded ${
                      index === 2 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Bar Chart Visualization */}
              <div className="h-64 flex items-end justify-between gap-2 mb-4">
                {[
                  { year: '2015', value: 2.3, height: 30 },
                  { year: '2016', value: 2.4, height: 32 },
                  { year: '2017', value: 2.4, height: 32 },
                  { year: '2018', value: 2.5, height: 35 },
                  { year: '2019', value: 2.8, height: 40 },
                  { year: '2020', value: 2.9, height: 42 },
                  { year: '2021', value: 3.5, height: 50 },
                  { year: '2022', value: 4.2, height: 60 },
                  { year: '2023', value: 5.0, height: 70 },
                  { year: '2024', value: 5.8, height: 85 },
                  { year: '2025', value: 6.5, height: 100 }
                ].map((item, index) => (
                  <div key={item.year} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-blue-500 rounded-t"
                      style={{ height: `${item.height}%` }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">{item.year}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Dividends</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded"></div>
                  <span className="text-gray-600">Forecast</span>
                </div>
              </div>
            </Card>

            {/* Dividend Yield Chart */}
            <Card className="bg-white">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Div yield, TTM</h3>
                  <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-600">?</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Show "average amount" line
                </div>
              </div>

              {/* Time Period Buttons */}
              <div className="flex gap-2 mb-6">
                {['6m', 'YTD', '1y', '5y', '10y', 'all'].map((period, index) => (
                  <button
                    key={period}
                    className={`px-3 py-1 text-sm rounded ${
                      index === 2 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">Oct 5, 24 - Oct 5, 25</span>
                <span className="ml-2 text-red-600">● -0.04% (▼ 2.86%)</span>
              </div>

              {/* Chart Area - Simplified representation */}
              <div className="h-48 bg-gradient-to-b from-blue-50 to-white border border-gray-200 rounded-lg flex items-center justify-center mb-4">
                <svg width="100%" height="100%" viewBox="0 0 400 150" className="text-blue-600">
                  <path
                    d="M20,100 Q60,80 100,85 T180,75 Q220,85 260,90 T340,95 Q360,85 380,80"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M20,100 Q60,80 100,85 T180,75 Q220,85 260,90 T340,95 Q360,85 380,80 L380,150 L20,150 Z"
                    fill="currentColor"
                    fillOpacity="0.1"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>min: 1.16%</span>
                <span>max: 1.51%</span>
              </div>
            </Card>

            {/* Payout History Table */}
            <Card className="bg-white">
              <h3 className="text-lg font-semibold mb-4">Payout history</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">State</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Declaration date</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Ex.dividend date</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Payment date</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Amount</th>
                      <th className="text-left py-3 px-2 text-gray-500 font-medium">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.payoutHistory.map((payout, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 ${
                            payout.state === 'Declared' ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            ● {payout.state}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-700">{payout.declarationDate}</td>
                        <td className="py-3 px-2 text-gray-700">{payout.exDividendDate}</td>
                        <td className="py-3 px-2 text-gray-700">{payout.paymentDate}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col">
                            <span className="font-medium">{isStealthMode ? '••••' : payout.amount}</span>
                            {payout.change && (
                              <span className="text-xs text-green-600">{payout.change}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            📊 {payout.period}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        className={`w-8 h-8 rounded ${
                          page === 1 ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <span className="px-2">...</span>
                  </div>

                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select className="text-sm border border-gray-300 rounded px-2 py-1">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                  <span className="text-sm text-gray-600">See 1-10 from 216</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
