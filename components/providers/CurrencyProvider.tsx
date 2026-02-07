'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { formatPrice as formatPriceUtil } from '@/lib/currency'

type CurrencyContextValue = {
  currencySymbol: string
  formatPrice: (amount: number) => string
  loading: boolean
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currencySymbol: 'RM',
  formatPrice: (amount: number) => formatPriceUtil(amount, 'RM'),
  loading: true,
})

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencySymbol, setCurrencySymbol] = useState('RM')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.ok ? res.json() : { currencySymbol: 'RM' })
      .then((data) => {
        setCurrencySymbol(data.currencySymbol ?? 'RM')
      })
      .catch(() => setCurrencySymbol('RM'))
      .finally(() => setLoading(false))
  }, [])

  const formatPrice = (amount: number) => formatPriceUtil(amount, currencySymbol)

  return (
    <CurrencyContext.Provider value={{ currencySymbol, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    return {
      currencySymbol: 'RM',
      formatPrice: (amount: number) => formatPriceUtil(amount, 'RM'),
      loading: false,
    }
  }
  return ctx
}
