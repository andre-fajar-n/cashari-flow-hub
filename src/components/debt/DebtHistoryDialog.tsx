import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { InputNumber } from "@/components/ui/input-number";
import { DebtHistoryFormData } from "@/form-dto/debt-histories";
import { DebtHistoryModel } from "@/models/debt-histories";
import { WalletModel } from "@/models/wallets";
import { CategoryModel } from "@/models/categories";
import { DebtModel } from "@/models/debts";

interface DebtHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<DebtHistoryFormData>;
  isLoading: boolean;
  onSubmit: (data: DebtHistoryFormData) => void;
  history?: DebtHistoryModel;
  showDebtSelection?: boolean; // Control debt selection visibility
  // Data props
  wallets?: WalletModel[];
  categories?: CategoryModel[];
  debts?: DebtModel[];
}

const DebtHistoryDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  history,
  showDebtSelection = false,
  wallets,
  categories,
  debts
}: DebtHistoryDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{(history ? "Ubah" : "Tambah") + " History Pembayaran"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {showDebtSelection && (
              <Dropdown
                control={form.control}
                name="debt_id"
                label="Hutang/Piutang"
                placeholder="Pilih hutang/piutang"
                options={[
                  { value: "none", label: "Pilih hutang/piutang" },
                  ...(debts?.map((debt) => ({
                    value: debt.id.toString(),
                    label: `${debt.name} (${debt.type === 'loan' ? 'Hutang' : 'Piutang'})`
                  })) || [])
                ]}
                rules={{ required: "Hutang/Piutang harus dipilih" }}
              />
            )}

            <FormField
              control={form.control}
              name="amount"
              rules={{ required: "Jumlah harus diisi", min: { value: 0, message: "Jumlah harus lebih dari 0" } }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah</FormLabel>
                  <FormControl>
                    <InputNumber
                      {...field}
                      onChange={(value) => field.onChange(value || 0)}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Dropdown
              control={form.control}
              name="wallet_id"
              label="Dompet"
              placeholder="Pilih dompet"
              options={[
                { value: "none", label: "Pilih dompet" },
                ...(wallets?.map((wallet) => ({
                  value: wallet.id.toString(),
                  label: `${wallet.name} (${wallet.currency_code})`
                })) || [])
              ]}
              rules={{ required: "Dompet harus dipilih" }}
            />

            <Dropdown
              control={form.control}
              name="category_id"
              label="Kategori"
              placeholder="Pilih kategori"
              options={[
                { value: "none", label: "Pilih kategori" },
                ...(categories?.map((category) => ({
                  value: category.id.toString(),
                  label: category.name
                })) || [])
              ]}
              rules={{ required: "Kategori harus dipilih" }}
            />

            <FormField
              control={form.control}
              name="date"
              rules={{ required: "Tanggal harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Masukkan deskripsi" {...field} />
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
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DebtHistoryDialog;
