"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import StockCard from "@/components/shared/StockCard";
import type { PortfolioPosition } from "@/types";
import { portfolioService } from "@/services/portfolioService";
import { useStealthMode } from "@/contexts/StealthContext";

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { formatPrice } = useStealthMode();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await portfolioService.getPortfolio();
        setPortfolio(data);
      } catch (err) {
        setError("Failed to load portfolio data");
        console.error("Error fetching portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-lg">Loading portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);
  const totalGainLoss = portfolio.reduce((sum, item) => sum + item.gainLoss, 0);
  const totalReturnPercent =
    portfolio.reduce((sum, item) => sum + item.gainLossPercent, 0) /
    portfolio.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Portfolio</h1>
        <p className="text-gray-600">
          Track your investment performance and holdings
        </p>
      </div>

      <Card>
        <h2 className="text-2xl font-semibold mb-6">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Total Value
            </p>
            <p className="text-3xl font-bold text-blue-600">
              {formatPrice(totalValue)}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Total Gain/Loss
            </p>
            <p
              className={`text-3xl font-bold ${
                totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalGainLoss >= 0 ? "+" : ""}
              {formatPrice(totalGainLoss)}
            </p>
          </div>
          <div className="text-center md:text-left">
            <p className="text-gray-600 text-sm uppercase tracking-wide">
              Avg Return
            </p>
            <p
              className={`text-3xl font-bold ${
                totalReturnPercent >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalReturnPercent >= 0 ? "+" : ""}
              {totalReturnPercent.toFixed(2)}%
            </p>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Your Holdings</h2>
        {portfolio.length > 0 ? (
          <div className="space-y-4">
            {portfolio.map((position) => (
              <Card key={position.ticker}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{position.ticker}</h3>
                    <p className="text-gray-600">
                      {position.shares} shares @{" "}
                      {formatPrice(position.averagePrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(position.totalValue)}
                    </p>
                    <p
                      className={`${
                        position.gainLoss >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {position.gainLoss >= 0 ? "+" : ""}
                      {formatPrice(position.gainLoss)} (
                      {position.gainLossPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">
                No holdings found in your portfolio.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
