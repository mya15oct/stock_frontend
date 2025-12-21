"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PortfolioPosition, Transaction } from "@/types";
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { portfolioService } from "@/services/portfolioService";
import PortfolioOverview from "@/components/portfolio/PortfolioOverview";
import PortfolioHoldings from "@/components/portfolio/PortfolioHoldings";
import PortfolioTransactions from "@/components/portfolio/PortfolioTransactions";
import CreatePortfolioModal from "@/components/portfolio/CreatePortfolioModal";
import AddTransactionModal from "@/components/portfolio/AddTransactionModal";
import PromotionalBanner from "@/components/ui/PromotionalBanner";
import PortfolioEmptyState from "@/components/portfolio/PortfolioEmptyState";

type Tab = "overview" | "holdings" | "transactions";

import { useSearchParams } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

export default function PortfolioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "overview");
  const { user, loading: authLoading } = useAuth(); // Use Auth Context

  useEffect(() => {
    if (tabParam && ["overview", "holdings", "transactions"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);



  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [portfolios, setPortfolios] = useState<import("@/types").Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('default_portfolio_id');
  const selectedPortfolio = portfolios.find(p => p.portfolio_id === selectedPortfolioId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHoldingTicker, setSelectedHoldingTicker] = useState<string | null>(null);
  const [isAddHoldingModalOpen, setIsAddHoldingModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);
  const [isDeletePortfolioModalOpen, setIsDeletePortfolioModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Deselect when changing tabs or portfolios
  useEffect(() => {
    setSelectedHoldingTicker(null);
  }, [selectedPortfolioId, activeTab]);

  useEffect(() => {
    // Auth Check handled by useAuth, but we wait for it
    if (authLoading) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch portfolios using real user ID
        const userPortfolios = await portfolioService.getPortfolios(user.id);
        setPortfolios(userPortfolios);

        if (userPortfolios.length === 0) {
          setPortfolios([]);
          setPortfolio([]);
          setTransactions([]);
          setLoading(false);
          return;
        }

        let currentId = selectedPortfolioId;
        // If selected ID is 'default_portfolio_id' and we have real portfolios, try to pick the first one or find the default one.
        // For now, if we have a list, use the first one if selectedId is not in the list.
        if (userPortfolios.length > 0) {
          // ... (keep existing logic)
          let targetId = currentId;

          // 1. Check LocalStorage first if currentId is default (initial load)
          if (targetId === 'default_portfolio_id') {
            const savedId = localStorage.getItem('lastSelectedPortfolioId');
            if (savedId && userPortfolios.some(p => p.portfolio_id === savedId)) {
              targetId = savedId;
            }
          }

          // 2. Validate targetId exists in list
          const targetExists = userPortfolios.find(p => p.portfolio_id === targetId);
          if (targetExists) {
            currentId = targetId;
            if (targetId !== selectedPortfolioId) {
              setSelectedPortfolioId(targetId);
            }
          } else {
            // Fallback to first portfolio
            currentId = userPortfolios[0].portfolio_id;
            setSelectedPortfolioId(currentId);
          }
        }

        const [portfolioData, transactionsData] = await Promise.all([
          portfolioService.getPortfolio(currentId, true), // Always fetch all data (active + sold)
          portfolioService.getTransactions(currentId),
        ]);
        setPortfolio(portfolioData);
        setTransactions(transactionsData);
        setError(null);
      } catch (err) {
        setError("Failed to load portfolio data");
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger, selectedPortfolioId, user, authLoading]);

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedPortfolioId(newId);
    localStorage.setItem('lastSelectedPortfolioId', newId);
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!loading && portfolios.length === 0) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center overflow-hidden">
        <PortfolioEmptyState onCreatePortfolio={() => setIsCreateModalOpen(true)} />
        <CreatePortfolioModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(newId) => {
            setRefreshTrigger(prev => prev + 1);
            if (newId) {
              setSelectedPortfolioId(newId);
              localStorage.setItem('lastSelectedPortfolioId', newId);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-4 space-y-6">
      {/* Breadcrumb View Indicator */}
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
        <span>Portfolio</span>
        <svg className="w-3 h-3 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-700 dark:text-gray-200 capitalize font-bold">
          {activeTab}
        </span>
      </div>
      <div className="flex justify-between items-start">
        {/* ... (Existing JSX) ... */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Portfolio</h1>
            {portfolios.length > 0 && (
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedPortfolioId}
                    onChange={handlePortfolioChange}
                    className="appearance-none bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 py-1 pl-3 pr-8 rounded-lg text-lg font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {portfolios.map(p => (
                      <option key={p.portfolio_id} value={p.portfolio_id}>{p.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>

                {/* New Portfolio Button (Small +) */}
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="p-2 mr-2 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 rounded-full transition-colors"
                  title="Create New Portfolio"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>

                {/* Delete Portfolio Button */}
                <button
                  onClick={() => setIsDeletePortfolioModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete Portfolio"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your investment performance and holdings
          </p>
        </div>
        <div className="flex gap-3">
          {portfolios.length > 0 && (
            <>
              <button
                onClick={() => setIsAddHoldingModalOpen(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors border border-transparent flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Holding
              </button>

              <div className="relative group">
                <button
                  onClick={() => setIsAddTxModalOpen(true)}
                  disabled={!selectedHoldingTicker}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors border border-transparent flex items-center gap-2 
                    ${selectedHoldingTicker
                      ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300'}`}
                  title={!selectedHoldingTicker ? "Select a holding above to add a transaction" : "Add transaction for selected holding"}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add Transaction
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(newId) => {
          setRefreshTrigger(prev => prev + 1);
          if (newId) {
            setSelectedPortfolioId(newId);
            localStorage.setItem('lastSelectedPortfolioId', newId);
          }
        }}
      />

      <ConfirmModal
        isOpen={isDeletePortfolioModalOpen}
        onClose={() => setIsDeletePortfolioModalOpen(false)}
        onConfirm={async () => {
          setDeleteLoading(true);
          try {
            if (user?.id) {
              await portfolioService.deletePortfolio(selectedPortfolioId, user.id);
              setRefreshTrigger(prev => prev + 1);
              // Reset logic...
              const remaining = portfolios.filter(p => p.portfolio_id !== selectedPortfolioId);
              if (remaining.length > 0) {
                const nextId = remaining[0].portfolio_id;
                setSelectedPortfolioId(nextId);
                localStorage.setItem('lastSelectedPortfolioId', nextId);
              } else {
                setSelectedPortfolioId('default_portfolio_id');
                localStorage.removeItem('lastSelectedPortfolioId');
              }
              setIsDeletePortfolioModalOpen(false);
            }
          } catch (e) {
            setError("Failed to delete portfolio");
            console.error(e);
          } finally {
            setDeleteLoading(false);
          }
        }}
        title="Delete Portfolio"
        message="Are you sure you want to delete this portfolio? This action cannot be undone and will delete all associated holdings and transactions."
        isLoading={deleteLoading}
      />

      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        portfolioId={selectedPortfolioId}
        portfolioName={portfolios.find(p => p.portfolio_id === selectedPortfolioId)?.name || "Demo Portfolio"}
        mode="TRANSACTION"
        prefilledTicker={selectedHoldingTicker || undefined}
      />

      <AddTransactionModal
        isOpen={isAddHoldingModalOpen}
        onClose={() => setIsAddHoldingModalOpen(false)}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        portfolioId={selectedPortfolioId}
        portfolioName={portfolios.find(p => p.portfolio_id === selectedPortfolioId)?.name || "Demo Portfolio"}
        mode="HOLDING"
      />

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && <PortfolioOverview portfolio={portfolio} transactions={transactions} selectedPortfolio={selectedPortfolio} />}
        {activeTab === "holdings" && (
          <PortfolioHoldings
            portfolio={portfolio}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            portfolioId={selectedPortfolioId}
            selectedHoldingTicker={selectedHoldingTicker}
            onSelectHolding={setSelectedHoldingTicker}
          />
        )}
        {activeTab === "transactions" && (
          <PortfolioTransactions
            transactions={transactions}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            portfolioId={selectedPortfolioId}
          />
        )}
      </div>
    </div>
  );
}
