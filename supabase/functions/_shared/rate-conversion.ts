export const rateConversion = (fromCurrency: string, rate: number) => {
  if (fromCurrency === "XAU") {
    return rate / 31.1034768;
  }
  return rate;
};
