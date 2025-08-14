import { CategoryApplication } from "@/constants/enums";

export interface CategoryFormData {
  name: string;
  is_income: boolean;
  parent_id: number | null;
  application: CategoryApplication | null;
};

export const defaultCategoryFormValues = {
  name: "",
  is_income: false,
  parent_id: null,
  application: null,
};
