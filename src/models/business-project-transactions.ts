import { Database } from "@/integrations/supabase/types";
import { BusinessProjectModel } from "./business-projects";

export type BusinessProjectTransactionModel = Database["public"]["Tables"]["business_project_transactions"]["Row"] & {
  business_projects: BusinessProjectModel;
};
