import { CurrencyModel } from "@/models/currencies";

export interface WalletModel {
  id: number;
  name: string;
  currency_code: string;
  initial_amount: number;
  currency?: CurrencyModel;
}
