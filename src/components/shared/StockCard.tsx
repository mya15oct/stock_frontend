"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Stock } from "@/types";
import { useStealthMode } from "@/contexts/StealthContext";

interface StockCardProps {
  stock: Stock;
}

export default function StockCard({ stock }: StockCardProps) {
  const { formatPrice } = useStealthMode();

  return (
    <Link href={`/stocks/${stock.ticker}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="p-3">
          <div className="flex justify-between items-start gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">{stock.ticker}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm truncate leading-tight">{stock.name}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-base whitespace-nowrap text-gray-900 dark:text-gray-100">{formatPrice(stock.price)}</p>
            </div>
          </div>

          <div className="space-y-0.5">
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">{stock.sector}</p>
            {stock.industry && (
              <p className="text-gray-400 dark:text-gray-500 text-xs italic">{stock.industry}</p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
