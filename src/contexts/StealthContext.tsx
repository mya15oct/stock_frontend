'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface StealthContextType {
  isStealthMode: boolean
  toggleStealthMode: () => void
  formatPrice: (price: number) => string
  formatNumber: (num: number, suffix?: string) => string
}

const StealthContext = createContext<StealthContextType | undefined>(undefined)

export function StealthProvider({ children }: { children: ReactNode }) {
  const [isStealthMode, setIsStealthMode] = useState(false)

  const toggleStealthMode = () => {
    setIsStealthMode(!isStealthMode)
  }

  const formatPrice = (price: number) => {
    if (isStealthMode) return '••••'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const formatNumber = (num: number, suffix = '') => {
    if (isStealthMode) return '••••'
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T${suffix}`
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B${suffix}`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M${suffix}`
    return num.toLocaleString() + suffix
  }

  return (
    <StealthContext.Provider value={{
      isStealthMode,
      toggleStealthMode,
      formatPrice,
      formatNumber
    }}>
      {children}
    </StealthContext.Provider>
  )
}

export function useStealthMode() {
  const context = useContext(StealthContext)
  if (context === undefined) {
    throw new Error('useStealthMode must be used within a StealthProvider')
  }
  return context
}
