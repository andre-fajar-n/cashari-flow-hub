import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { Plus, Trash, Edit, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
}

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

const CurrencyManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const form = useForm<CurrencyFormData>({
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
    },
  });

  const { data: currencies, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("currencies")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      return data as Currency[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newCurrency: CurrencyFormData) => {
      const { error } = await supabase
        .from("currencies")
        .insert({
          ...newCurrency,
          user_id: user?.id,
          is_default: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      form.reset();
      setIsAdding(false);
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (currency: CurrencyFormData & { originalCode: string }) => {
      const { error } = await supabase
        .from("currencies")
        .update({
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
        })
        .eq("code", currency.originalCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      form.reset();
      setEditingCurrency(null);
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil diperbarui",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal memperbarui mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (currencyCode: string) => {
      // First, unset all default currencies for this user
      await supabase
        .from("currencies")
        .update({ is_default: false })
        .eq("user_id", user?.id);

      // Then set the selected currency as default
      const { error } = await supabase
        .from("currencies")
        .update({ is_default: true })
        .eq("code", currencyCode)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang default berhasil diubah",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal mengubah mata uang default: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const checkCurrencyUsage = async (currencyCode: string) => {
    // Check if currency is used in transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("id")
      .eq("currency_code", currencyCode)
      .eq("user_id", user?.id)
      .limit(1);

    // Check if currency is used in wallets
    const { data: wallets } = await supabase
      .from("wallets")
      .select("id")
      .eq("currency_code", currencyCode)
      .eq("user_id", user?.id)
      .limit(1);

    return (transactions && transactions.length > 0) || (wallets && wallets.length > 0);
  };

  const deleteMutation = useMutation({
    mutationFn: async (code: string) => {
      // Check if currency is being used
      const isUsed = await checkCurrencyUsage(code);
      if (isUsed) {
        throw new Error("Mata uang ini sedang digunakan di transaksi atau dompet. Hapus terlebih dahulu transaksi dan dompet yang menggunakan mata uang ini.");
      }

      const { error } = await supabase
        .from("currencies")
        .delete()
        .eq("code", code)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currencies"] });
      toast({
        title: "Berhasil",
        description: "Mata uang berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CurrencyFormData) => {
    if (editingCurrency) {
      updateMutation.mutate({ ...data, originalCode: editingCurrency.code });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    form.setValue("code", currency.code);
    form.setValue("name", currency.name);
    form.setValue("symbol", currency.symbol);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setEditingCurrency(null);
    setIsAdding(false);
    form.reset();
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <CardTitle>Kelola Mata Uang</CardTitle>
        <Button onClick={() => setIsAdding(true)} disabled={isAdding} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Mata Uang
        </Button>
      </CardHeader>
      <CardContent>
        {isAdding ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kode</FormLabel>
                      <FormControl>
                        <Input placeholder="USD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama</FormLabel>
                      <FormControl>
                        <Input placeholder="US Dollar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="$" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full sm:w-auto">
                  {createMutation.isPending || updateMutation.isPending ? "Menyimpan..." : editingCurrency ? "Perbarui" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEdit}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[80px]">Kode</TableHead>
                  <TableHead className="min-w-[120px]">Nama</TableHead>
                  <TableHead className="min-w-[80px]">Symbol</TableHead>
                  <TableHead className="min-w-[80px]">Default</TableHead>
                  <TableHead className="min-w-[120px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies?.map((currency) => (
                  <TableRow key={currency.code}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {currency.is_default ? "Ya" : "Tidak"}
                        {!currency.is_default && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDefaultMutation.mutate(currency.code)}
                            disabled={setDefaultMutation.isPending}
                            className="h-6 w-6 p-0"
                          >
                            <Star className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col sm:flex-row gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(currency)}
                          className="w-full sm:w-auto"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!currency.is_default && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Mata Uang</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus mata uang {currency.name}? 
                                  Pastikan mata uang ini tidak digunakan di transaksi atau dompet manapun.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteMutation.mutate(currency.code)}
                                  disabled={deleteMutation.isPending}
                                >
                                  {deleteMutation.isPending ? "Menghapus..." : "Hapus"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyManagement;
