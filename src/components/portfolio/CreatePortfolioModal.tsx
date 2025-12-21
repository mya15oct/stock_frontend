import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { portfolioService } from '@/services/portfolioService';
import { PortfolioCreate } from '@/types/portfolio';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newPortfolioId?: string) => void;
}

export default function CreatePortfolioModal({ isOpen, onClose, onSuccess }: CreatePortfolioModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<PortfolioCreate>({
        user_id: '',
        name: 'My portfolio',
        currency: 'USD',
        goal_type: 'VALUE',
        target_amount: 1000000,
        note: ''
    });

    // Update user_id when user is available
    useEffect(() => {
        if (user?.id) {
            setFormData(prev => ({ ...prev, user_id: user.id }));
        }
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Client-side validation
        if (formData.target_amount && formData.target_amount > 600000000000) {
            setError("Amount is too large, please enter a smaller target amount");
            setLoading(false);
            return;
        }

        try {
            const newPortfolioId = await portfolioService.createPortfolio(formData);
            onSuccess(newPortfolioId);
            onClose();
        } catch (err: any) {
            console.error("Failed to create portfolio:", err);
            // Error message is handled by apiClient
            const message = err.message || "Failed to create portfolio. Please try again.";

            // User-friendly message for duplicates
            if (message.includes("already exists")) {
                setError("A portfolio with this name already exists. Please choose a different name.");
            } else {
                setError(message);
            }
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
                <div className="hidden">
                    {/* Currency field removed from UI, defaulting to USD */}
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
