export const formatAmountCurrency = (
  amount: number,
  currencyCode: string = 'unknown',
  currencySymbol: string = 'unknown',
  minimumFractionDigits: number = 2
) => {
  const isNegative = amount < 0;
  const showSymbol = currencySymbol !== currencyCode;

  return `${isNegative ? '-' : ''}${currencyCode} ${Math.abs(amount).toLocaleString('id-ID', { minimumFractionDigits })}${showSymbol ? ` ${currencySymbol}` : ''}`;
};