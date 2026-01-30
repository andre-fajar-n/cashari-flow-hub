import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentInstrumentDialog from "@/components/investment/InvestmentInstrumentDialog";
import InstrumentOverview from "@/components/instrument/InstrumentOverview";
import PageLoading from "@/components/PageLoading";
import ConfirmationModal from "@/components/ConfirmationModal";
import { 
  useInvestmentInstruments, 
  useUpdateInvestmentInstrument, 
  useDeleteInvestmentInstrument 
} from "@/hooks/queries/use-investment-instruments";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InstrumentFormData, defaultInstrumentFormValues } from "@/form-dto/investment-instruments";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const InstrumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const instrumentId = parseInt(id!);
  const navigate = useNavigate();

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Mutations
  const updateInstrument = useUpdateInvestmentInstrument();
  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();

  // Queries
  const { data: instruments, isLoading: isInstrumentsLoading } = useInvestmentInstruments();
  const instrument = instruments?.find(i => i.id === instrumentId);

  // Form
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  // Dialog state
  const instrumentDialog = useDialogState<InvestmentInstrumentModel, InstrumentFormData>({
    form,
    defaultValues: defaultInstrumentFormValues,
    mapDataToForm: (data) => ({
      name: data.name || "",
      unit_label: data.unit_label || "",
      is_trackable: data.is_trackable ?? true,
    }),
  });

  const isLoading = isInstrumentsLoading;

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: instrumentDialog.setIsLoading,
    onOpenChange: (open) => !open && instrumentDialog.close(),
    form,
    queryKeysToInvalidate: [...QUERY_KEY_SETS.INVESTMENT_INSTRUMENTS, "instrument_detail_summary"]
  });

  const handleFormSubmit = (data: InstrumentFormData) => {
    if (!instrument) return;
    instrumentDialog.setIsLoading(true);
    updateInstrument.mutate({ id: instrument.id, ...data }, {
      onSuccess: handleSuccess,
      onError: handleError
    });
  };

  const handleDelete = () => {
    if (!instrument) return;
    deleteInstrument(instrument.id, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate("/investment-instrument");
      }
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoading />
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!instrument) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <p className="text-muted-foreground">Instrumen tidak ditemukan</p>
            <Button variant="outline" onClick={() => navigate("/investment-instrument")}>
              Kembali ke Daftar Instrumen
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Hapus Instrumen"
          description={`Apakah Anda yakin ingin menghapus instrumen "${instrument.name}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          variant="destructive"
          onConfirm={handleDelete}
        />

        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/investment-instrument")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{instrument.name}</h1>
                  {instrument.is_trackable ? (
                    <Badge variant="secondary">Trackable</Badge>
                  ) : (
                    <Badge variant="outline">Non-trackable</Badge>
                  )}
                </div>
                {instrument.unit_label && (
                  <p className="text-muted-foreground text-sm">
                    Unit: {instrument.unit_label}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => instrumentDialog.openEdit(instrument)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Instrumen</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsDeleteModalOpen(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Hapus Instrumen</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="assets">Aset</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <InstrumentOverview instrument={instrument} />
            </TabsContent>

            <TabsContent value="assets" className="space-y-4">
              <div className="p-8 text-center text-muted-foreground border rounded-lg">
                <p>Daftar aset dalam instrumen ini akan ditampilkan di sini.</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => navigate("/investment-asset")}
                >
                  Lihat semua aset
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit Dialog */}
        <InvestmentInstrumentDialog
          open={instrumentDialog.open}
          onOpenChange={(open) => !open && instrumentDialog.close()}
          form={form}
          isLoading={instrumentDialog.isLoading}
          onSubmit={handleFormSubmit}
          instrument={instrumentDialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InstrumentDetail;
