import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCategories, useDeleteCategory } from "@/hooks/queries";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { mutate: deleteCategory } = useDeleteCategory();

  const form = useForm<CategoryFormData>({
    defaultValues: {
      name: "",
      is_income: false,
      parent_id: null,
      application: 'transaction',
    },
  });

  // Reset form when adding/editing state changes
  useEffect(() => {
    if (isAdding) {
      form.reset({
        name: "",
        is_income: false,
        parent_id: null,
        application: 'transaction',
      });
    }
  }, [isAdding, form]);

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        is_income: editingCategory.is_income,
        parent_id: editingCategory.parent_id,
        application: editingCategory.application,
      });
    }
  }, [editingCategory, form]);

  const { data: categories, isLoading } = useCategories();

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
      form.reset({
        name: "",
        is_income: false,
        parent_id: null,
        application: 'transaction',
      });
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
      form.reset({
        name: "",
        is_income: false,
        parent_id: null,
        application: 'transaction',
      });
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

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete, {
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
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategory(category);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingCategory(null);
    form.reset({
      name: "",
      is_income: false,
      parent_id: null,
      application: 'transaction',
    });
  };

  const parentCategories = categories?.filter(cat => cat.parent_id === null) || [];

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <Card>
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        description="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
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
                  onClick={handleCancel}
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
                    onClick={() => handleDeleteClick(category.id)}
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
