
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionAssociationFieldsProps {
  control: Control<any>;
  budgets?: any[];
  businessProjects?: any[];
}

const TransactionAssociationFields = ({ control, budgets, businessProjects }: TransactionAssociationFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="budget_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kaitkan dengan Budget (Opsional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih budget" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {budgets?.map((budget) => (
                  <SelectItem key={budget.id} value={budget.id.toString()}>
                    {budget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="business_project_ids"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kaitkan dengan Proyek Bisnis (Opsional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih proyek bisnis" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {businessProjects?.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TransactionAssociationFields;
