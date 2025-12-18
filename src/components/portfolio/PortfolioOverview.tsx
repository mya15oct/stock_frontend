"use client";

import { Card } from "@/components/ui/Card";
import { PortfolioPosition } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface PortfolioOverviewProps {
    portfolio: PortfolioPosition[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
    const { formatPrice } = useStealthMode();

    const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
    const totalInvested = portfolio.reduce((sum, item) => sum + item.shares * item.averagePrice, 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested ? (totalGainLoss / totalInvested) * 100 : 0;

    // Dividend Calculations (Real Data)
    const totalDividendValue = portfolio.reduce((sum, item) => sum + (item.dividendValue || 0), 0);
    // Yield based on current market value
    const totalDividendYield = totalValue ? (totalDividendValue / totalValue) * 100 : 0;

    // Prepare data for Pie Chart
    const allocationData = portfolio.map((item) => ({
        name: item.ticker,
        value: item.totalValue,
    })).sort((a, b) => b.value - a.value);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Value
                        </h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(totalValue)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatPrice(totalInvested)} invested
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Total profit
                        </h3>
                        <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {totalGainLoss >= 0 ? "+" : ""}{formatPrice(totalGainLoss)}
                            <span className="text-sm font-normal ml-2">
                                {totalGainLossPercent >= 0 ? "▲" : "▼"} {Math.abs(totalGainLossPercent).toFixed(2)}%
                            </span>
                        </div>
                        <div className="text-sm text-gray-500">
                            Today's P/L not available in mock
                        </div>
                    </div>
                </Card>

                {/* Passive Income Card - Hidden as per user request (no data)
                <Card>
                    <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            Passive income
                        </h3>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {totalDividendYield.toFixed(2)}%
                        </div>
                        <div className="text-sm text-gray-500">
                             {formatPrice(totalDividendValue)} annually
                        </div>
                    </div>
                </Card>
                */}
            </div>

            {/* Allocation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-80">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Portfolio Allocation</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {allocationData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => formatPrice(value)}
                                contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Allocation Details</h3>
                    <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2">
                        {allocationData.map((item, index) => (
                            <div key={item.name} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.value)}</div>
                                    <div className="text-xs text-gray-500">
                                        {((item.value / totalValue) * 100).toFixed(1)}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
