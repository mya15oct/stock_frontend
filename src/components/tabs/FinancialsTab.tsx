'use client'

import { Card } from '@/components/ui/Card'
import { useStealthMode } from '@/contexts/StealthContext'

interface FinancialsTabProps {
  ticker: string
}

export default function FinancialsTab({ ticker }: FinancialsTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode()

  const financialData = {
    years: ['2020', '2021', '2022', '2023', '2024', 'TTM'],
    revenue: [34722, 43033, 51282, 60248, 50518, 43397],
    netIncome: [2751, 5963, 7131, 10166, 7100, 5207],
    cogs: [23865, 29318, 35552, 37942, 31023, 27034],
    grossProfit: [10857, 13715, 15730, 22306, 19495, 16363],
    operatingIncome: [4368, 7663, 9026, 14591, 11427, 8663],
    operatingExpenses: [6489, 6052, 6704, 7715, 8068, 7700],
    rdExpenses: [1644, 1587, 1912, 2177, 2290, 2257],
    sgaExpenses: [3446, 3200, 3645, 4309, 4507, 4080],
    interestExpense: [1247, 993, 1062, 2453, 3348, 3277],
    interestIncome: [1247, 993, 736, 2575, 3419, 2483],
    taxExpense: [1082, 1658, 2007, 2871, 2094, 1154]
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {/* Premium Feature Banner */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Compare financials of multiple companies on the same chart
              </h2>
              <p className="text-gray-700">
                This feature is available with our premium plans. <span className="text-purple-600 font-medium">Upgrade</span> to unlock the full potential of Snowball Analytics and be on top of your investments!
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Chart Tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">💡</span>
            <span className="text-sm text-gray-700">Click on a row in the table to make it appear on the graph</span>
            <button className="ml-auto text-sm text-blue-600 hover:text-blue-800">Clear all</button>
          </div>
        </div>

        {/* Revenue vs Net Income Chart */}
        <Card className="bg-white mb-8">
          <div className="h-80 flex items-end justify-between gap-4 p-6">
            {financialData.years.map((year, index) => (
              <div key={year} className="flex flex-col items-center">
                <div className="flex flex-col items-center gap-1 mb-2">
                  {/* Revenue Bar */}
                  <div
                    className="w-16 bg-blue-500 rounded-t"
                    style={{ height: `${(financialData.revenue[index] / Math.max(...financialData.revenue)) * 200}px` }}
                  ></div>
                  {/* Net Income Bar */}
                  <div
                    className="w-8 bg-purple-500 rounded-t -mt-1"
                    style={{ height: `${(financialData.netIncome[index] / Math.max(...financialData.netIncome)) * 80}px` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500">{year}</div>
              </div>
            ))}
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Total revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Net Income</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Financial Statements Tabs */}
        <Card className="bg-white">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'income', label: 'Income statement', active: true },
                { id: 'balance', label: 'Balance sheet', active: false },
                { id: 'cashflow', label: 'Cash flow', active: false },
                { id: 'statistics', label: 'Statistics', active: false }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.active
                      ? 'border-gray-900 text-gray-900 bg-gray-900 text-white rounded-t-lg px-4'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <select className="text-sm border border-gray-300 rounded px-3 py-2">
                <option>Annual</option>
                <option>Quarterly</option>
              </select>
              <select className="text-sm border border-gray-300 rounded px-3 py-2">
                <option>Values, USD</option>
                <option>Percentage</option>
              </select>
            </div>
          </div>

          {/* Financial Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
                  {financialData.years.map((year) => (
                    <th key={year} className="text-center py-3 px-4 font-medium text-gray-500">{year}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 border-l-4 border-blue-500">Revenue</td>
                  {financialData.revenue.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-8">Total revenue</td>
                  {financialData.revenue.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-8">COGS</td>
                  {financialData.cogs.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-4">Gross Profit</td>
                  {financialData.grossProfit.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="py-3 px-4 font-medium text-gray-900">Operating Expenses & Income</td>
                  <td colSpan={6}></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-4">Operating Income</td>
                  {financialData.operatingIncome.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-8">Total Operating Expenses</td>
                  {financialData.operatingExpenses.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-12">R&D Expenses</td>
                  {financialData.rdExpenses.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-12">Selling General & Admin Expenses</td>
                  {financialData.sgaExpenses.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="py-3 px-4 font-medium text-gray-900">Earnings from Continuing Operations</td>
                  <td colSpan={6}></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-4">Interest Expense</td>
                  {financialData.interestExpense.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-red-600">
                      {isStealthMode ? '••••' : `(${value.toLocaleString()})`}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-4">Interest Income</td>
                  {financialData.interestIncome.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700 pl-4">Income Tax Expense</td>
                  {financialData.taxExpense.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center text-gray-700">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="py-3 px-4 font-medium text-gray-900">Net Income</td>
                  <td colSpan={6}></td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900 border-l-4 border-purple-500">Net Income</td>
                  {financialData.netIncome.map((value, index) => (
                    <td key={index} className="py-3 px-4 text-center font-medium text-gray-900">
                      {isStealthMode ? '••••' : value.toLocaleString()}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">Supplemental</td>
                  <td colSpan={6}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
