import { Database } from "@/integrations/supabase/types";

export interface DebtFormData {
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  due_date: string;
}

export const defaultDebtFormValues: DebtFormData = {
  name: "",
  type: "loan",
  due_date: "",
};
