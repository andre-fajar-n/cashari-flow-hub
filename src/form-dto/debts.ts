import { Database } from "@/integrations/supabase/types";

export interface DebtFormData {
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  currency_code: string;
  due_date: string;
}

export const defaultDebtFormValues: DebtFormData = {
  name: "",
  type: "loan",
  currency_code: "IDR",
  due_date: "",
};
