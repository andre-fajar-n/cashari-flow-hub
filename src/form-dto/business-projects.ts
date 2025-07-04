export interface ProjectFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

export const defaultProjectFormValues: ProjectFormData = {
  name: "",
  description: "",
  start_date: "",
  end_date: "",
};
