import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputNumber } from "@/components/ui/input-number";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Plus, Trash, Pen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCurrencies } from "@/hooks/queries";

interface Wallet {
  id: number;
  name: string;
  currency_code: string;
  initial_amount: number;
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

  // Reset form when adding/editing state changes
  useEffect(() => {
    if (isAdding) {
      form.reset({
        name: "",
        currency_code: "",
        initial_amount: 0,
      });
    }
  }, [isAdding, form]);

  useEffect(() => {
    if (editingWallet) {
      form.reset({
        name: editingWallet.name,
        currency_code: editingWallet.currency_code,
        initial_amount: editingWallet.initial_amount,
      });
    }
  }, [editingWallet, form]);

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["wallets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .order("name");

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });

  const { data: currencies } = useCurrencies();

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
      form.reset({
        name: "",
        currency_code: "",
        initial_amount: 0,
      });
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
      form.reset({
        name: "",
        currency_code: "",
        initial_amount: 0,
      });
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
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingWallet(null);
    form.reset({
      name: "",
      currency_code: "",
      initial_amount: 0,
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Dompet</CardTitle>
        {!isAdding && !editingWallet && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Dompet
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {(isAdding || editingWallet) ? 
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
                        <InputNumber {...field} />
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
                  onClick={handleCancel}
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        :
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
        }
      </CardContent>
    </Card>
  );
};

export default WalletManagement;
