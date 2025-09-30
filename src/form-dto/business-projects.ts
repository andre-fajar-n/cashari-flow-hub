export interface BusinessProjectFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export const defaultBusinessProjectFormValues: BusinessProjectFormData = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
};
