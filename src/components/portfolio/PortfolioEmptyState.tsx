"use client";

import Image from "next/image";

interface PortfolioEmptyStateProps {
    onCreatePortfolio: () => void;
}

export default function PortfolioEmptyState({ onCreatePortfolio }: PortfolioEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="relative w-48 h-48 mb-6">
                <Image
                    src="/images/empty-portfolio.png"
                    alt="Empty Portfolio"
                    fill
                    className="object-contain opacity-80"
                    priority
                />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Start Tracking Your Investments
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                Create your first portfolio to track holdings, analyze performance, and make smarter investment decisions.
            </p>
            <button
                onClick={onCreatePortfolio}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Portfolio
            </button>
        </div>
    );
}
