import { Card } from "@/components/ui/Card";
import { PortfolioPosition, Transaction } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

interface PortfolioOverviewProps {
    portfolio: PortfolioPosition[];
    transactions?: Transaction[];
    selectedPortfolio?: import("@/types").Portfolio;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function PortfolioOverview({ portfolio, transactions = [], selectedPortfolio }: PortfolioOverviewProps) {
    const { formatPrice } = useStealthMode();

    // 1. Calculate Unrealized (Holdings)
    const totalCurrentValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    const totalCostBasisHoldings = portfolio.reduce((sum, item) => sum + item.shares * item.averagePrice, 0);
    const unrealizedProfit = totalCurrentValue - totalCostBasisHoldings;

    // 2. Calculate Realized (Transactions)
    // Filter only SELL transactions that have totalProfit calculated
    const realizedProfit = transactions.reduce((sum, tx) => sum + (tx.totalProfit || 0), 0);

    // 3. Total Net Profit
    const totalNetProfit = unrealizedProfit + realizedProfit;
    const totalNetProfitPercent = totalCostBasisHoldings > 0 ? (totalNetProfit / totalCostBasisHoldings) * 100 : 0;


    // Prepare data for Pie Chart (Allocation)
    const allocationData = portfolio
        .filter(item => item.totalValue > 0.01) // Filter out zero/near-zero holdings
        .map((item) => ({
            name: item.ticker,
            value: item.totalValue,
        }))
        .sort((a, b) => b.value - a.value);

    // Prepare data for Bar Chart (Profit by Asset)
    // Need to aggregate Realized Profit by Ticker from transactions
    const profitByTicker: Record<string, number> = {};

    // Init with Unrealized
    portfolio.forEach(p => {
        profitByTicker[p.ticker] = p.gainLoss;
    });

    // Add Realized
    transactions.forEach(tx => {
        if (tx.ticker && tx.totalProfit) {
            profitByTicker[tx.ticker] = (profitByTicker[tx.ticker] || 0) + tx.totalProfit;
        }
    });

    const profitData = Object.entries(profitByTicker)
        .map(([ticker, profit]) => ({ name: ticker, profit }))
        .sort((a, b) => b.profit - a.profit) // Sort by profit desc
        .slice(0, 7); // Top 7 limit for better visibility

    // Recent Activity (Top 5)
    const recentActivity = transactions.slice(0, 5);

    // Custom Label for Pie Chart
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="space-y-4">
            {/* Stats Grid - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Net Worth */}
                <Card className="p-4">
                    <div className="space-y-0.5">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Net Worth</h3>
                        <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
                            {formatPrice(totalCurrentValue)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {formatPrice(totalCostBasisHoldings)} invested
                        </div>
                    </div>
                    {/* Target Progress Bar */}
                    {selectedPortfolio?.target_amount && selectedPortfolio.target_amount > 0 && (
                        <div className="pt-3">
                            <div className="flex justify-between text-[10px] mb-1">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Target: {formatPrice(selectedPortfolio.target_amount)}
                                </span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {Math.min((totalCurrentValue / selectedPortfolio.target_amount) * 100, 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${Math.min((totalCurrentValue / selectedPortfolio.target_amount) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Total Net Profit */}
                <Card className="p-4">
                    <div className="space-y-0.5">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Net Profit</h3>
                        <div className={`text-lg font-bold truncate ${totalNetProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {totalNetProfit >= 0 ? "+" : ""}{formatPrice(totalNetProfit)}
                        </div>
                        <div className={`text-xs truncate ${totalNetProfitPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {totalNetProfitPercent >= 0 ? "▲" : "▼"} {Math.abs(totalNetProfitPercent).toFixed(2)}% (All time)
                        </div>
                    </div>
                </Card>

                {/* Realized P/L */}
                <Card className="p-4">
                    <div className="space-y-0.5">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Realized P/L</h3>
                        <div className={`text-lg font-bold truncate ${realizedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {realizedProfit >= 0 ? "+" : ""}{formatPrice(realizedProfit)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            Secured
                        </div>
                    </div>
                </Card>

                {/* Unrealized P/L */}
                <Card className="p-4">
                    <div className="space-y-0.5">
                        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400">Unrealized P/L</h3>
                        <div className={`text-lg font-bold truncate ${unrealizedProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {unrealizedProfit >= 0 ? "+" : ""}{formatPrice(unrealizedProfit)}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            Paper value
                        </div>
                    </div>
                </Card>
            </div>

            {/* Note Section (if exists) */}
            {selectedPortfolio?.note && (
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-4 py-3 rounded-lg flex items-start gap-3 text-sm border border-blue-100 dark:border-blue-800/30">
                    <svg className="w-5 h-5 shrink-0 mt-0.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div className="flex-1">
                        <span className="font-semibold block mb-0.5 text-xs uppercase tracking-wider opacity-70">Portfolio Note</span>
                        {selectedPortfolio.note}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Distribution */}
                <Card className="h-96 flex flex-col justify-center">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white px-4 pt-4">Profit Distribution (Top 7)</h3>
                    <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={60} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    formatter={(value: number) => formatPrice(value)}
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                    itemStyle={{ color: '#F3F4F6' }}
                                />
                                <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={32}>
                                    {profitData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#10B981" : "#EF4444"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Allocation */}
                <Card className="h-96 flex flex-col">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white px-4 pt-4">Portfolio Allocation</h3>
                    <div className="flex flex-col md:flex-row h-full items-center">
                        <div className="w-full md:w-3/5 h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={allocationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        isAnimationActive={true}
                                        animationBegin={0}
                                        animationDuration={1000}
                                        animationEasing="ease-out"
                                        label={renderCustomizedLabel}
                                        labelLine={false}
                                    >
                                        {allocationData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: number) => formatPrice(value)}
                                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                                        itemStyle={{ color: '#F3F4F6' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-full md:w-2/5 overflow-y-auto max-h-[280px] pr-4 pl-2 text-sm space-y-3 pb-4">
                            {allocationData.map((item, index) => (
                                <div key={item.name} className="flex items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        <span className="font-semibold text-gray-900 dark:text-white text-base">{item.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="px-0 pb-0 pt-4 overflow-hidden">
                <h3 className="text-lg font-semibold mb-4 px-6 text-gray-900 dark:text-white">Recent Activity</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-700">
                                <th className="py-2 px-6 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="py-2 px-6 text-xs font-medium text-gray-500 uppercase">Stock</th>
                                <th className="py-2 px-6 text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="py-2 px-6 text-xs font-medium text-gray-500 uppercase text-right">Amount</th>
                                <th className="py-2 px-6 text-xs font-medium text-gray-500 uppercase text-right">Profit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentActivity.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                    <td className="py-3 px-6 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-white">{tx.ticker}</td>
                                    <td className="py-3 px-6">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                                            ${tx.type === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                tx.type === 'SELL' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="py-3 px-6 text-sm text-right text-gray-900 dark:text-white">
                                        {formatPrice(tx.amount)}
                                    </td>
                                    <td className="py-3 px-6 text-sm text-right">
                                        {tx.type === 'SELL' ? (
                                            <span className={tx.totalProfit && tx.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                                {tx.totalProfit && tx.totalProfit >= 0 ? "+" : ""}{formatPrice(tx.totalProfit || 0)}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {recentActivity.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-4 text-center text-sm text-gray-500">No recent transactions</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
