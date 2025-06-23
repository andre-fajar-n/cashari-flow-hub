
import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TransactionAssociationFieldsProps {
  control: Control<any>;
  debts?: any[];
  budgets?: any[];
  businessProjects?: any[];
}

const TransactionAssociationFields = ({ control, debts, budgets, businessProjects }: TransactionAssociationFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="debt_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kaitkan dengan Hutang/Piutang (Opsional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hutang/piutang" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Tidak ada</SelectItem>
                {debts?.map((debt) => (
                  <SelectItem key={debt.id} value={debt.id.toString()}>
                    {debt.name} ({debt.type === 'loan' ? 'Hutang' : 'Piutang'})
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
        name="budget_id"
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
        name="business_project_id"
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
