export interface WalletFormData {
  name: string;
  currency_code: string;
  initial_amount: number;
}

export const defaultWalletFormValues: WalletFormData = {
  name: "",
  currency_code: "",
  initial_amount: 0,
};
