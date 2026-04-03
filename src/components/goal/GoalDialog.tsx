import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CurrencyDropdown } from "@/components/ui/dropdowns";
import { GoalFormData } from "@/form-dto/goals";
import { CurrencyModel } from "@/models/currencies";
import { GoalModel } from "@/models/goals";
import { Target, Edit } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px] p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-background">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 shrink-0">
              {goal ? <Edit className="h-4.5 w-4.5 text-primary" /> : <Target className="h-4.5 w-4.5 text-primary" />}
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {goal ? "Ubah Target" : "Tambah Target Baru"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {goal ? "Perbarui informasi target keuangan" : "Buat target keuangan baru"}
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-4">
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
            </div>

            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-muted/20">
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
