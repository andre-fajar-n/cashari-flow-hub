import { Database } from "@/integrations/supabase/types";

export type CategoryModel = Database["public"]["Tables"]["categories"]["Row"];

// Partial category type for relational queries - DRY using Pick<>
export type CategoryRelation = Pick<CategoryModel, "id" | "name" | "is_income" | "parent_id" | "application">;
