import { BusinessProjectModel } from "@/models/business-projects";

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

export const mapBusinessProjectToFormData = (project: BusinessProjectModel): BusinessProjectFormData => ({
  name: project.name || "",
  description: project.description || "",
  start_date: project.start_date || "",
  end_date: project.end_date || "",
});
