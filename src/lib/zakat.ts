/**
 * Zakat Mal Calculation Utilities
 * Based on Islamic jurisprudence for wealth zakat calculation
 */

import { formatAmountCurrency } from '@/lib/currency';

// Nisab constants
export const ZAKAT_CONSTANTS = {
  // Nisab in grams of gold (85 grams according to most scholars)
  NISAB_GOLD_GRAMS: 85,

  // Zakat rate (2.5%)
  ZAKAT_RATE: 0.025,
} as const;

export interface ZakatCalculation {
  totalWealth: number;
  baseCurrency: string;
  nisabInGrams: number;
  goldPricePerGram: number | null;
  nisabInBaseCurrency: number | null;
  isAboveNisab: boolean;
  zakatAmount: number;
  canCalculate: boolean;
  goldPriceDate?: string;
}

/**
 * Calculate zakat mal based on total wealth and gold price
 */
export const calculateZakatMal = (
  totalWealth: number,
  baseCurrency: string,
  goldPricePerGram: number | null,
  goldPriceDate?: string
): ZakatCalculation => {
  const nisabInGrams = ZAKAT_CONSTANTS.NISAB_GOLD_GRAMS;

  // Calculate nisab in base currency
  const nisabInBaseCurrency = goldPricePerGram ? goldPricePerGram * nisabInGrams : null;

  // Check if wealth is above nisab
  const isAboveNisab = nisabInBaseCurrency ? totalWealth >= nisabInBaseCurrency : false;

  // Calculate zakat amount (2.5% of total wealth if above nisab)
  const zakatAmount = isAboveNisab ? totalWealth * ZAKAT_CONSTANTS.ZAKAT_RATE : 0;

  // Can calculate if we have gold price
  const canCalculate = goldPricePerGram !== null;

  return {
    totalWealth,
    baseCurrency,
    nisabInGrams,
    goldPricePerGram,
    nisabInBaseCurrency,
    isAboveNisab,
    zakatAmount,
    canCalculate,
    goldPriceDate,
  };
};

/**
 * Format zakat information for display
 */
export const formatZakatInfo = (calculation: ZakatCalculation) => {
  const {
    nisabInGrams,
    nisabInBaseCurrency,
    isAboveNisab,
    zakatAmount,
    canCalculate,
    baseCurrency,
    goldPriceDate,
  } = calculation;

  return {
    nisabText: `${nisabInGrams} gram emas`,
    nisabAmountText: nisabInBaseCurrency ? formatAmountCurrency(nisabInBaseCurrency, baseCurrency) : 'Tidak dapat dihitung',
    statusText: canCalculate
      ? (isAboveNisab ? 'Wajib Zakat' : 'Belum Mencapai Nisab')
      : 'Tidak dapat dihitung (harga emas tidak tersedia)',
    zakatAmountText: zakatAmount > 0 ? formatAmountCurrency(zakatAmount, baseCurrency) : '-',
    goldPriceDateText: goldPriceDate ? `per ${goldPriceDate}` : '',
  };
};
