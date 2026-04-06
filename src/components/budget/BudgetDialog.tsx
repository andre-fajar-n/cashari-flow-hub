import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BudgetFormData } from "@/form-dto/budget";
import { InputNumber } from "@/components/ui/input-number";
import { BudgetModel } from "@/models/budgets";
import { PiggyBank } from "lucide-react";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BudgetFormData>;
  isLoading: boolean;
  onSubmit: (data: BudgetFormData) => void;
  budget?: BudgetModel;
}

const BudgetDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  budget
}: BudgetDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm shrink-0">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {budget ? "Ubah Budget" : "Tambah Budget Baru"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {budget ? "Perbarui anggaran yang ada" : "Buat anggaran baru untuk periode tertentu"}
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-4 space-y-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Nama budget harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Budget</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama budget" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: "Jumlah harus diisi",
                  min: { value: 0, message: "Jumlah tidak boleh negatif" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <InputNumber {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                rules={{ required: "Tanggal mulai harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                rules={{ required: "Tanggal selesai harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : budget ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDialog;
