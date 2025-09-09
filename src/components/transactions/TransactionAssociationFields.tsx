import { Control } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";

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
            <FormControl>
              <SearchableMultiSelect
                placeholder="Pilih budget"
                searchPlaceholder="Cari budget..."
                options={(budgets || []).map((b:any) => ({
                  label: b.name,
                  value: b.id.toString()
                }))}
                value={(field.value || []).map((id: number) => id.toString())}
                onValueChange={(values) => field.onChange(values.map(v => parseInt(v)))}
              />
            </FormControl>
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
            <FormControl>
              <SearchableMultiSelect
                placeholder="Pilih proyek bisnis"
                searchPlaceholder="Cari proyek bisnis..."
                options={(businessProjects || []).map((p:any) => ({
                  label: p.name,
                  value: p.id.toString()
                }))}
                value={(field.value || []).map((id: number) => id.toString())}
                onValueChange={(values) => field.onChange(values.map(v => parseInt(v)))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default TransactionAssociationFields;
