import { CategoryApplication } from "@/constants/enums";

export interface CategoryModel {
  id: number;
  name: string;
  is_income: boolean;
  parent_id: number | null;
  application: CategoryApplication | null;
}