/**
 * Format a price with the given currency symbol (default RM).
 * Displays the exact value (no rounding); uses 2 decimals when needed.
 */
export function formatPrice(amount: number, symbol: string = 'RM'): string {
  const s = symbol || 'RM'
  const n = Number(amount)
  if (Number.isNaN(n)) return `${s} 0`
  const formatted = n % 1 === 0 ? String(n) : n.toFixed(2)
  return `${s} ${formatted}`
}
