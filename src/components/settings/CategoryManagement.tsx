import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { CATEGORY_APPLICATIONS, CategoryApplication } from "@/constants/enums";
import { CategoryDropdown } from "@/components/ui/dropdowns";
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
                  <Dropdown
                    control={form.control}
                    name="is_income"
                    label="Tipe"
                    placeholder="Pilih tipe"
                    options={[
                      { value: "false", label: "Pengeluaran" },
                      { value: "true", label: "Pemasukan" }
                    ]}
                    onValueChange={(value) => form.setValue("is_income", value === "true")}
                  />
                  <Dropdown
                    control={form.control}
                    name="application"
                    label="Aplikasi"
                    placeholder="Pilih aplikasi"
                    options={[
                      { value: "none", label: "Tidak Ada" },
                      { value: "transaction", label: "Transaksi" },
                      { value: "investment", label: "Investasi" },
                      { value: "debt", label: "Hutang/Piutang" }
                    ]}
                    onValueChange={(value) => form.setValue("application", value === "none" ? null : value as CategoryApplication)}
                  />
                  <CategoryDropdown
                    control={form.control}
                    name="parent_id"
                    label="Kategori Induk (Opsional)"
                    categories={parentCategories}
                    placeholder="Tidak ada induk"
                    onValueChange={(value) => form.setValue("parent_id", value ? parseInt(value) : null)}
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
