import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteInvestmentInstrument, useInvestmentInstruments } from "@/hooks/queries";
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

  const { data: instruments, isLoading } = useInvestmentInstruments();

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
    <Card key={instrument.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold">{instrument.name}</h3>
          </div>
          <div className="flex items-center gap-4 mt-1">
            {instrument.unit_label && (
              <span className="text-sm text-muted-foreground">
                Unit: {instrument.unit_label}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded ${
              instrument.is_trackable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {instrument.is_trackable ? 'Dapat Dilacak' : 'Tidak Dapat Dilacak'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Assets</Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(instrument)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClick(instrument.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
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
          data={instruments || []}
          isLoading={isLoading}
          searchPlaceholder="Cari instrumen investasi..."
          searchFields={["name", "unit_label"]}
          columnFilters={columnFilters}
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