"use client";

import { Card } from "@/components/ui/Card";
import { Transaction } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";
import { useState, useEffect } from "react";
import { portfolioService } from '@/services/portfolioService';
import { useRouter, useSearchParams } from 'next/navigation';
import AddTransactionModal from './AddTransactionModal';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface PortfolioTransactionsProps {
    transactions: Transaction[];
    onRefresh?: () => void;
}

export default function PortfolioTransactions({ transactions, onRefresh }: PortfolioTransactionsProps) {
    const { formatPrice } = useStealthMode();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialTab = searchParams.get('tab') as 'trades' | 'incomes' | 'all' | null;
    const initialFilter = searchParams.get('filter') || '';
    const selectTicker = searchParams.get('selectTicker');
    const mode = searchParams.get('mode');

    const [activeTab, setActiveTab] = useState<'trades' | 'incomes' | 'all'>(initialTab || 'trades');
    const [filter, setFilter] = useState(initialFilter);

    // Selection state
    const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
    const [isDeleting, setIsDeleting] = useState(false);

    // Effect to handle auto-selection from URL
    useEffect(() => {
        if (selectTicker && transactions.length > 0) {
            const matchingAndTypes = transactions.filter(t => t.ticker === selectTicker);

            if (matchingAndTypes.length > 0) {
                // Auto-select the rows
                setSelectedTxIds(new Set(matchingAndTypes.map(t => t.id)));

                // Auto-open Edit Modal if mode=edit and exactly one transaction
                if (mode === 'edit' && matchingAndTypes.length === 1) {
                    setEditingTransaction(matchingAndTypes[0]);
                    setIsEditModalOpen(true);

                    // Optional: Clean up URL to prevent re-opening on refresh? 
                    // Leaving it for now as router.replace might cause flicker
                }
            }
        }
    }, [selectTicker, mode, transactions]);

    const filteredTransactions = transactions.filter(t => {
        // Filter by tab
        if (activeTab === 'trades' && !['BUY', 'SELL'].includes(t.type)) return false;
        if (activeTab === 'incomes' && !['DIVIDEND'].includes(t.type)) return false;

        // Filter by text
        if (filter && !t.ticker?.toLowerCase().includes(filter.toLowerCase())) return false;
        return true;
    });

    // Handlers
    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedTxIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedTxIds(newSet);
    };

    const toggleAll = () => {
        if (selectedTxIds.size === filteredTransactions.length && filteredTransactions.length > 0) {
            setSelectedTxIds(new Set());
        } else {
            setSelectedTxIds(new Set(filteredTransactions.map(t => t.id)));
        }
    };

    const handleDeleteSelected = async () => {
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await Promise.all(
                Array.from(selectedTxIds).map(id => portfolioService.deleteTransaction(id))
            );
            setSelectedTxIds(new Set());
            router.refresh();
            if (onRefresh) onRefresh();
            setIsDeleteConfirmOpen(false);
        } catch (error) {
            console.error("Failed to delete transactions", error);
            alert("Failed to delete some transactions");
        } finally {
            setIsDeleting(false);
        }
    };

    const getOperationColor = (type: string) => {
        switch (type) {
            case 'BUY': return 'text-green-500 bg-green-500/10';
            case 'SELL': return 'text-red-500 bg-red-500/10';
            case 'DIVIDEND': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    // State for Modals
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    const handleEdit = () => {
        if (selectedTxIds.size !== 1) return;
        const txId = Array.from(selectedTxIds)[0];
        const tx = transactions.find(t => t.id === txId);
        if (tx) {
            setEditingTransaction(tx);
            setIsEditModalOpen(true);
        }
    };

    const handleSuccess = () => {
        router.refresh();
        if (onRefresh) onRefresh();
        setSelectedTxIds(new Set());
    };

    return (
        <div className="space-y-4">
            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                {/* ... (Tabs) ... */}
                <div className="flex items-center gap-8 border-b border-transparent">
                    <button
                        onClick={() => setActiveTab('trades')}
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'trades' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        Trades
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('incomes')}
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'incomes' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        Incomes
                    </button> */}
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'all' ? 'border-white text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                    >
                        All
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Bulk Actions */}
                    {selectedTxIds.size > 0 && (
                        <div className="flex items-center gap-2 mr-2">
                            {selectedTxIds.size === 1 && (
                                <button
                                    onClick={handleEdit}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={handleDeleteSelected}
                                disabled={isDeleting}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                Delete ({selectedTxIds.size})
                            </button>
                        </div>
                    )}
                    {/* ... (Other buttons) ... */}
                    <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                        Import
                    </button>
                    <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Import history
                    </button>
                    <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Export
                    </button>
                </div>
            </div>

            {/* ... (Rest of component) ... */}

            <Card className="!p-0 overflow-hidden bg-[#1E1E2D]">
                {filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="py-3 px-4 w-10">
                                        <input
                                            type="checkbox"
                                            className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                            checked={selectedTxIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                                            onChange={toggleAll}
                                        />
                                    </th>
                                    <th className="py-3 px-4">Operation</th>
                                    <th className="py-3 px-4">Holding</th>
                                    <th className="py-3 px-4 text-right">Date</th>
                                    <th className="py-3 px-4 text-right">Shares</th>
                                    <th className="py-3 px-4 text-right">Price</th>
                                    {/* <th className="py-3 px-4 text-right">Fee / Tax</th> */}
                                    <th className="py-3 px-4 text-right">Summ</th>
                                    <th className="py-3 px-4 text-right">Total profit</th>
                                    <th className="py-3 px-4">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className={`hover:bg-gray-800/50 transition-colors group text-sm cursor-pointer ${selectedTxIds.has(tx.id) ? 'bg-blue-900/10' : ''}`}
                                        onClick={(e) => {
                                            // Handle row click for selection if not clicking specific elements
                                            if ((e.target as HTMLElement).tagName === 'INPUT') return;
                                            toggleSelection(tx.id);
                                        }}
                                    >
                                        <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
                                                checked={selectedTxIds.has(tx.id)}
                                                onChange={() => toggleSelection(tx.id)}
                                            />
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOperationColor(tx.type)}`}>
                                                {tx.type === 'BUY' && 'Buy'}
                                                {tx.type === 'SELL' && 'Sell'}
                                                {tx.type === 'DIVIDEND' && 'Dividend'}
                                                {tx.type === 'DEPOSIT' && 'Deposit'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {tx.ticker ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white">{tx.name}</span>
                                                    <span className="text-xs text-gray-500">{tx.ticker}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white">
                                            {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white">
                                            {tx.shares}
                                        </td>
                                        <td className="py-3 px-4 text-right text-white">
                                            {formatPrice(tx.price || 0)}
                                        </td>
                                        {/* <td className="py-3 px-4 text-right text-gray-400">
                                            {formatPrice(tx.fee || 0)}
                                        </td> */}
                                        <td className="py-3 px-4 text-right">
                                            <span className={tx.type === 'BUY' ? 'text-red-400' : 'text-green-400'}>
                                                {tx.type === 'BUY' ? '-' : '+'}{formatPrice(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {tx.totalProfit !== undefined ? (
                                                <div className="flex flex-col items-end">
                                                    <span className={`font-medium ${tx.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.totalProfit >= 0 ? '▲' : '▼'} {((tx.totalProfit / tx.amount) * 100).toFixed(2)}%
                                                    </span>
                                                    <span className={`text-xs ${tx.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.totalProfit >= 0 ? '+' : ''}{formatPrice(tx.totalProfit)}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {/* Note Icon */}
                                            {tx.note && (
                                                <svg className="w-4 h-4 hover:text-white cursor-pointer" fill="currentColor" viewBox="0 0 20 20" title={tx.note}>
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </td>
                                    </tr>
                                ))}

                                {/* Total Row */}
                                <tr className="border-t border-gray-700 bg-gray-800/30 font-semibold text-sm">
                                    <td className="py-4 px-4"></td> {/* Checkbox placeholder */}
                                    <td className="py-4 px-4 text-white">Total</td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4 text-right text-white">
                                        {filteredTransactions.reduce((acc, t) => acc + (t.type === 'BUY' ? (t.shares || 0) : -(t.shares || 0)), 0)}
                                    </td>
                                    <td className="py-4 px-4"></td>
                                    {/* <td className="py-4 px-4 text-right text-white">$0.00</td> */}
                                    <td className="py-4 px-4 text-right text-red-400">
                                        -{formatPrice(filteredTransactions.reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : 0), 0))}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className={`text-sm font-medium ${filteredTransactions.reduce((acc, t) => acc + (t.totalProfit || 0), 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                            {filteredTransactions.reduce((acc, t) => acc + (t.totalProfit || 0), 0) >= 0 ? "+" : ""}{formatPrice(filteredTransactions.reduce((acc, t) => acc + (t.totalProfit || 0), 0))}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No transactions found.
                    </div>
                )}
            </Card>

            {/* Pagination */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="bg-gray-800 border border-gray-700 rounded px-3 py-1.5 flex items-center gap-2 text-white">
                    25 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <span>See 1-{filteredTransactions.length} from {filteredTransactions.length}</span>
            </div>

            <AddTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                portfolioName="Default Portfolio"
                initialData={editingTransaction}
            />

            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Transactions"
                message={`Are you sure you want to delete ${selectedTxIds.size} transactions? This action cannot be undone.`}
                confirmText={`Delete ${selectedTxIds.size} Items`}
                isDestructive={true}
                isLoading={isDeleting}
            />
        </div>
    );
}
