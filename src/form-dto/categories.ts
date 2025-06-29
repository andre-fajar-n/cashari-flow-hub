import { CategoryApplication } from "@/constants/enums";
import { useForm } from "react-hook-form";

export interface CategoryFormData {
  name: string;
  is_income: boolean;
  parent_id: number | null;
  application: CategoryApplication;
};

export const defaultCategoryFormValues = {
  name: "",
  is_income: false,
  parent_id: null,
  application: null,
};
