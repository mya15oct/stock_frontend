"use client";

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PortfolioPosition } from '@/types';
import { portfolioService } from '@/services/portfolioService';
import { useStealthMode } from '@/contexts/StealthContext';

interface EditHoldingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    portfolioId: string;
    holding: PortfolioPosition | null;
    isReadOnly?: boolean;
}

export default function EditHoldingModal({
    isOpen,
    onClose,
    onSuccess,
    portfolioId,
    holding,
    isReadOnly
}: EditHoldingModalProps) {
    const { formatPrice } = useStealthMode();
    const [shares, setShares] = useState<string>('');
    const [avgPrice, setAvgPrice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize state when holding changes
    useEffect(() => {
        if (holding) {
            setShares(holding.shares.toString());
            setAvgPrice(holding.averagePrice.toString());
        }
    }, [holding, isOpen]);

    // Calculate Deltas
    const currentShares = holding?.shares || 0;
    const currentCost = (holding?.costBasis || (holding?.shares || 0) * (holding?.averagePrice || 0));

    const targetShares = parseFloat(shares) || 0;
    const targetAvgPrice = parseFloat(avgPrice) || 0;
    const targetCost = targetShares * targetAvgPrice;

    const deltaShares = targetShares - currentShares;
    const deltaCost = targetCost - currentCost;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!holding) return;

        setLoading(true);
        setError(null);

        try {
            await portfolioService.adjustHolding(
                portfolioId,
                holding.ticker,
                targetShares,
                targetAvgPrice
            );
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to adjust holding');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !holding) return null;

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-900/75 transition-opacity backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
                                <form onSubmit={handleSubmit}>
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                                        <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-white">
                                            Adjust {holding.ticker} Position
                                        </Dialog.Title>
                                        <button
                                            type="button"
                                            className="rounded-md text-gray-400 hover:text-gray-300 focus:outline-none"
                                            onClick={onClose}
                                        >
                                            <span className="sr-only">Close</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Body */}
                                    <div className="px-6 py-6 space-y-6">
                                        <div className="bg-blue-900/20 p-4 rounded-lg text-sm text-blue-200 border border-blue-900/50">
                                            <div className="flex gap-2">
                                                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>
                                                    Enter the <strong>Actual</strong> values you have. System will create an adjustment transaction to match.
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="shares" className="block text-sm font-medium text-gray-400 mb-1">
                                                    Actual Shares
                                                </label>
                                                <input
                                                    type="number"
                                                    name="shares"
                                                    id="shares"
                                                    step="any"
                                                    required
                                                    value={shares}
                                                    onChange={(e) => setShares(e.target.value)}
                                                    disabled={isReadOnly || loading}
                                                    className="block w-full rounded-lg border-gray-800 bg-gray-950 py-2.5 px-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="avgPrice" className="block text-sm font-medium text-gray-400 mb-1">
                                                    Actual Avg. Price
                                                </label>
                                                <div className="relative rounded-md shadow-sm">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                        <span className="text-gray-500 sm:text-sm">$</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        name="avgPrice"
                                                        id="avgPrice"
                                                        step="any"
                                                        required
                                                        value={avgPrice}
                                                        onChange={(e) => setAvgPrice(e.target.value)}
                                                        disabled={isReadOnly || loading}
                                                        className="block w-full rounded-lg border-gray-800 bg-gray-950 py-2.5 pl-7 pr-3 text-white placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Difference Analysis */}
                                        <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800 space-y-3">
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Adjustment Analysis</h4>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Shares Difference</span>
                                                <span className={`font-mono font-medium ${deltaShares > 0 ? 'text-green-500' : deltaShares < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {deltaShares > 0 ? '+' : ''}{deltaShares}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-400">Cost Basis Adjustment</span>
                                                <span className={`font-mono font-medium ${deltaCost > 0 ? 'text-green-500' : deltaCost < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                                    {deltaCost > 0 ? '+' : ''}{formatPrice(deltaCost)}
                                                </span>
                                            </div>
                                        </div>

                                        {error && (
                                            <div className="text-red-500 text-sm bg-red-900/10 p-3 rounded-lg border border-red-900/50">
                                                {error}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-800/50 px-6 py-4 flex flex-row-reverse gap-3">
                                        <button
                                            type="submit"
                                            disabled={loading || isReadOnly || (deltaShares === 0 && Math.abs(deltaCost) < 0.01)}
                                            className="inline-flex w-full justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Saving...' : 'Confirm Adjustment'}
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-lg bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-gray-700 sm:mt-0 sm:w-auto transition-colors"
                                            onClick={onClose}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
