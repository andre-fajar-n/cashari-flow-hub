
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { useWallets } from "@/hooks/queries/useWallets";
import { useGoals } from "@/hooks/queries/useGoals";
import { useInvestmentInstruments } from "@/hooks/queries/useInvestmentInstruments";
import { useInvestmentAssets } from "@/hooks/queries/useInvestmentAssets";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GoalTransferFormData {
  from_wallet_id: string;
  from_goal_id: string;
  from_instrument_id: string;
  from_asset_id: string;
  to_wallet_id: string;
  to_goal_id: string;
  to_instrument_id: string;
  to_asset_id: string;
  amount_from: number;
  amount_to: number;
  date: string;
}

interface GoalTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transfer?: any;
  onSuccess?: () => void;
}

const GoalTransferDialog = ({ open, onOpenChange, transfer, onSuccess }: GoalTransferDialogProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GoalTransferFormData>({
    defaultValues: {
      from_wallet_id: "",
      from_goal_id: "",
      from_instrument_id: "",
      from_asset_id: "",
      to_wallet_id: "",
      to_goal_id: "",
      to_instrument_id: "",
      to_asset_id: "",
      amount_from: 0,
      amount_to: 0,
      date: new Date().toISOString().split('T')[0],
    },
  });

  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: assets } = useInvestmentAssets();

  const fromWalletId = form.watch("from_wallet_id");
  const toWalletId = form.watch("to_wallet_id");
  const amountFrom = form.watch("amount_from");

  const fromWallet = wallets?.find(w => w.id.toString() === fromWalletId);
  const toWallet = wallets?.find(w => w.id.toString() === toWalletId);
  const isSameCurrency = fromWallet?.currency_code === toWallet?.currency_code;

  const fromInstrumentId = form.watch("from_instrument_id");
  const toInstrumentId = form.watch("to_instrument_id");

  // Filter assets based on selected instruments
  const fromAssets = assets?.filter(asset => 
    !fromInstrumentId || asset.instrument_id.toString() === fromInstrumentId
  );
  const toAssets = assets?.filter(asset => 
    !toInstrumentId || asset.instrument_id.toString() === toInstrumentId
  );

  // Auto-populate amount_to when same currency (simplified logic)
  useEffect(() => {
    if (isSameCurrency && amountFrom > 0) {
      form.setValue("amount_to", amountFrom);
    }
  }, [isSameCurrency, amountFrom, form]);

  const onSubmit = async (data: GoalTransferFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const transferData = {
        user_id: user.id,
        from_wallet_id: data.from_wallet_id ? parseInt(data.from_wallet_id) : null,
        from_goal_id: data.from_goal_id ? parseInt(data.from_goal_id) : null,
        from_instrument_id: data.from_instrument_id ? parseInt(data.from_instrument_id) : null,
        from_asset_id: data.from_asset_id ? parseInt(data.from_asset_id) : null,
        to_wallet_id: data.to_wallet_id ? parseInt(data.to_wallet_id) : null,
        to_goal_id: data.to_goal_id ? parseInt(data.to_goal_id) : null,
        to_instrument_id: data.to_instrument_id ? parseInt(data.to_instrument_id) : null,
        to_asset_id: data.to_asset_id ? parseInt(data.to_asset_id) : null,
        amount_from: data.amount_from,
        amount_to: data.amount_to,
        currency_from: 'IDR', // Default for now
        currency_to: 'IDR', // Default for now
        date: data.date,
      };

      if (transfer) {
        // Update existing transfer
        const { error } = await supabase
          .from("goal_transfers")
          .update(transferData)
          .eq("id", transfer.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Transfer goal berhasil diperbarui" });
      } else {
        // Create new transfer
        const { error } = await supabase
          .from("goal_transfers")
          .insert(transferData);

        if (error) throw error;
        toast({ title: "Transfer goal berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving goal transfer:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan transfer goal",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      if (transfer) {
        form.reset({
          from_wallet_id: transfer.from_wallet_id?.toString() || "",
          from_goal_id: transfer.from_goal_id?.toString() || "",
          from_instrument_id: transfer.from_instrument_id?.toString() || "",
          from_asset_id: transfer.from_asset_id?.toString() || "",
          to_wallet_id: transfer.to_wallet_id?.toString() || "",
          to_goal_id: transfer.to_goal_id?.toString() || "",
          to_instrument_id: transfer.to_instrument_id?.toString() || "",
          to_asset_id: transfer.to_asset_id?.toString() || "",
          amount_from: transfer.amount_from || 0,
          amount_to: transfer.amount_to || 0,
          date: transfer.date || new Date().toISOString().split('T')[0],
        });
      } else {
        form.reset({
          from_wallet_id: "",
          from_goal_id: "",
          from_instrument_id: "",
          from_asset_id: "",
          to_wallet_id: "",
          to_goal_id: "",
          to_instrument_id: "",
          to_asset_id: "",
          amount_from: 0,
          amount_to: 0,
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [open, transfer, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transfer ? "Edit Transfer Goal" : "Transfer Goal Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* From Section */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium mb-3">Dari (Sumber)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="from_wallet_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dompet Asal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dompet asal" />
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
                  name="from_goal_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Asal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih goal asal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {goals?.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id.toString()}>
                              {goal.name} ({goal.currency_code})
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
                  name="from_instrument_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrumen Asal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih instrumen asal" />
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
                  name="from_asset_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aset Asal</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih aset asal" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {fromAssets?.map((asset) => (
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
            </div>

            {/* To Section */}
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium mb-3">Ke (Tujuan)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="to_wallet_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dompet Tujuan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih dompet tujuan" />
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
                  name="to_goal_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Tujuan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih goal tujuan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {goals?.filter(goal => goal.is_active && !goal.is_achieved).map((goal) => (
                            <SelectItem key={goal.id} value={goal.id.toString()}>
                              {goal.name} ({goal.currency_code})
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
                  name="to_instrument_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instrumen Tujuan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih instrumen tujuan" />
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
                  name="to_asset_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aset Tujuan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih aset tujuan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Tidak ada</SelectItem>
                          {toAssets?.map((asset) => (
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
            </div>

            {/* Amount and Date Section */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount_from"
                rules={{ required: "Jumlah keluar harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Keluar</FormLabel>
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
                name="amount_to"
                rules={{ required: "Jumlah masuk harus diisi", min: { value: 1, message: "Jumlah harus lebih dari 0" } }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Masuk</FormLabel>
                    <FormControl>
                      <InputNumber 
                        {...field} 
                        onChange={(value) => field.onChange(value)}
                        value={field.value}
                        disabled={isSameCurrency}
                      />
                    </FormControl>
                    {isSameCurrency && (
                      <p className="text-xs text-muted-foreground">
                        Otomatis sama dengan jumlah keluar (mata uang sama)
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fromWallet && toWallet && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                Transfer dari {fromWallet.name} ({fromWallet.currency_code}) ke {toWallet.name} ({toWallet.currency_code})
              </div>
            )}

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

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : transfer ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GoalTransferDialog;
