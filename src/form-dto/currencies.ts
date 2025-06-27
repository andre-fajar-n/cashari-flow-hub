export interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
};

export const defaultCurrencyFormValues: CurrencyFormData = {
  name: '',
  symbol: '',
  code: '',
};
