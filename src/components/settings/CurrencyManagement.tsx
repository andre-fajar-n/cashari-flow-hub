
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
import { Plus, Trash } from "lucide-react";
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

  const deleteMutation = useMutation({
    mutationFn: async (code: string) => {
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
        description: `Gagal menghapus mata uang: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CurrencyFormData) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Mata Uang</CardTitle>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Mata Uang
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isAdding ? 
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-3 gap-4">
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
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    form.reset();
                  }}
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
              <TableHead>Kode</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Symbol</TableHead>
              <TableHead>Default</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currencies?.map((currency) => (
              <TableRow key={currency.code}>
                <TableCell className="font-medium">{currency.code}</TableCell>
                <TableCell>{currency.name}</TableCell>
                <TableCell>{currency.symbol}</TableCell>
                <TableCell>{currency.is_default ? "Ya" : "Tidak"}</TableCell>
                <TableCell>
                  {!currency.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(currency.code)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  )}
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

export default CurrencyManagement;
