
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

interface Category {
  id: number;
  name: string;
  is_income: boolean;
  parent_id: number | null;
  application: 'transaction' | 'investment';
}

interface CategoryFormData {
  name: string;
  is_income: boolean;
  parent_id: number | null;
  application: 'transaction' | 'investment';
}

const CategoryManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      is_income: false,
      parent_id: null,
      application: 'transaction',
    },
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_income", { ascending: false })
        .order("name");

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (newCategory: CategoryFormData) => {
      const { error } = await supabase
        .from("categories")
        .insert({
          ...newCategory,
          user_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      form.reset();
      setIsAdding(false);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil ditambahkan",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menambahkan kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      const { error } = await supabase
        .from("categories")
        .update(data)
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      form.reset();
      setEditingCategory(null);
      toast({
        title: "Berhasil",
        description: "Kategori berhasil diupdate",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal mengupdate kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({
        title: "Berhasil",
        description: "Kategori berhasil dihapus",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Gagal menghapus kategori: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      is_income: category.is_income,
      parent_id: category.parent_id,
      application: category.application,
    });
  };

  const parentCategories = categories?.filter(cat => cat.parent_id === null) || [];

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Kategori</CardTitle>
        {
          (!isAdding && !editingCategory) && 
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </Button>
        }
      </CardHeader>
      <CardContent>
        {
          (isAdding || editingCategory) ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder="Makanan & Minuman" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="is_income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded" 
                          value={field.value.toString()}
                          onChange={(e) => field.onChange(e.target.value === 'true')}
                        >
                          <option value="false">Pengeluaran</option>
                          <option value="true">Pemasukan</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="application"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aplikasi</FormLabel>
                      <FormControl>
                        <select className="w-full p-2 border rounded" {...field}>
                          <option value="transaction">Transaksi</option>
                          <option value="investment">Investasi</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parent_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Induk (Opsional)</FormLabel>
                      <FormControl>
                        <select 
                          className="w-full p-2 border rounded" 
                          value={field.value?.toString() || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        >
                          <option value="">Tidak ada induk</option>
                          {parentCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingCategory ? "Update" : "Simpan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingCategory(null);
                    form.reset();
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        )
        :
        (<Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Aplikasi</TableHead>
              <TableHead>Induk</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.is_income ? "Pemasukan" : "Pengeluaran"}</TableCell>
                <TableCell className="capitalize">{category.application}</TableCell>
                <TableCell>
                  {category.parent_id 
                    ? categories.find(c => c.id === category.parent_id)?.name || "-"
                    : "-"
                  }
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEdit(category)}
                    disabled={editingCategory?.id === category.id}
                  >
                    <Pen className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(category.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>)
        }
      </CardContent>
    </Card>
  );
};

export default CategoryManagement;
