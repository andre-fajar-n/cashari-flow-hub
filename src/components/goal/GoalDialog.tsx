import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyDropdown } from "@/components/ui/dropdowns";
import { GoalFormData } from "@/form-dto/goals";
import { CurrencyModel } from "@/models/currencies";
import { GoalModel } from "@/models/goals";

interface GoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<GoalFormData>;
  isLoading: boolean;
  onSubmit: (data: GoalFormData) => void;
  currencies?: CurrencyModel[];
  goal?: GoalModel;
}

const GoalDialog = ({ 
  open, 
  onOpenChange, 
  form, 
  isLoading, 
  onSubmit, 
  currencies,
  goal 
}: GoalDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {goal ? "Ubah Target" : "Tambah Target Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama target harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Target</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama target" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="target_amount"
              rules={{
                required: "Jumlah target harus diisi",
                min: { value: 0, message: "Jumlah harus lebih dari 0" }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah Target</FormLabel>
                  <FormControl>
                    <InputNumber {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CurrencyDropdown
              control={form.control}
              name="currency_code"
              currencies={currencies}
            />

            <FormField
              control={form.control}
              name="target_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Target</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : goal ? "Perbarui" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalDialog;
