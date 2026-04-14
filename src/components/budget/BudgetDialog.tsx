import { UseFormReturn, useWatch } from "react-hook-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { BudgetFormData, BudgetType, RolloverType } from "@/form-dto/budget";
import { InputNumber } from "@/components/ui/input-number";
import { BudgetModel } from "@/models/budgets";
import { PiggyBank, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/queries/use-categories";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<BudgetFormData>;
  isLoading: boolean;
  onSubmit: (data: BudgetFormData) => void;
  budget?: BudgetModel;
}

const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  kustom: "Kustom (rentang tanggal tetap)",
  bulanan: "Bulanan (berulang setiap bulan)",
  tahunan: "Tahunan (berulang setiap tahun)",
};

const ROLLOVER_TYPE_LABELS: Record<RolloverType, string> = {
  none: "Tidak ada rollover — mulai baru setiap periode",
  add_remaining: "Sisa ditambahkan — sisa anggaran dibawa ke periode berikutnya",
  full: "Rollover penuh — sisa dan kelebihan mempengaruhi periode berikutnya",
};

const BudgetDialog = ({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
  budget
}: BudgetDialogProps) => {
  const { data: categories } = useCategories(false); // expense categories only
  const budgetType = useWatch({ control: form.control, name: "budget_type" });
  const selectedCategoryIds = useWatch({ control: form.control, name: "category_ids" }) || [];

  const isRecurring = budgetType === "bulanan" || budgetType === "tahunan";

  const toggleCategory = (categoryId: number) => {
    const current = form.getValues("category_ids") || [];
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    form.setValue("category_ids", updated);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-0">
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
              {/* Name */}
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

              {/* Amount */}
              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: "Jumlah harus diisi",
                  min: { value: 0, message: "Jumlah tidak boleh negatif" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Limit</FormLabel>
                    <FormControl>
                      <InputNumber {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Budget Type */}
              <FormField
                control={form.control}
                name="budget_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Budget</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        // Reset end_date for recurring types
                        if (val !== "kustom") {
                          form.setValue("end_date", null);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tipe budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.entries(BUDGET_TYPE_LABELS) as [BudgetType, string][]).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Date */}
              <FormField
                control={form.control}
                name="start_date"
                rules={{ required: "Tanggal mulai harus diisi" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isRecurring ? "Mulai Berlaku (Bulan Pertama)" : "Tanggal Mulai"}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date — only for Kustom */}
              {!isRecurring && (
                <FormField
                  control={form.control}
                  name="end_date"
                  rules={{ required: "Tanggal selesai harus diisi" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Selesai</FormLabel>
                      <FormControl>
                        <Input type="date" value={field.value || ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Rollover Type — only for recurring */}
              {isRecurring && (
                <FormField
                  control={form.control}
                  name="rollover_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Konfigurasi Rollover
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">Tentukan bagaimana sisa/kelebihan anggaran periode sebelumnya diperlakukan pada periode berikutnya.</p>
                          </TooltipContent>
                        </Tooltip>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih konfigurasi rollover" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.entries(ROLLOVER_TYPE_LABELS) as [RolloverType, string][]).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Category Association */}
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1">
                  Kategori (opsional)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">Pilih kategori pengeluaran yang termasuk dalam budget ini. Biarkan kosong untuk anggaran amplop tanpa filter kategori.</p>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                {categories && categories.length > 0 ? (
                  <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-muted/20">
                    {categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/40 rounded px-1 py-0.5"
                      >
                        <Checkbox
                          checked={selectedCategoryIds.includes(cat.id)}
                          onCheckedChange={() => toggleCategory(cat.id)}
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Belum ada kategori pengeluaran.</p>
                )}
              </div>

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
