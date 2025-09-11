import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteInvestmentInstrument } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentInstrumentsPaginated } from "@/hooks/queries/paginated/use-investment-instruments-paginated";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";

const InvestmentInstrument = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [instrumentToDelete, setInstrumentToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<InvestmentInstrumentModel | undefined>(undefined);
  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useInvestmentInstrumentsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const instruments = paged?.data || [];

  const handleEdit = (instrument: InvestmentInstrumentModel) => {
    setSelectedInstrument(instrument);
    setIsDialogOpen(true);
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

  const handleAddNew = () => {
    setSelectedInstrument(undefined);
    setIsDialogOpen(true);
  };

  const renderInstrumentItem = (instrument: InvestmentInstrumentModel) => (
    <Card key={instrument.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1 bg-blue-100 rounded-full">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 truncate">{instrument.name}</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {instrument.unit_label && (
                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                  Unit: {instrument.unit_label}
                </span>
              )}
              <span className={`text-xs px-3 py-1 rounded-full font-medium w-fit ${
                instrument.is_trackable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {instrument.is_trackable ? 'Dapat Dilacak' : 'Tidak Dapat Dilacak'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions - Mobile responsive */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <TrendingUp className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Detail</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleEdit(instrument)}
          >
            <Edit className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => handleDeleteClick(instrument.id)}
          >
            <Trash2 className="w-3 h-3 sm:mr-1" />
            <span className="hidden sm:inline">Hapus</span>
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
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Instrumen
              </Button>
            )
          }
        />

        {(!instruments || instruments.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Instrumen Pertama
            </Button>
          </div>
        )}

        <InvestmentInstrumentDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          instrument={selectedInstrument}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["investment_instruments"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentInstrument;