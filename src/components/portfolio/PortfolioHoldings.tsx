"use client";

import { Card } from "@/components/ui/Card";
import { PortfolioPosition } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState } from "react";
import AddTransactionModal from "./AddTransactionModal";
import EditHoldingModal from "./EditHoldingModal";
import ConfirmModal from '@/components/ui/ConfirmModal';
import { portfolioService } from '@/services/portfolioService';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';


interface PortfolioHoldingsProps {
    portfolio: PortfolioPosition[];
    onRefresh?: () => void;
    portfolioId: string;
    readOnly?: boolean;
    selectedHoldingTicker?: string | null;
    onSelectHolding?: (ticker: string | null) => void;
}

export default function PortfolioHoldings({ portfolio, onRefresh, portfolioId, readOnly, selectedHoldingTicker, onSelectHolding }: PortfolioHoldingsProps) {
    const { formatPrice } = useStealthMode();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [currencyMode, setCurrencyMode] = useState<'holdings' | 'usd'>('holdings');
    const [showSold, setShowSold] = useState(false);
    const [filter, setFilter] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Kept for "Add investments" button internal

    // Edit State - Removed "Edit" button feature as per requirements, but keeping modal import if needed for future
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingHolding, setEditingHolding] = useState<PortfolioPosition | null>(null);

    // Selection State (for Deletion)
    const [selectedTickers, setSelectedTickers] = useState<Set<string>>(new Set());

    // Delete State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredPortfolio = portfolio.filter(p => {
        const matchesFilter = p.ticker.toLowerCase().includes(filter.toLowerCase());
        const matchesSold = showSold ? true : p.shares > 0;
        return matchesFilter && matchesSold;
    });

    // Handlers
    const toggleDeletionSelection = (ticker: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        const newSet = new Set(selectedTickers);
        if (newSet.has(ticker)) newSet.delete(ticker);
        else newSet.add(ticker);
        setSelectedTickers(newSet);
    };

    const toggleAllDeletion = (e: React.ChangeEvent<HTMLInputElement>) => {
        // e.stopPropagation();
        if (selectedTickers.size === filteredPortfolio.length && filteredPortfolio.length > 0) {
            setSelectedTickers(new Set());
        } else {
            setSelectedTickers(new Set(filteredPortfolio.map(p => p.ticker)));
        }
    };

    const handleRowClick = (ticker: string) => {
        if (onSelectHolding) {
            if (selectedHoldingTicker === ticker) {
                onSelectHolding(null); // Deselect
            } else {
                onSelectHolding(ticker); // Select
            }
        }
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await Promise.all(
                Array.from(selectedTickers).map(ticker => portfolioService.deleteHolding(ticker, portfolioId))
            );
            setSelectedTickers(new Set());
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
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${showSold ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${showSold ? 'translate-x-4' : ''}`} />
                            </div>
                            <input type="checkbox" className="hidden" checked={showSold} onChange={(e) => setShowSold(e.target.checked)} />
                            <span className="text-sm text-gray-600 dark:text-gray-300">Show sold</span>
                        </label>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        {/* Bulk Actions (Deletion) */}
                        {selectedTickers.size > 0 && (
                            <div className="flex items-center gap-2 mr-2">
                                <div className="relative group">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 bg-red-600 hover:bg-red-700`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete ({selectedTickers.size})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Delete Holding option for single selection from row click */}
                        {(!selectedTickers.size && selectedHoldingTicker) && (
                            <div className="flex items-center gap-2 mr-2">
                                <button
                                    onClick={() => {
                                        if (selectedHoldingTicker) {
                                            setSelectedTickers(new Set([selectedHoldingTicker]));
                                            setIsDeleteModalOpen(true);
                                        }
                                    }}
                                    className="px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 border border-red-200 dark:border-red-800"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    Delete Holding
                                </button>
                            </div>
                        )}

                        <div className="relative flex-1 md:w-64">
                            <input type="text" placeholder="Search..." value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                            <div className="absolute right-3 top-2.5 text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className={`px-4 py-2 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-2 bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-900/20`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add investments
                            </button>
                        </div>
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
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                        {/* Select All */}
                                        <th className="py-4 px-2 w-[5%] text-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={selectedTickers.size === filteredPortfolio.length && filteredPortfolio.length > 0}
                                                onChange={toggleAllDeletion}
                                            />
                                        </th>
                                        <th className="py-4 px-2 w-[15%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Holding</th>
                                        <th className="py-4 px-2 w-[13%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Shares</th>
                                        <th className="py-4 px-2 w-[13%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Cost per share</th>
                                        <th className="py-4 px-2 w-[13%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Cost basis</th>
                                        <th className="py-4 px-2 w-[13%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Current value</th>
                                        <th className="py-4 px-2 w-[14%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Total profit</th>
                                        <th className="py-4 px-2 w-[14%] font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider text-center">Daily</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredPortfolio.map((position) => (
                                        <tr
                                            key={position.ticker}
                                            onClick={() => handleRowClick(position.ticker)}
                                            className={`transition-colors group cursor-pointer border-b border-gray-100 dark:border-gray-700
                                                ${selectedHoldingTicker === position.ticker
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
                                                    : selectedTickers.has(position.ticker)
                                                        ? 'bg-red-50/10'
                                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/80'}`}
                                        >
                                            <td className="py-4 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                    checked={selectedTickers.has(position.ticker)}
                                                    onChange={(e) => toggleDeletionSelection(position.ticker, e as any)}
                                                />
                                            </td>
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col items-center">
                                                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{position.ticker}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white font-medium">{position.shares}</td>
                                            <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white">{formatPrice(position.averagePrice)}</td>
                                            <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white font-medium">{formatPrice(position.costBasis || 0)}</td>
                                            <td className="py-4 px-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{formatPrice(position.totalValue)}</div>
                                                    <div className="text-xs text-gray-500">{formatPrice(position.currentPrice)}</div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className={`text-sm font-medium ${position.gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        {position.gainLoss >= 0 ? "+" : ""}{formatPrice(position.gainLoss)}
                                                    </div>
                                                    <div className={`text-xs ${position.gainLossPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        {position.gainLossPercent >= 0 ? "▲" : "▼"} {Math.abs(position.gainLossPercent).toFixed(2)}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 text-center">
                                                <div className="flex flex-col items-center">
                                                    <div className={`text-sm font-medium ${position.dailyChange && position.dailyChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        {position.dailyChange && position.dailyChange >= 0 ? "+" : ""}{formatPrice(position.dailyChange || 0)}
                                                    </div>
                                                    <div className={`text-xs ${position.dailyChangePercent && position.dailyChangePercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        {position.dailyChangePercent && position.dailyChangePercent >= 0 ? "▲" : "▼"} {position.dailyChangePercent?.toFixed(2)}%
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 font-semibold">
                                        <td className="py-4 px-2"></td>
                                        <td className="py-4 px-2 text-sm text-gray-900 dark:text-white text-center">Total</td>
                                        <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white">{filteredPortfolio.reduce((acc, p) => acc + p.shares, 0)}</td>
                                        <td className="py-4 px-2"></td>
                                        <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white">{formatPrice(filteredPortfolio.reduce((acc, p) => acc + (p.costBasis || 0), 0))}</td>
                                        <td className="py-4 px-2 text-center text-sm text-gray-900 dark:text-white">{formatPrice(filteredPortfolio.reduce((acc, p) => acc + p.totalValue, 0))}</td>
                                        <td className="py-4 px-2 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`text-sm font-medium ${filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0) >= 0 ? "+" : ""}{formatPrice(filteredPortfolio.reduce((acc, p) => acc + p.gainLoss, 0))}
                                                </div>
                                                <div className={`text-xs ${filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) >= 0 ? "▲" : "▼"} {Math.abs(filteredPortfolio.reduce((acc, p) => acc + p.gainLossPercent, 0) / (filteredPortfolio.length || 1)).toFixed(2)}%
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={`text-sm font-medium ${filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0) >= 0 ? "+" : ""}{formatPrice(filteredPortfolio.reduce((acc, p) => acc + (p.dailyChange || 0), 0))}
                                                </div>
                                                <div className={`text-xs ${filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                    {filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) >= 0 ? "▲" : "▼"} {Math.abs(filteredPortfolio.reduce((acc, p) => acc + (p.dailyChangePercent || 0), 0) / (filteredPortfolio.length || 1)).toFixed(2)}%
                                                </div>
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
                    <div className="bg-sky-600 text-white border border-transparent rounded px-3 py-1.5 flex items-center gap-2 shadow-lg shadow-sky-900/20">
                        25 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    <span>See 1-{filteredPortfolio.length} from {filteredPortfolio.length}</span>
                </div>
            </div>

            <AddTransactionModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={() => { setIsAddModalOpen(false); router.refresh(); }} portfolioId="default_portfolio_id" />

            <EditHoldingModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingHolding(null); }}
                onSuccess={() => { setIsEditModalOpen(false); setEditingHolding(null); if (onRefresh) onRefresh(); }}
                portfolioId={portfolioId}
                holding={editingHolding}
                isReadOnly={false} // Pass real readOnly prop if available in parent
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Holdings"
                message={`Are you sure you want to delete ${selectedTickers.size} selected holdings? This action cannot be undone and will delete all associated transactions.`}
                confirmText={`Delete ${selectedTickers.size} Items`}
                isDestructive={true}
                isLoading={isDeleting}
            />
        </>
    );
}
