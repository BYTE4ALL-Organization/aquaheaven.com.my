import { prisma } from '@/lib/prisma'

const DEFAULT_CURRENCY_SYMBOL = 'RM'

export type SiteSettings = {
  currencySymbol: string
}

export async function getSettings(): Promise<SiteSettings> {
  try {
    const row = await prisma.setting.findUnique({
      where: { key: 'currencySymbol' },
    })
    return {
      currencySymbol: row?.value ?? DEFAULT_CURRENCY_SYMBOL,
    }
  } catch {
    return { currencySymbol: DEFAULT_CURRENCY_SYMBOL }
  }
}

export async function setCurrencySymbol(symbol: string): Promise<void> {
  const value = (symbol || DEFAULT_CURRENCY_SYMBOL).trim() || DEFAULT_CURRENCY_SYMBOL
  await prisma.setting.upsert({
    where: { key: 'currencySymbol' },
    create: { key: 'currencySymbol', value },
    update: { value },
  })
}
