/**
 * Format a price with the given currency symbol (default RM).
 * Used by both server and client; pass symbol from getSettings() or useCurrency().
 */
export function formatPrice(amount: number, symbol: string = 'RM'): string {
  const s = symbol || 'RM'
  const n = Number(amount)
  if (Number.isNaN(n)) return `${s} 0`
  return `${s} ${Math.round(n)}`
}
