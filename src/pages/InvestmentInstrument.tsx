import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useCreateInvestmentInstrument, useUpdateInvestmentInstrument, useDeleteInvestmentInstrument } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentInstrumentsPaginated } from "@/hooks/queries/paginated/use-investment-instruments-paginated";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";
import { useDialogState } from "@/hooks/use-dialog-state";

const InvestmentInstrument = () => {
  const { user } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instrumentToDelete, setInstrumentToDelete] = useState<number | null>(null);

  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();
  const createInstrument = useCreateInvestmentInstrument();
  const updateInstrument = useUpdateInvestmentInstrument();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useInvestmentInstrumentsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const instruments = paged?.data || [];

  // Form
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<InvestmentInstrumentModel, InstrumentFormData>({
    form,
    defaultValues: defaultInstrumentFormValues,
    mapDataToForm: (instrument) => ({
      name: instrument.name || "",
      unit_label: instrument.unit_label || "",
      is_trackable: instrument.is_trackable ?? false,
    }),
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS
  });

  const handleFormSubmit = (data: InstrumentFormData) => {
    if (!user) return;
    dialog.setIsLoading(true);

    if (dialog.selectedData) {
      updateInstrument.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createInstrument.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleDeleteClick = (instrumentId: number) => {
    setInstrumentToDelete(instrumentId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (instrumentToDelete) {
      deleteInstrument(instrumentToDelete);
    }
  };

  const renderInstrumentItem = (instrument: InvestmentInstrumentModel) => (
    <Card key={instrument.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-primary/10 rounded-full">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-foreground truncate">{instrument.name}</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {instrument.unit_label && (
                <span className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-lg w-fit">
                  Unit: {instrument.unit_label}
                </span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${instrument.is_trackable
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-muted text-muted-foreground'
                }`}>
                {instrument.is_trackable ? 'Dapat Dilacak' : 'Tidak Dapat Dilacak'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions - Mobile responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-1 border-t-2 sm:border-t border-border">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
          >
            <TrendingUp className="w-3 h-3 sm:mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => dialog.openEdit(instrument)}
          >
            <Edit className="w-3 h-3 sm:mr-1" />
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => handleDeleteClick(instrument.id)}
          >
            <Trash2 className="w-3 h-3 sm:mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );

  const columnFilters: ColumnFilter[] = [
    {
      field: "is_trackable",
      label: "Status Tracking",
      type: "select",
      options: [
        { label: "Dapat Dilacak", value: "true" },
        { label: "Tidak Dapat Dilacak", value: "false" }
      ]
    },
    {
      field: "unit_label",
      label: "Unit Label",
      type: "text"
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Instrumen Investasi"
          description="Apakah Anda yakin ingin menghapus instrumen investasi ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <DataTable
          data={instruments}
          isLoading={isLoading}
          searchPlaceholder="Cari instrumen investasi..."
          searchFields={["name", "unit_label"]}
          columnFilters={columnFilters}
          itemsPerPage={itemsPerPage}
          serverMode
          totalCount={paged?.count}
          page={page}
          onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
            setServerSearch(searchTerm);
            setServerFilters(filters);
            setPage(nextPage);
          }}
          useUrlParams={true}
          renderItem={renderInstrumentItem}
          emptyStateMessage="Belum ada instrumen investasi yang dibuat"
          title="Instrumen Investasi"
          description="Kelola jenis instrumen investasi Anda"
          headerActions={
            instruments && instruments.length > 0 && (
              <Button onClick={dialog.openAdd} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Instrumen
              </Button>
            )
          }
        />

        {(!instruments || instruments.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={dialog.openAdd} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Instrumen Pertama
            </Button>
          </div>
        )}

        <InvestmentInstrumentDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          instrument={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentInstrument;
