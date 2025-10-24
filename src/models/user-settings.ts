import { Database } from "@/integrations/supabase/types";

export type UserSettingsModel = Database["public"]["Tables"]["user_settings"]["Row"];
