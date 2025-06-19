
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Trash, Pen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Wallet {
  id: number;
  name: string;
  currency_code: string;
  initial_amount: number;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

interface WalletFormData {
  name: string;
  currency_code: string;
  initial_amount: number;
}

const WalletManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const form = useForm<WalletFormData>({
    defaultValues: {
      name: "",
      currency_code: "",
      initial_amount: 0,
    },
  });

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at");

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("code, name, symbol")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data as Currency[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newWallet: WalletFormData) => {
      const { error } = await supabase
        .from("wallets")
        .insert({
          ...newWallet,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      form.reset();
      setIsAdding(false);
      toast({
        title: "Berhasil",
        description: "Dompet berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: WalletFormData }) => {
      const { error } = await supabase
        .from("wallets")
        .update(data)
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      form.reset();
      setEditingWallet(null);
      toast({
        title: "Berhasil",
        description: "Dompet berhasil diupdate",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal mengupdate dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("wallets")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      toast({
        title: "Berhasil",
        description: "Dompet berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus dompet: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: WalletFormData) => {
    if (editingWallet) {
      updateMutation.mutate({ id: editingWallet.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    form.reset({
      name: wallet.name,
      currency_code: wallet.currency_code,
      initial_amount: wallet.initial_amount,
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Dompet</CardTitle>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingWallet}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Dompet
        </Button>
      </CardHeader>
      <CardContent>
        {(isAdding || editingWallet) && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Dompet</FormLabel>
                      <FormControl>
                        <Input placeholder="Dompet Utama" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mata Uang</FormLabel>
                      <FormControl>
                        <select className="w-full p-2 border rounded" {...field}>
                          <option value="">Pilih mata uang</option>
                          {currencies?.map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="initial_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Saldo Awal</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingWallet ? "Update" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingWallet(null);
                    form.reset();
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Mata Uang</TableHead>
              <TableHead>Saldo Awal</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wallets?.map((wallet) => (
              <TableRow key={wallet.id}>
                <TableCell className="font-medium">{wallet.name}</TableCell>
                <TableCell>{wallet.currency_code}</TableCell>
                <TableCell>{wallet.initial_amount.toLocaleString()}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(wallet)}
                    disabled={editingWallet?.id === wallet.id}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(wallet.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WalletManagement;
