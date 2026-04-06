import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { DEBT_TYPES } from "@/constants/enums";
import { DebtFormData } from "@/form-dto/debts";
import { DebtModel } from "@/models/debts";
import { Landmark } from "lucide-react";

interface DebtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DebtFormData>;
  isLoading: boolean;
  onSubmit: (data: DebtFormData) => void;
  debt?: DebtModel;
}

const DebtDialog = ({ 
  open, 
  onOpenChange, 
  form, 
  isLoading, 
  onSubmit,
  debt 
}: DebtDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] max-h-[90vh] overflow-y-auto p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 border border-primary/20 shadow-sm shrink-0">
              <Landmark className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {debt ? "Ubah Hutang/Piutang" : "Tambah Hutang/Piutang Baru"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {debt ? "Perbarui detail hutang atau piutang" : "Catat hutang atau piutang baru"}
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
                rules={{ required: "Nama harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama hutang/piutang" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Dropdown
                control={form.control}
                name="type"
                label="Tipe"
                placeholder="Pilih tipe"
                options={[
                  { value: DEBT_TYPES.LOAN, label: "Hutang" },
                  { value: DEBT_TYPES.BORROWED, label: "Piutang" }
                ]}
                rules={{ required: "Tipe harus dipilih" }}
              />

              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Jatuh Tempo</FormLabel>
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
                  {isLoading ? "Menyimpan..." : debt ? "Perbarui" : "Simpan"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtDialog;
