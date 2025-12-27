import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { DEBT_TYPES } from "@/constants/enums";
import { DebtFormData } from "@/form-dto/debts";
import { DebtModel } from "@/models/debts";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {debt ? "Ubah Hutang/Piutang" : "Tambah Hutang/Piutang Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-end gap-2 pt-4">
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
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtDialog;
