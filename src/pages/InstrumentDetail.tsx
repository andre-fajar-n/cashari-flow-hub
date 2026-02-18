import { useEffect, useState } from "react";
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
  useUpdateInvestmentInstrument,
  useDeleteInvestmentInstrument,
  useInvestmentInstrumentDetail
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
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { defaultGoalTransferFormData, GoalTransferFormData, mapGoalTransferToFormData } from "@/form-dto/goal-transfers";
import { defaultGoalInvestmentRecordFormData, GoalInvestmentRecordFormData, mapGoalInvestmentRecordToFormData } from "@/form-dto/goal-investment-records";
import { useGoalMovementHistory } from "@/hooks/use-goal-movement-history";
import { useMoneyMovementsPaginatedByInstrument } from "@/hooks/queries/paginated/use-money-movements-paginated";
import GoalMovementList from "@/components/goal/GoalMovementList";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import { useWallets, useGoals, useInvestmentAssets, useInvestmentInstruments, useInvestmentCategories } from "@/hooks/queries";

const InstrumentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const instrumentId = parseInt(id!);
  const navigate = useNavigate();

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Use the refactored hook for movement history
  const history = useGoalMovementHistory({
    id: instrumentId,
    usePaginatedQuery: useMoneyMovementsPaginatedByInstrument,
  });

  // Mutations
  const updateInstrument = useUpdateInvestmentInstrument();
  const { mutate: deleteInstrument } = useDeleteInvestmentInstrument();

  // Queries
  const { data: instrument, isLoading: isInstrumentLoading } = useInvestmentInstrumentDetail(instrumentId);
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: assets, isLoading: isAssetsLoading } = useInvestmentAssets();
  const { data: instruments, isLoading: isInstrumensLoading } = useInvestmentInstruments();
  const { data: investmentCategories, isLoading: isInvestmentCategoriesLoading } = useInvestmentCategories();

  // Form states managed at page level
  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  const transferForm = useForm<GoalTransferFormData>({
    defaultValues: defaultGoalTransferFormData,
  });
  const recordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
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

  const isLoading = isInstrumentLoading || history.isLoading || isWalletsLoading || isGoalsLoading || isAssetsLoading ||
    isInstrumensLoading || isInvestmentCategoriesLoading;

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
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <InstrumentOverview instrument={instrument} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <GoalMovementList
                originPage="instrument"
                {...history}
                // Filter options
                wallets={wallets || []}
                assets={assets || []}
                categories={investmentCategories || []}
                instruments={instruments || []}
                goals={goals || []}
              />
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
