export const formatAmountCurrency = (amount: number, currencyCode: string = 'IDR') => {
  return `${currencyCode === 'IDR' ? 'Rp' : currencyCode} ${amount.toLocaleString('id-ID')}`;
};