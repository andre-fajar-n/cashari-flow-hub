export const formatAmountCurrency = (amount: number, currencyCode: string = 'unknown', currencySymbol: string = 'unknown') => {
  const isNegative = amount < 0;
  const showSymbol = currencySymbol !== currencyCode;
  return `${isNegative ? '-' : ''}${currencyCode} ${Math.abs(amount).toLocaleString('id-ID', { minimumFractionDigits: 4 })}${showSymbol ? ` ${currencySymbol}` : ''}`;
};