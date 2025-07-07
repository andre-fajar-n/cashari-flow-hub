
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useWallets, useCategories, useInvestmentInstruments, useInvestmentAssets, useDefaultCurrency } from "@/hooks/queries";
import { useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";

interface GoalInvestmentRecordFormData {
  goal_id: string;
  instrument_id: string;
  asset_id: string;
  wallet_id: string;
  category_id: string;
  amount: number;
  date: string;
  currency_code: string;
  is_valuation: boolean;
}

interface GoalInvestmentRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId?: number;
  record?: any;
  onSuccess?: () => void;
}

const GoalInvestmentRecordDialog = ({ 
  open, 
  onOpenChange, 
  goalId, 
  record, 
  onSuccess 
}: GoalInvestmentRecordDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const defaultCurrency = useDefaultCurrency();

  const form = useForm<GoalInvestmentRecordFormData>({
    defaultValues: {
      goal_id: goalId?.toString() || "",
      instrument_id: "none",
      asset_id: "none",
      wallet_id: "none",
      category_id: "none",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      currency_code: defaultCurrency?.code || "IDR",
      is_valuation: false,
    },
  });

  const { data: wallets } = useWallets();
  const { data: categories } = useCategories(undefined, 'investment');
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();

  const { mutate: createRecord } = useCreateGoalInvestmentRecord();
  const { mutate: updateRecord } = useUpdateGoalInvestmentRecord();

  const instrumentId = form.watch("instrument_id");
  const filteredAssets = assets?.filter(asset => 
    instrumentId === "none" || asset.instrument_id.toString() === instrumentId
  );

  const onSubmit = async (data: GoalInvestmentRecordFormData) => {
    setIsLoading(true);
    try {
      const recordData = {
        goal_id: parseInt(data.goal_id),
        instrument_id: data.instrument_id !== "none" ? parseInt(data.instrument_id) : null,
        asset_id: data.asset_id !== "none" ? parseInt(data.asset_id) : null,
        wallet_id: data.wallet_id !== "none" ? parseInt(data.wallet_id) : null,
        category_id: data.category_id !== "none" ? parseInt(data.category_id) : null,
        amount: data.amount,
        date: data.date,
        currency_code: data.currency_code,
        is_valuation: data.is_valuation,
      };

      if (record) {
        updateRecord({ id: record.id, ...recordData }, {
          onSuccess: () => {
            toast({ title: "Record berhasil diperbarui" });
            onOpenChange(false);
            form.reset();
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Error updating record:", error);
            toast({ 
              title: "Error", 
              description: "Gagal memperbarui record",
              variant: "destructive"
            });
          },
        });
      } else {
        createRecord(recordData, {
          onSuccess: () => {
            toast({ title: "Record berhasil ditambahkan" });
            onOpenChange(false);
            form.reset();
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Error creating record:", error);
            toast({ 
              title: "Error", 
              description: "Gagal menambahkan record",
              variant: "destructive"
            });
          },
        });
      }
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (record) {
        form.reset({
          goal_id: record.goal_id?.toString() || "",
          instrument_id: record.instrument_id?.toString() || "none",
          asset_id: record.asset_id?.toString() || "none",
          wallet_id: record.wallet_id?.toString() || "none",
          category_id: record.category_id?.toString() || "none",
          amount: record.amount || 0,
          date: record.date || new Date().toISOString().split('T')[0],
          currency_code: record.currency_code || defaultCurrency?.code || "IDR",
          is_valuation: record.is_valuation || false,
        });
      } else {
        form.reset({
          goal_id: goalId?.toString() || "",
          instrument_id: "none",
          asset_id: "none",
          wallet_id: "none",
          category_id: "none",
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          currency_code: defaultCurrency?.code || "IDR",
          is_valuation: false,
        });
      }
    }
  }, [open, record, goalId, form, defaultCurrency]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {record ? "Edit Record Goal" : "Tambah Record Goal"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="instrument_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrumen</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih instrumen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {instruments?.map((instrument) => (
                          <SelectItem key={instrument.id} value={instrument.id.toString()}>
                            {instrument.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="asset_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aset</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih aset" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {filteredAssets?.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} {asset.symbol && `(${asset.symbol})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="wallet_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dompet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dompet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {wallets?.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id.toString()}>
                            {wallet.name} ({wallet.currency_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Tidak ada</SelectItem>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{ required: "Jumlah harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah</FormLabel>
                    <FormControl>
                      <InputNumber 
                        {...field} 
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
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
            </div>

            <FormField
              control={form.control}
              name="is_valuation"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Valuasi (bukan transaksi aktual)
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : record ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalInvestmentRecordDialog;
