"use client";

import { Card } from "@/components/ui/Card";
import { PortfolioPosition } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import ConfirmModal from '@/components/ui/ConfirmModal';
import { portfolioService } from '@/services/portfolioService';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';


interface PortfolioHoldingsProps {
    portfolio: PortfolioPosition[];
    onRefresh?: () => void;
}

export default function PortfolioHoldings({ portfolio, onRefresh }: PortfolioHoldingsProps) {
    const { formatPrice } = useStealthMode();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [currencyMode, setCurrencyMode] = useState<'holdings' | 'usd'>('holdings');
    const [showSold, setShowSold] = useState(false);
    const [filter, setFilter] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Selection State
    const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredPortfolio = portfolio.filter(p =>
        p.ticker.toLowerCase().includes(filter.toLowerCase())
    );

    // Handlers
    const toggleSelection = (ticker: string) => {
        const newSet = new Set(selectedTickers);
        if (newSet.has(ticker)) newSet.delete(ticker);
        else newSet.add(ticker);
        setSelectedTickers(newSet);
    };

    const toggleAll = () => {
        if (selectedTickers.size === filteredPortfolio.length && filteredPortfolio.length > 0) {
            setSelectedTickers(new Set());
        } else {
            setSelectedTickers(new Set(filteredPortfolio.map(p => p.ticker)));
        }
    };

    const handleEdit = () => {
        if (selectedTickers.size !== 1) return;
        const ticker = Array.from(selectedTickers)[0];
        // Redirect to Transactions tab:
        // - selectTicker: highlights the rows
        // - mode=edit: tells the component to auto-open edit modal if possible
        router.push(`/portfolio?tab=transactions&selectTicker=${ticker}&mode=edit`);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await Promise.all(
                Array.from(selectedTickers).map(ticker => portfolioService.deleteHolding(ticker))
            );
            setSelectedTickers(new Set());
            router.refresh(); // Keep router.refresh for server components just in case
            if (onRefresh) onRefresh(); // Trigger parent refresh
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error("Failed to delete holdings", error);
            // Could add toast here
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Controls Bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    {/* ... (Toggles) ... */}
                    <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-1 flex border border-gray-200 dark:border-gray-700">
                            <button onClick={() => setCurrencyMode('holdings')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currencyMode === 'holdings' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>In holding currency</button>
                            <button onClick={() => setCurrencyMode('usd')} className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${currencyMode === 'usd' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>In USD</button>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showSold ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showSold ? 'translate-x-4' : ''}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Show sold</span>
                        </label>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Bulk Actions */}
                        {selectedTickers.size > 0 && (
                            <div className="flex items-center gap-2 mr-2">
                                {selectedTickers.size === 1 && (
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                                        title="View transactions for this holding"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                        Transactions
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsDeleteModalOpen(true)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Delete ({selectedTickers.size})
                                </button>
                            </div>
                        )}

                        <div className="relative flex-1 md:w-64">
                            <input type="text" placeholder="Search..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <div className="absolute right-3 top-2.5 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Add investments
                        </button>
                    </div>
                </div>

                <Card className="!p-0 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3 flex gap-6 text-sm font-medium text-gray-500">
                        <button className="text-gray-900 dark:text-white pb-3 -mb-3.5 border-b-2 border-blue-500">My holdings</button>
                        <button className="hover:text-gray-700 dark:hover:text-gray-300">General</button>
                        {/* <button className="hover:text-gray-700 dark:hover:text-gray-300">Dividends</button> */}-
                        <button className="hover:text-gray-700 dark:hover:text-gray-300">Returns</button>
                    </div>

                    {filteredPortfolio.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        {/* Select All */}
                                        <th className="py-3 px-4 w-10 text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedTickers.size === filteredPortfolio.length && filteredPortfolio.length > 0}
                                                onChange={toggleAll}
                                            />
                                        </th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Holding</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Shares</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Cost per share</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Cost basis</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Current value</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Total profit</th>
                                        <th className="py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-right">Daily</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredPortfolio.map((position) => (
                                        <tr key={position.ticker} className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group ${selectedTickers.has(position.ticker) ? 'bg-blue-50/10' : ''}`}>
                                            <td className="py-4 px-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    checked={selectedTickers.has(position.ticker)}
                                                    onChange={() => toggleSelection(position.ticker)}
                                                />
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-white text-sm">{position.ticker}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white font-medium">{position.shares}</td>
                                            <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white">{formatPrice(position.averagePrice)}</td>
                                            <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white font-medium">{formatPrice(position.costBasis || 0)}</td>
                                            <td className="py-4 px-4 text-right">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(position.totalValue)}</div>
                                                <div className="text-xs text-gray-500">{formatPrice(position.currentPrice)}</div>
                                            </td>

                                            <td className="py-4 px-4 text-right">
                                                <div className={`text-sm font-medium ${position.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {position.gainLoss >= 0 ? "+" : ""}{formatPrice(position.gainLoss)}
                                                </div>
                                                <div className={`text-xs ${position.gainLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {position.gainLossPercent >= 0 ? "▲" : "▼"} {Math.abs(position.gainLossPercent).toFixed(2)}%
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <div className={`text-sm font-medium ${position.dailyChange && position.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {position.dailyChange && position.dailyChange >= 0 ? "+" : ""}{formatPrice(position.dailyChange || 0)}
                                                </div>
                                                <div className={`text-xs ${position.dailyChangePercent && position.dailyChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {position.dailyChangePercent && position.dailyChangePercent >= 0 ? "▲" : "▼"} {position.dailyChangePercent?.toFixed(2)}%
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 font-semibold">
                                        <td className="py-4 px-4"></td>
                                        <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">Total</td>
                                        <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white">{filteredPortfolio.reduce((acc, p) => acc + p.shares, 0)}</td>
                                        <td className="py-4 px-4"></td>
                                        <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white">{formatPrice(filteredPortfolio.reduce((acc, p) => acc + (p.costBasis || 0), 0))}</td>
                                        <td className="py-4 px-4 text-right text-sm text-gray-900 dark:text-white">{formatPrice(filteredPortfolio.reduce((acc, p) => acc + p.totalValue, 0))}</td>
                                        <td className="py-4 px-4 text-right">
                                            <div className={`text-sm font-medium ${filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0) >= 0 ? "+" : ""}{formatPrice(filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0))}
                                            </div>
                                            <div className={`text-xs ${filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) >= 0 ? "▲" : "▼"} {Math.abs(filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) / (filteredPortfolio.length || 1)).toFixed(2)}%
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            <div className={`text-sm font-medium ${filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0) >= 0 ? "+" : ""}{formatPrice(filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0))}
                                            </div>
                                            <div className={`text-xs ${filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) >= 0 ? "▲" : "▼"} {Math.abs(filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) / (filteredPortfolio.length || 1)).toFixed(2)}%
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No holdings match your search.
                        </div>
                    )}
                </Card>
                {/* ... Pagination ... */}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5 flex items-center gap-2">
                        25 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <span>See 1-{filteredPortfolio.length} from {filteredPortfolio.length}</span>
                </div>
            </div>

            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); router.refresh(); }} portfolioId="default_portfolio_id" />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Holdings"
                message={`Are you sure you want to delete ${selectedTickers.size} selected holdings? This action cannot be undone and will delete ALL transactions associated with these stocks.`}
                confirmText={`Delete ${selectedTickers.size} Items`}
                isDestructive={true}
                isLoading={isDeleting}
            />
        </>
    );
}
