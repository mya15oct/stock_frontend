import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { portfolioService } from '@/services/portfolioService';
import { PortfolioCreate } from '@/types/portfolio';

interface CreatePortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newPortfolioId?: string) => void;
}

export default function CreatePortfolioModal({ isOpen, onClose, onSuccess }: CreatePortfolioModalProps) {
    const [formData, setFormData] = useState<PortfolioCreate>({
        user_id: '', // Will be handled by service for now
        name: 'My portfolio',
        currency: 'USD',
        goal_type: 'VALUE',
        target_amount: 1000000,
        note: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const newPortfolioId = await portfolioService.createPortfolio(formData);
            onSuccess(newPortfolioId);
            onClose();
        } catch (err) {
            console.error("Failed to create portfolio:", err);
            setError("Failed to create portfolio. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New portfolio">
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                        {error}
                    </div>
                )}

                {/* Portfolio Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Portfolio name
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        placeholder="e.g. Retirement Fund"
                    />
                </div>

                {/* Currency & Goal */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                            Default currency
                            <span className="text-gray-600 cursor-help" title="Base currency for this portfolio">?</span>
                        </label>
                        <div className="relative">
                            <select
                                value={formData.currency}
                                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white appearance-none focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="USD">USD - US Dollar</option>
                                <option value="EUR">EUR - Euro</option>
                                <option value="VND">VND - Vietnam Dong</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1">
                            Goal
                            <span className="text-gray-600 cursor-help" title="Primary goal of this portfolio">?</span>
                        </label>
                        <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, goal_type: 'VALUE' }))}
                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${formData.goal_type === 'VALUE'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Value
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, goal_type: 'PASSIVE_INCOME' }))}
                                className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${formData.goal_type === 'PASSIVE_INCOME'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Passive income
                            </button>
                        </div>
                    </div>
                </div>

                {/* Target Amount */}
                <div>
                    <div className="flex justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-400">Target Amount</label>
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.target_amount || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, target_amount: parseFloat(e.target.value) }))}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            placeholder="E.g. 1,000,000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{formData.currency}</span>
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                        Notes
                    </label>
                    <textarea
                        value={formData.note || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                        placeholder="Notes..."
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-2">
                    {/* Show "Hide advanced settings" toggle if we had hidden fields, but currently all open as per request (removed broker fields) */}
                    <div className="flex-1"></div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-300 hover:text-white font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Creating...
                            </>
                        ) : (
                            "Create portfolio"
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
