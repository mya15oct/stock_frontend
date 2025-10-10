'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Stock } from '../types/shared'
import { useStealthMode } from '@/contexts/StealthContext'

interface StockCardProps {
  stock: Stock
}

export default function StockCard({ stock }: StockCardProps) {
  const { formatPrice } = useStealthMode()

  return (
    <Link href={`/stocks/${stock.ticker}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{stock.ticker}</h3>
            <p className="text-gray-600 text-sm">{stock.name}</p>
            <p className="text-gray-500 text-xs">{stock.sector}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-lg">{formatPrice(stock.price)}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
