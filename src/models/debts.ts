import { Database } from "@/integrations/supabase/types";

export interface DebtModel {
  id: number;
  name: string;
  type: Database["public"]["Enums"]["debt_type"];
  currency_code: string;
  due_date: string;
  status: Database["public"]["Enums"]["debt_statuses"];
  created_at: string;
}
