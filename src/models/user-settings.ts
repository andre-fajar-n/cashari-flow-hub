import { Database } from "@/integrations/supabase/types";
import { CurrencyModel } from "@/models/currencies";

export type UserSettingsModel = Database["public"]["Tables"]["user_settings"]["Row"] & {
  currencies?: CurrencyModel;
};
