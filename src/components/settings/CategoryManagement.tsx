import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { CATEGORY_APPLICATIONS } from "@/constants/enums";
import { useForm } from "react-hook-form";
import { Plus, Trash, Pen } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCategories, useCreateCategory, useDeleteCategory, useUpdateCategory } from "@/hooks/queries/use-categories";
import { CategoryModel } from "@/models/categories";
import { CategoryFormData, defaultCategoryFormValues } from "@/form-dto/categories";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";

const CategoryManagement = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryModel | null>(null);
  const { mutate: deleteCategory } = useDeleteCategory();
  const { data: categories, isLoading } = useCategories();
  const parentCategories = categories?.filter((cat) => cat.parent_id === null) || [];
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const form = useForm<CategoryFormData>({
    defaultValues: defaultCategoryFormValues,
  });

  // Reset form when adding/editing state changes
  useEffect(() => {
    if (!isAdding) {
      form.reset(defaultCategoryFormValues);
    }
  }, [isAdding, form]);

  useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        is_income: editingCategory.is_income,
        parent_id: editingCategory.parent_id,
        application: editingCategory.application ?? null,
      });
    }
  }, [editingCategory, form]);

  const handleDeleteClick = (categoryId: number) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete);
    }
  };

  // Use mutation callbacks utility
  const { handleSuccess } = useMutationCallbacks({
    setIsLoading: () => {}, // Not used in this component
    onOpenChange: () => {
      setIsAdding(false);
      setEditingCategory(null);
    },
    onSuccess: () => {},
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.CATEGORIES
  });

  const onSubmit = (data: CategoryFormData) => {
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...data }, {
        onSuccess: handleSuccess
      });
    } else {
      createCategory.mutate(data, {
        onSuccess: handleSuccess
      });
    }
  };

  const startEdit = (category: CategoryModel) => {
    setEditingCategory(category);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setIsAdding(false);
  };

  const columnFilters: ColumnFilter[] = [
    {
      field: "is_income",
      label: "Tipe",
      type: "select",
      options: [
        { label: "Pemasukan", value: "true" },
        { label: "Pengeluaran", value: "false" }
      ]
    },
    {
      field: "application",
      label: "Aplikasi",
      type: "select",
      options: [
        { label: "Transaksi", value: CATEGORY_APPLICATIONS.TRANSACTION },
        { label: "Investasi", value: CATEGORY_APPLICATIONS.INVESTMENT },
        { label: "Hutang/Piutang", value: CATEGORY_APPLICATIONS.DEBT },
        { label: "Tidak Ber-aplikasi", value: "NULL_VALUE" }
      ]
    },
    {
      field: "parent_id",
      label: "Parent",
      type: "select",
      options: parentCategories?.map(cat => ({
        label: cat.name,
        value: cat.id.toString()
      })) || []
    }
  ];

  const renderCategoryItem = (category: CategoryModel) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="font-medium">{category.name}</p>
          <p className="text-sm text-muted-foreground">Nama</p>
        </div>
        <div>
          <p className="font-medium">{category.is_income ? "Pemasukan" : "Pengeluaran"}</p>
          <p className="text-sm text-muted-foreground">Tipe</p>
        </div>
        <div>
          <p className="font-medium capitalize">{category.application || "-"}</p>
          <p className="text-sm text-muted-foreground">Aplikasi</p>
        </div>
        <div>
          <p className="font-medium">
            {category.parent_id
              ? categories?.find((c) => c.id === category.parent_id)?.name || "-"
              : "-"}
          </p>
          <p className="text-sm text-muted-foreground">Induk</p>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => startEdit(category)}
          disabled={editingCategory?.id === category.id}
        >
          <Pen className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleDeleteClick(category.id)}
        >
          <Trash className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
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

      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            onChange={(e) => field.onChange(e.target.value === "true")}
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
                          <select
                            className="w-full p-2 border rounded"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                          >
                            <option value="">Tidak Ada</option>
                            <option value="transaction">Transaksi</option>
                            <option value="investment">Investasi</option>
                            <option value="debt">Hutang/Piutang</option>
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
                            value={field.value?.toString() || "none"}
                            onChange={(e) => field.onChange(e.target.value === "none" ? null : parseInt(e.target.value))}
                          >
                            <option value="none">Tidak ada induk</option>
                            {parentCategories.map((category) => (
                              <option key={category.id} value={category.id.toString()}>
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
                  <Button
                    type="submit"
                    disabled={createCategory.isPending || updateCategory.isPending}
                  >
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
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={categories || []}
          isLoading={isLoading}
          searchPlaceholder="Cari kategori berdasarkan nama..."
          searchFields={['name']}
          columnFilters={columnFilters}
          itemsPerPage={10}
          renderItem={renderCategoryItem}
          emptyStateMessage="Belum ada kategori yang dibuat"
          title="Kelola Kategori"
          headerActions={
            !isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Kategori
              </Button>
            )
          }
        />
      )}
    </div>
  );
};

export default CategoryManagement;
