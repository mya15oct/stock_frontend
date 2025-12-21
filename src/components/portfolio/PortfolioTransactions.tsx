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
    portfolioId: string;
}

export default function PortfolioTransactions({ transactions, onRefresh, portfolioId }: PortfolioTransactionsProps) {
    const { formatPrice } = useStealthMode();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialFilter = searchParams.get('filter') || '';
    const [filter, setFilter] = useState(initialFilter);

    const filteredTransactions = transactions.filter(t => {
        // Filter by text
        if (filter && !t.ticker?.toLowerCase().includes(filter.toLowerCase())) return false;
        return true;
    });

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

    const handleSuccess = () => {
        router.refresh();
        if (onRefresh) onRefresh();
    };

    return (
        <div className="space-y-4">
            {/* Top Controls */}
            <div className="flex flex-col md:flex-row justify-end md:items-center gap-4">
                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Placeholder for future actions if needed */}
                </div>
            </div>

            <Card className="!p-0 overflow-hidden bg-[#1E1E2D]">
                {filteredTransactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse table-fixed">
                            <thead>
                                <tr className="border-b border-sky-500/20 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="py-4 px-2 w-[12.5%] text-center">Operation</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Holding</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Date</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Shares</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Price</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Summ</th>
                                    <th className="py-4 px-2 w-[12.5%] text-center">Total profit</th>
                                    <th className="py-4 px-2 w-[12.5%] text-left">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sky-500/20">
                                {filteredTransactions.map((tx) => (
                                    <tr
                                        key={tx.id}
                                        className="hover:bg-sky-500/5 transition-colors group text-sm"
                                    >
                                        <td className="py-4 px-2 text-center">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOperationColor(tx.type)}`}>
                                                {tx.type === 'BUY' && 'Buy'}
                                                {tx.type === 'SELL' && 'Sell'}
                                                {tx.type === 'DIVIDEND' && 'Dividend'}
                                                {tx.type === 'DEPOSIT' && 'Deposit'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            {tx.ticker ? (
                                                <div className="flex flex-col items-center">
                                                    <span className="font-medium text-gray-900 dark:text-white">{tx.name}</span>
                                                    <span className="text-xs text-gray-500">{tx.ticker}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-2 text-center text-gray-900 dark:text-white">
                                            {tx.date ? new Date(tx.date).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="py-4 px-2 text-center text-gray-900 dark:text-white">
                                            {tx.shares}
                                        </td>
                                        <td className="py-4 px-2 text-center text-gray-900 dark:text-white">
                                            {formatPrice(tx.price || 0)}
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            <span className={tx.type === 'BUY' ? 'text-red-400' : 'text-green-400'}>
                                                {tx.type === 'BUY' ? '-' : '+'}{formatPrice(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            {tx.totalProfit !== undefined ? (
                                                <div className="flex flex-col items-center">
                                                    <span className={`font-medium ${tx.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.totalProfit >= 0 ? '▲' : '▼'} {((tx.totalProfit / tx.amount) * 100).toFixed(2)}%
                                                    </span>
                                                    <span className={`text-xs ${tx.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {tx.totalProfit >= 0 ? '+' : ''}{formatPrice(tx.totalProfit)}
                                                    </span>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="py-4 px-2 text-left text-gray-500 truncate" title={tx.note || `${tx.type} ${tx.ticker} ${tx.shares} @ ${formatPrice(tx.price || 0)}`}>
                                            {tx.note ? tx.note : (
                                                <span className="opacity-50 italic">
                                                    {tx.type} {tx.ticker} {tx.shares} @ {formatPrice(tx.price || 0)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {/* Total Row */}
                                <tr className="border-t border-sky-500/20 bg-sky-500/5 font-semibold text-sm">
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4 text-center text-gray-700 dark:text-white">Total</td>
                                    <td className="py-4 px-4"></td>
                                    <td className="py-4 px-4 text-center text-gray-900 dark:text-white">
                                        {filteredTransactions.reduce((acc, t) => acc + (t.type === 'BUY' ? (t.shares || 0) : -(t.shares || 0)), 0)}
                                    </td>
                                    <td className="py-4 px-4"></td>

                                    <td className="py-4 px-4 text-center text-red-400">
                                        -{formatPrice(filteredTransactions.reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : 0), 0))}
                                    </td>
                                    <td className="py-4 px-4 text-center">
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

            <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="bg-sky-600 border border-transparent rounded px-3 py-1.5 flex items-center gap-2 text-white shadow-lg shadow-sky-900/20">
                    25 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <span>See 1-{filteredTransactions.length} from {filteredTransactions.length}</span>
            </div>

            <AddTransactionModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleSuccess}
                portfolioName="Current Portfolio"
                portfolioId={portfolioId}
                initialData={editingTransaction}
            />


        </div>
    );
}
