import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatAmountCurrency = (amount: number, currencyCode: string = 'IDR') => {
  return `${currencyCode === 'IDR' ? 'Rp' : currencyCode} ${amount.toLocaleString('id-ID')}`;
};