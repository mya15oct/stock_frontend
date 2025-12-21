import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Modal from '@/components/ui/Modal';
import { portfolioService } from '@/services/portfolioService';
import { marketService } from '@/services/marketService';
import { TransactionCreate } from '@/types/portfolio';
import { Transaction } from '@/types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    portfolioId?: string;
    portfolioName?: string;
    initialData?: Transaction | null;
    mode?: 'HOLDING' | 'TRANSACTION';
    prefilledTicker?: string;
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess, portfolioId = 'default_portfolio_id', portfolioName, initialData, mode = 'TRANSACTION', prefilledTicker }: AddTransactionModalProps) {
    const [formData, setFormData] = useState<Partial<TransactionCreate>>({
        portfolio_id: portfolioId,
        ticker: '',
        transaction_type: 'BUY',
        quantity: 0,
        price: 0,
        fee: 0,
        note: ''
    });

    const [dateString, setDateString] = useState<string>(new Date().toISOString().slice(0, 16));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);

    // Validation State
    const [isValidatingTicker, setIsValidatingTicker] = useState(false);
    const [tickerError, setTickerError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    // Dropdown Portal Logic
    const inputRef = useRef<HTMLInputElement>(null);
    const ignoreBlurRef = useRef(false);
    const [dropdownStyle, setDropdownStyle] = useState({});

    // Reset or Initialize form
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Edit Mode
                setFormData({
                    portfolio_id: portfolioId,
                    ticker: initialData.ticker,
                    transaction_type: (initialData.type as 'BUY' | 'SELL') || 'BUY',
                    quantity: initialData.shares,
                    price: initialData.price,
                    fee: initialData.fee || 0,
                    note: initialData.note || ''
                });
                if (initialData.date) {
                    setDateString(new Date(initialData.date).toISOString().slice(0, 16));
                }
            } else {
                // Add Mode - Reset
                setFormData({
                    portfolio_id: portfolioId,
                    ticker: mode === 'TRANSACTION' && prefilledTicker ? prefilledTicker : '',
                    transaction_type: mode === 'HOLDING' ? 'BUY' : 'BUY',
                    quantity: 0,
                    price: 0,
                    fee: 0,
                    note: ''
                });
                setDateString(new Date().toISOString().slice(0, 16));
            }
            setError(null);
            setTickerError(null);
        }
    }, [isOpen, initialData, portfolioId, mode, prefilledTicker]);

    useEffect(() => {
        if (showDropdown && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownStyle({
                top: `${rect.bottom + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`
            });
        }
    }, [showDropdown, searchResults]);

    const handleTickerBlur = async () => {
        if (ignoreBlurRef.current) {
            ignoreBlurRef.current = false;
            return;
        }

        if (!formData.ticker) return;

        // If editing and ticker hasn't changed, skip validation to avoid redundant calls
        if (initialData && formData.ticker === initialData.ticker) return;

        // Short timeout to ensure formData is fresh if needed, but mainly relying on ref check

        setIsValidatingTicker(true);
        setTickerError(null);
        try {
            // Always fetch quote for the hint
            const [checkResult, quote] = await Promise.all([
                marketService.checkStock(formData.ticker),
                marketService.getQuote(formData.ticker)
            ]);

            // Frontend validation
            if (!checkResult || !checkResult.exists) {
                setTickerError(`Ticker '${formData.ticker}' not found`);
                setCurrentPrice(null);
            } else {
                if (quote && quote.currentPrice) {
                    setCurrentPrice(quote.currentPrice);
                    // Only auto-fill form price if it's empty/zero
                    if (!formData.price || formData.price === 0) {
                        setFormData(prev => ({ ...prev, price: quote.currentPrice }));
                    }
                }
            }
        } catch (e) {
            console.error(e);
            // Optional: set generic error if network fails? 
            // setTickerError("Validation failed. Checks network.");
        } finally {
            setIsValidatingTicker(false);
        }
    };

    // Auto-fetch price for pre-filled ticker or when opening in transaction mode
    useEffect(() => {
        if (isOpen && formData.ticker && !tickerError) {
            marketService.getQuote(formData.ticker)
                .then(quote => {
                    if (quote && quote.currentPrice) {
                        setCurrentPrice(quote.currentPrice);
                        if ((!formData.price || formData.price === 0) && mode === 'TRANSACTION') {
                            setFormData(prev => ({ ...prev, price: quote.currentPrice }));
                        }
                    }
                })
                .catch(console.error);
        }
    }, [isOpen, formData.ticker, mode]); // Note: Include formData.ticker to update if it changes programmatically, but be careful of loops. 
    // Actually safe because we only verify existence. Ideally only run if *changed* or *initial*.
    // Since we open modal anew each time, it works.
    // However, if user types, this fires. We just want it for static cases or lazy suggestion. 
    // Given the previous requirement "hint always shows", fetching often is okay if debounce, but here simplest is on mount/prefill.
    // Let's restrict it: only if `currentPrice` is null?

    // Better implementation:
    useEffect(() => {
        if (isOpen && formData.ticker && !currentPrice) {
            marketService.getQuote(formData.ticker)
                .then(quote => {
                    if (quote && quote.currentPrice) setCurrentPrice(quote.currentPrice);
                })
                .catch(e => console.error("Hint fetch failed", e));
        }
    }, [isOpen, formData.ticker]); // Removing currentPrice dependency to avoid constant re-trigger if logic flawed, but adding check inside.
    // Actually, simple is best. Just run it.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent submit if ticker is invalid
        if (tickerError) return;

        setLoading(true);
        setError(null);

        try {
            if (!formData.ticker || !formData.quantity || !formData.price) {
                throw new Error("Please fill in Ticker, Quantity and Price");
            }

            if (formData.quantity <= 0) {
                throw new Error("Quantity must be positive");
            }
            if (formData.price < 0) {
                throw new Error("Price cannot be negative");
            }

            if (initialData) {
                // Update
                await portfolioService.updateTransaction(
                    initialData.id,
                    portfolioId,
                    {
                        ticker: formData.ticker.toUpperCase(),
                        transaction_type: formData.transaction_type as 'BUY' | 'SELL',
                        quantity: Number(formData.quantity),
                        price: Number(formData.price),
                        fee: Number(formData.fee || 0),
                        note: formData.note,
                        date: new Date(dateString).toISOString()
                    }
                );
            } else {
                // Create
                await portfolioService.addTransaction({
                    portfolio_id: portfolioId,
                    ticker: formData.ticker.toUpperCase(),
                    transaction_type: formData.transaction_type as 'BUY' | 'SELL',
                    quantity: Number(formData.quantity),
                    price: Number(formData.price),
                    fee: Number(formData.fee || 0),
                    note: formData.note,
                    date: new Date(dateString).toISOString()
                });
            }

            setFormData({
                portfolio_id: portfolioId,
                ticker: '',
                transaction_type: 'BUY',
                quantity: 0,
                price: 0,
                fee: 0,
                note: ''
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Failed to save transaction:", err);
            setError(err.message || "Failed to save transaction");
        } finally {
            setLoading(false);
        }
    };


    // Portal for dropdown
    const renderDropdown = () => {
        if (!showDropdown || searchResults.length === 0) return null;

        return createPortal(
            <div
                className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded shadow-2xl max-h-60 overflow-y-auto"
                style={dropdownStyle}
                onMouseDown={() => {
                    // Prevent input blur from firing logic immediately if clicked inside dropdown
                    ignoreBlurRef.current = true;
                }}
            >
                {searchResults.map((item: any) => (
                    <div
                        key={item.ticker}
                        className="p-2 hover:bg-gray-700 cursor-pointer text-sm flex justify-between items-center group"
                        onMouseDown={async (e) => {
                            e.preventDefault();
                            ignoreBlurRef.current = true;

                            setFormData(prev => ({ ...prev, ticker: item.ticker }));
                            setSearchResults([]);
                            setShowDropdown(false);
                            setTickerError(null);

                            // Auto-fetch price
                            try {
                                const quote = await marketService.getQuote(item.ticker);
                                if (quote && quote.currentPrice) {
                                    setFormData(prev => ({
                                        ...prev,
                                        ticker: item.ticker,
                                        price: quote.currentPrice
                                    }));
                                    setCurrentPrice(quote.currentPrice);
                                }
                            } catch (e) {
                                console.error("Failed to auto-fetch price", e);
                            }

                            // Explicitly clear any validation pending state
                            setIsValidatingTicker(false);
                        }}
                    >
                        <span className="font-bold text-white">{item.ticker}</span>
                        <span className="text-gray-400 truncate ml-2 text-xs group-hover:text-white">{item.name}</span>
                    </div>
                ))}
            </div>,
            document.body
        );
    };

    const getTitle = () => {
        if (initialData) return "Edit Transaction";
        if (mode === 'HOLDING') return "Add New Holding";
        return `Add Transaction for ${prefilledTicker || '...'}`;
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... */}
                    {/* Simplified for brevity in tool call, will use specific ReplaceChunks for clean update */}
                    {portfolioName && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 -mt-2 mb-4">
                            Adding to: <span className="font-semibold text-gray-900 dark:text-white">{portfolioName}</span>
                        </div>
                    )}
                    {error && <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded">{error}</div>}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-400 mb-1">Ticker</label>
                            <input
                                ref={inputRef}
                                type="text"
                                required
                                disabled={mode === 'TRANSACTION' && !!prefilledTicker}
                                className={`w-full bg-gray-800 border ${tickerError ? 'border-red-500' : 'border-gray-700'} rounded p-2 text-white uppercase focus:ring-1 focus:ring-blue-500 outline-none
                                    ${(mode === 'TRANSACTION' && !!prefilledTicker) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="e.g. AAPL"
                                value={formData.ticker}
                                onChange={async (e) => {
                                    // ... existing onChange logic ...
                                    const val = e.target.value.toUpperCase();
                                    setFormData(prev => ({ ...prev, ticker: val }));
                                    setTickerError(null);

                                    if (val.length >= 1) {
                                        try {
                                            setIsValidatingTicker(true);
                                            const results = await marketService.searchCompanies(val);
                                            setSearchResults(results.slice(0, 5));
                                            setShowDropdown(true);
                                        } catch (e) { console.error(e) } finally { setIsValidatingTicker(false); }
                                    } else {
                                        setSearchResults([]);
                                        setShowDropdown(false);
                                    }
                                }}
                                onBlur={() => {
                                    // Delay hide to allow click
                                    setTimeout(() => setShowDropdown(false), 200);
                                    handleTickerBlur();
                                }}
                                onFocus={() => {
                                    if (searchResults.length > 0) setShowDropdown(true);
                                }}
                            />
                            {isValidatingTicker && (
                                <div className="absolute right-2 top-8">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {tickerError && <p className="text-red-500 text-xs mt-1">{tickerError}</p>}
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Date</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                value={dateString}
                                onChange={e => setDateString(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type selection - Hidden in HOLDING mode */}
                    {mode !== 'HOLDING' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                            <div className="flex bg-gray-800 rounded p-1">
                                <button type="button"
                                    className={`flex-1 py-1.5 text-sm rounded ${formData.transaction_type === 'BUY' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setFormData({ ...formData, transaction_type: 'BUY' })}
                                >BUY</button>
                                <button type="button"
                                    className={`flex-1 py-1.5 text-sm rounded ${formData.transaction_type === 'SELL' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    onClick={() => setFormData({ ...formData, transaction_type: 'SELL' })}
                                >SELL</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantity */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Quantity</label>
                            <input
                                type="number"
                                step="any"
                                min="0.000001"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="0"
                                value={formData.quantity || ''}
                                onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                            />
                        </div>
                        {/* Price */}
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Price</label>
                            <input
                                type="number"
                                step="any"
                                min="0"
                                required
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                                value={formData.price || ''}
                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                            />
                            {formData.ticker && currentPrice !== null && (
                                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                    <span>Market Price: <span className="font-medium text-gray-300">${currentPrice.toLocaleString()}</span></span>
                                </div>
                            )}
                        </div>
                        {/* Fee removed per user request */}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Note (Optional)</label>
                        <textarea
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Strategy note..."
                            value={formData.note || ''}
                            onChange={e => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                        <button type="submit" disabled={loading || !!tickerError} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Processing...' : (initialData ? 'Save Changes' : 'Add Transaction')}
                        </button>
                    </div>
                </form>
            </Modal >
            {renderDropdown()}
        </>
    );
}
