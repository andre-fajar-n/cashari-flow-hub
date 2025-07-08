import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteInvestmentInstrument, useInvestmentInstruments } from "@/hooks/queries";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";

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
        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Instrumen Investasi</CardTitle>
              <p className="text-gray-600">Kelola jenis instrumen investasi Anda</p>
            </div>
            {instruments && instruments.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Instrumen
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat instrumen investasi...</p>
              </div>
            ) : !instruments || instruments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada instrumen investasi yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Instrumen Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {instruments.map((instrument) => (
                  <Card key={instrument.id} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold">{instrument.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          {instrument.unit_label && (
                            <span className="text-sm text-gray-600">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
