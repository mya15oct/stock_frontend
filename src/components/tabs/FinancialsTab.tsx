'use client'

import { Card } from '@/components/ui/Card'
import { useStealthMode } from '@/contexts/StealthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface FinancialsTabProps {
  ticker: string
}

export default function FinancialsTab({ ticker }: FinancialsTabProps) {
  const { formatPrice, formatNumber, isStealthMode } = useStealthMode()
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([])
  const [activeFinancialTab, setActiveFinancialTab] = useState('income')

  const financialData = {
    years: ['2020', '2021', '2022', '2023', '2024', 'TTM'],
    revenue: [1400, 2700, 2700, 3200, 4800, 5200],
    netIncome: [100, 200, 250, 350, 1600, 2400],
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

  const balanceSheetData = {
    years: ['2020', '2021', '2022', '2023', '2024', 'TTM'],
    cashAndEquivalents: [317.2, 1520.5, 1080.5, 502.2, 741.4, 1192.6],
    shortTermInvestments: [0, 2532, 732, 0, 0, 0],
    totalCashAndShortTerm: [317.2, 1520.5, 1080.5, 502.2, 741.4, 1192.6],
    totalReceivables: [297, 514.5, 702.8, 953.8, 1414.2, 1581.7],
    inventory: [0, 1050, 0, 0, 0, 0],
    otherCurrentAssets: [45.8, 1200, 155.6, 162.7, 156.5, 219.4],
    totalCurrentAssets: [660, 4285, 1938.9, 1618.7, 2312.1, 2993.7],
    propertyPlantEquipment: [145.2, 189.3, 225.4, 278.9, 312.5, 334.8],
    goodwill: [0, 0, 89.7, 95.2, 98.4, 101.2],
    intangibleAssets: [12.5, 18.9, 145.6, 178.3, 201.7, 215.4],
    otherLongTermAssets: [234.8, 298.7, 356.9, 445.2, 523.8, 587.3],
    totalAssets: [1052.5, 4791.9, 2756.5, 2616.3, 3448.5, 4232.4]
  }

  // Prepare chart data based on active tab and selected metrics
  const getChartData = () => {
    const years = activeFinancialTab === 'balance' ? balanceSheetData.years : financialData.years

    return years.map((year, index) => {
      const dataPoint: any = { year }

      selectedMetrics.forEach(metric => {
        if (activeFinancialTab === 'balance') {
          dataPoint[metric] = balanceSheetData[metric as keyof typeof balanceSheetData]?.[index] || 0
        } else {
          dataPoint[metric] = financialData[metric as keyof typeof financialData]?.[index] || 0
        }
      })

      return dataPoint
    })
  }

  const chartData = getChartData()

  const formatYAxisValue = (value: number) => {
    if (value >= 1000) {
      return `${value / 1000}B`
    }
    return `${value}`
  }

  const handleMetricToggle = (metric: string) => {
    if (selectedMetrics.includes(metric)) {
      setSelectedMetrics(selectedMetrics.filter(m => m !== metric))
    } else {
      setSelectedMetrics([...selectedMetrics, metric])
    }
  }

  const clearAllMetrics = () => {
    setSelectedMetrics([])
  }

  const formatValue = (value: number, isNegative = false) => {
    if (isStealthMode) return '••••'
    if (isNegative) return `(${Math.abs(value).toLocaleString()})`
    return value.toLocaleString()
  }

  // Metric colors for chart - expanded to include all metrics
  const metricColors: { [key: string]: string } = {
    revenue: '#4F46E5',
    netIncome: '#A855F7',
    grossProfit: '#059669',
    operatingIncome: '#DC2626',
    cogs: '#F59E0B',
    operatingExpenses: '#EF4444',
    rdExpenses: '#8B5CF6',
    sgaExpenses: '#06B6D4',
    interestExpense: '#F97316',
    interestIncome: '#10B981',
    taxExpense: '#6B7280',
    cashAndEquivalents: '#0891B2',
    shortTermInvestments: '#7C3AED',
    totalCashAndShortTerm: '#059669',
    totalReceivables: '#EA580C',
    inventory: '#D97706',
    otherCurrentAssets: '#0284C7',
    totalCurrentAssets: '#7C2D12',
    totalAssets: '#15803D',
    propertyPlantEquipment: '#9333EA',
    goodwill: '#BE185D',
    intangibleAssets: '#C2410C',
    otherLongTermAssets: '#4338CA'
  }

  // Metric display names - expanded to include all metrics
  const metricDisplayNames: { [key: string]: string } = {
    revenue: 'Total revenue',
    netIncome: 'Net Income',
    grossProfit: 'Gross Profit',
    operatingIncome: 'Operating Income',
    cogs: 'Cost of Goods Sold',
    operatingExpenses: 'Operating Expenses',
    rdExpenses: 'R&D Expenses',
    sgaExpenses: 'SG&A Expenses',
    interestExpense: 'Interest Expense',
    interestIncome: 'Interest Income',
    taxExpense: 'Tax Expense',
    cashAndEquivalents: 'Cash & Equivalents',
    shortTermInvestments: 'Short Term Investments',
    totalCashAndShortTerm: 'Total Cash & Short Term',
    totalReceivables: 'Total Receivables',
    inventory: 'Inventory',
    otherCurrentAssets: 'Other Current Assets',
    totalCurrentAssets: 'Total Current Assets',
    totalAssets: 'Total Assets',
    propertyPlantEquipment: 'Property, Plant & Equipment',
    goodwill: 'Goodwill',
    intangibleAssets: 'Intangible Assets',
    otherLongTermAssets: 'Other Long Term Assets'
  }

  const renderIncomeStatement = () => (
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
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('revenue') ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => handleMetricToggle('revenue')}
          >
            <td className="py-3 px-4 font-medium text-gray-900">Revenue</td>
            {financialData.revenue.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('revenue') ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => handleMetricToggle('revenue')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Total revenue</td>
            {financialData.revenue.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('cogs') ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
            }`}
            onClick={() => handleMetricToggle('cogs')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">COGS</td>
            {financialData.cogs.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('grossProfit') ? 'bg-green-50 border-l-4 border-l-green-500' : ''
            }`}
            onClick={() => handleMetricToggle('grossProfit')}
          >
            <td className="py-3 px-4 text-gray-700 pl-4">Gross Profit</td>
            {financialData.grossProfit.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Operating Expenses & Income</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('operatingIncome') ? 'bg-red-50 border-l-4 border-l-red-500' : ''
            }`}
            onClick={() => handleMetricToggle('operatingIncome')}
          >
            <td className="py-3 px-4 text-gray-700 pl-4">Operating Income</td>
            {financialData.operatingIncome.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('operatingExpenses') ? 'bg-red-50 border-l-4 border-l-red-500' : ''
            }`}
            onClick={() => handleMetricToggle('operatingExpenses')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Total Operating Expenses</td>
            {financialData.operatingExpenses.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('rdExpenses') ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => handleMetricToggle('rdExpenses')}
          >
            <td className="py-3 px-4 text-gray-700 pl-12">R&D Expenses</td>
            {financialData.rdExpenses.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('sgaExpenses') ? 'bg-cyan-50 border-l-4 border-l-cyan-500' : ''
            }`}
            onClick={() => handleMetricToggle('sgaExpenses')}
          >
            <td className="py-3 px-4 text-gray-700 pl-12">Selling General & Admin Expenses</td>
            {financialData.sgaExpenses.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Earnings from Continuing Operations</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('interestExpense') ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
            }`}
            onClick={() => handleMetricToggle('interestExpense')}
          >
            <td className="py-3 px-4 text-gray-700 pl-4">Interest Expense</td>
            {financialData.interestExpense.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-red-600">
                {formatValue(value, true)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('interestIncome') ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
            }`}
            onClick={() => handleMetricToggle('interestIncome')}
          >
            <td className="py-3 px-4 text-gray-700 pl-4">Interest Income</td>
            {financialData.interestIncome.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('taxExpense') ? 'bg-gray-50 border-l-4 border-l-gray-500' : ''
            }`}
            onClick={() => handleMetricToggle('taxExpense')}
          >
            <td className="py-3 px-4 text-gray-700 pl-4">Income Tax Expense</td>
            {financialData.taxExpense.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Net Income</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('netIncome') ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => handleMetricToggle('netIncome')}
          >
            <td className="py-3 px-4 font-medium text-gray-900">Net Income</td>
            {financialData.netIncome.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center font-medium text-gray-900">
                {formatValue(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )

  const renderBalanceSheet = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
            {balanceSheetData.years.map((year) => (
              <th key={year} className="text-center py-3 px-4 font-medium text-gray-500">{year}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Cash & Short Term Investments Section */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Cash & Short Term Investments</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('cashAndEquivalents') ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
            }`}
            onClick={() => handleMetricToggle('cashAndEquivalents')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Cash & Equivalents</td>
            {balanceSheetData.cashAndEquivalents.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('shortTermInvestments') ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => handleMetricToggle('shortTermInvestments')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Short Term Investments</td>
            {balanceSheetData.shortTermInvestments.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {index === 3 ? <span className="text-red-600">(15.1)</span> :
                 value === 0 ? '-' : formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 font-medium cursor-pointer ${
              selectedMetrics.includes('totalCashAndShortTerm') ? 'bg-green-50 border-l-4 border-l-green-500' : ''
            }`}
            onClick={() => handleMetricToggle('totalCashAndShortTerm')}
          >
            <td className="py-3 px-4 text-gray-900 pl-4">Total Cash & Short Term Investments</td>
            {balanceSheetData.totalCashAndShortTerm.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-900 font-medium">
                {formatValue(value)}
              </td>
            ))}
          </tr>

          {/* Receivables Section */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Receivables</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 font-medium cursor-pointer ${
              selectedMetrics.includes('totalReceivables') ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
            }`}
            onClick={() => handleMetricToggle('totalReceivables')}
          >
            <td className="py-3 px-4 text-gray-900 pl-4">Total Receivables</td>
            {balanceSheetData.totalReceivables.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-900 font-medium">
                {formatValue(value)}
              </td>
            ))}
          </tr>

          {/* Current Assets Section */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Current Assets</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('inventory') ? 'bg-amber-50 border-l-4 border-l-amber-500' : ''
            }`}
            onClick={() => handleMetricToggle('inventory')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Inventory</td>
            {balanceSheetData.inventory.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {index === 2 ? <span className="text-red-600">(7.319)</span> :
                 value === 0 ? '-' : formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('otherCurrentAssets') ? 'bg-sky-50 border-l-4 border-l-sky-500' : ''
            }`}
            onClick={() => handleMetricToggle('otherCurrentAssets')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Other Current Assets</td>
            {balanceSheetData.otherCurrentAssets.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 font-medium cursor-pointer ${
              selectedMetrics.includes('totalCurrentAssets') ? 'bg-yellow-50 border-l-4 border-l-yellow-500' : 'bg-blue-50'
            }`}
            onClick={() => handleMetricToggle('totalCurrentAssets')}
          >
            <td className="py-3 px-4 text-gray-900 font-semibold">Total Current Assets</td>
            {balanceSheetData.totalCurrentAssets.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-900 font-semibold">
                {formatValue(value)}
              </td>
            ))}
          </tr>

          {/* Non-Current Assets Section */}
          <tr className="bg-gray-50 border-b border-gray-200">
            <td className="py-3 px-4 font-medium text-gray-900">Non-Current Assets</td>
            <td colSpan={6}></td>
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('propertyPlantEquipment') ? 'bg-purple-50 border-l-4 border-l-purple-500' : ''
            }`}
            onClick={() => handleMetricToggle('propertyPlantEquipment')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Property, Plant & Equipment</td>
            {balanceSheetData.propertyPlantEquipment.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('goodwill') ? 'bg-pink-50 border-l-4 border-l-pink-500' : ''
            }`}
            onClick={() => handleMetricToggle('goodwill')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Goodwill</td>
            {balanceSheetData.goodwill.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {value === 0 ? '-' : formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('intangibleAssets') ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
            }`}
            onClick={() => handleMetricToggle('intangibleAssets')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Intangible Assets</td>
            {balanceSheetData.intangibleAssets.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>
          <tr
            className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
              selectedMetrics.includes('otherLongTermAssets') ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
            }`}
            onClick={() => handleMetricToggle('otherLongTermAssets')}
          >
            <td className="py-3 px-4 text-gray-700 pl-8">Other Long Term Assets</td>
            {balanceSheetData.otherLongTermAssets.map((value, index) => (
              <td key={index} className="py-3 px-4 text-center text-gray-700">
                {formatValue(value)}
              </td>
            ))}
          </tr>

          {/* Total Assets */}
          <tr
            className={`border-b border-gray-200 font-bold cursor-pointer ${
              selectedMetrics.includes('totalAssets') ? 'bg-green-100 border-l-4 border-l-green-600' : 'bg-green-50'
            }`}
            onClick={() => handleMetricToggle('totalAssets')}
          >
            <td className="py-4 px-4 text-gray-900 font-bold text-lg">Total Assets</td>
            {balanceSheetData.totalAssets.map((value, index) => (
              <td key={index} className="py-4 px-4 text-center text-gray-900 font-bold text-lg">
                {formatValue(value)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-6 py-6">
        {/* Interactive Chart Tip */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">💡</span>
            <span className="text-sm text-gray-700">Click on a row in the table to make it appear on the graph</span>
            <button
              onClick={clearAllMetrics}
              className="ml-auto text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Premium Feature Banner */}
        <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="text-2xl">🚀</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">
                Compare financials of multiple companies on the same chart
              </h2>
              <p className="text-gray-700">
                This feature is available with our premium plans. <span className="text-purple-600 font-medium">Upgrade</span> to unlock the full potential of <span className="font-medium">Snowball Analytics</span> and be on top of your investments!
              </p>
            </div>
          </div>
        </div>

        {/* Chart - Only show if there are selected metrics */}
        {selectedMetrics.length > 0 && (
          <Card className="bg-white mb-8">
            <div className="p-6">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                  barCategoryGap="20%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    tickFormatter={formatYAxisValue}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      isStealthMode ? '••••' : `$${value.toLocaleString()}M`,
                      metricDisplayNames[name] || name
                    ]}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => metricDisplayNames[value] || value}
                  />

                  {selectedMetrics.map((metric) => (
                    <Bar
                      key={metric}
                      dataKey={metric}
                      fill={metricColors[metric] || '#6B7280'}
                      radius={[2, 2, 0, 0]}
                      name={metric}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* Financial Statements Tabs */}
        <Card className="bg-white">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'income', label: 'Income statement' },
                { id: 'balance', label: 'Balance sheet' },
                { id: 'cashflow', label: 'Cash flow' },
                { id: 'statistics', label: 'Statistics' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveFinancialTab(tab.id)
                    setSelectedMetrics([]) // Clear metrics when switching tabs
                  }}
                  className={`py-3 px-4 font-medium text-sm transition-colors ${
                    activeFinancialTab === tab.id
                      ? 'border-b-2 border-gray-900 text-white bg-gray-900 rounded-t-lg'
                      : 'text-gray-500 hover:text-gray-700'
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

          {/* Conditional Content Based on Active Tab */}
          {activeFinancialTab === 'income' && renderIncomeStatement()}
          {activeFinancialTab === 'balance' && renderBalanceSheet()}
          {activeFinancialTab === 'cashflow' && (
            <div className="text-center py-12 text-gray-500">
              Cash Flow statement coming soon...
            </div>
          )}
          {activeFinancialTab === 'statistics' && (
            <div className="text-center py-12 text-gray-500">
              Statistics coming soon...
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
