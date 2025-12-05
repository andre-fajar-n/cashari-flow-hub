export const formatAmountCurrency = (amount: number, currencyCode: string = 'IDR') => {
  const isNegative = amount < 0;
  return `${isNegative ? '-' : ''}${currencyCode} ${Math.abs(amount).toLocaleString('id-ID')}`;
};