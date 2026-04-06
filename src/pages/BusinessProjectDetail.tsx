import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Edit, Calendar, Trash2, Plus, AlertTriangle, ArrowUpCircle, ArrowDownCircle, TrendingUp, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ConfirmationModal";
import BusinessProjectTransactionDialog from "@/components/business-project/BusinessProjectTransactionDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectTransactionList from "@/components/business-project/BusinessProjectTransactionList";
import BusinessProjectSummaryCard from "@/components/business-project/BusinessProjectSummaryCard";
import BusinessProjectTrendChart from "@/components/business-project/BusinessProjectTrendChart";
import { useBusinessProjectDetail, useDeleteBusinessProject, useUpdateBusinessProject } from "@/hooks/queries/use-business-projects";
import { useBusinessProjectSummary } from "@/hooks/queries/use-business-project-summary";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import { formatDate } from "@/lib/date";
import { formatAmountCurrency } from "@/lib/currency";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { TransactionFilter } from "@/form-dto/transactions";
import { BusinessProjectFormData, defaultBusinessProjectFormValues, mapBusinessProjectToFormData } from "@/form-dto/business-projects";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import { BusinessProjectModel } from "@/models/business-projects";
import { calculateProjectTotalInBaseCurrency } from "@/components/business-project/BusinessProjectSummaryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmountText } from "@/components/ui/amount-text";
const BusinessProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("summary");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for BusinessProjectTransactionDialog
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingTransactions, setIsAddingTransactions] = useState(false);

  const { data: project } = useBusinessProjectDetail(parseInt(id || "0"));
  const { data: projectSummary } = useBusinessProjectSummary(parseInt(id || "0"));
  const { mutate: deleteProject } = useDeleteBusinessProject();
  const updateProject = useUpdateBusinessProject();
  const { addTransactionsToProject } = useBusinessProjectTransactions(project?.id);

  // Form state managed at page level
  const form = useForm<BusinessProjectFormData>({
    defaultValues: defaultBusinessProjectFormValues,
  });

  // Use dialog state hook for project edit dialog
  const projectDialog = useDialogState<BusinessProjectModel, BusinessProjectFormData>({
    form,
    defaultValues: defaultBusinessProjectFormValues,
    mapDataToForm: mapBusinessProjectToFormData,
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: projectDialog.setIsLoading,
    onOpenChange: (open) => !open && projectDialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.BUSINESS_PROJECTS
  });

  const handleFormSubmit = (data: BusinessProjectFormData) => {
    if (!project) return;
    projectDialog.setIsLoading(true);
    updateProject.mutate({ id: project.id, ...data }, {
      onSuccess: () => projectDialog.handleSuccess(),
      onError: handleError
    });
  };

  // Transactions data for the add dialog
  const filter: TransactionFilter = {
    startDate: project?.start_date,
    endDate: project?.end_date
  };
  const { data: allTransactions } = useTransactions(filter);
  const { data: projectTransactions } = useBusinessProjectTransactions(project?.id);

  // Get transactions that are not already in this project
  const availableTransactions = allTransactions?.filter(transaction => {
    const isAlreadyInProject = projectTransactions?.some(
      projectTrx => projectTrx.transaction_id === transaction.id
    );
    return !isAlreadyInProject;
  }) || [];

  // Filter transactions based on search query
  const filteredTransactions = availableTransactions.filter(transaction => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.categories?.name?.toLowerCase().includes(searchLower) ||
      transaction.wallets?.name?.toLowerCase().includes(searchLower) ||
      transaction.amount.toString().includes(searchQuery)
    );
  });

  // Reset selection when dialog closes
  useEffect(() => {
    if (!isAddDialogOpen) {
      setSelectedTransactionIds([]);
      setSearchQuery("");
    }
  }, [isAddDialogOpen]);

  const handleTransactionToggle = (transactionId: number) => {
    setSelectedTransactionIds(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactionIds.length === filteredTransactions.length) {
      setSelectedTransactionIds([]);
    } else {
      setSelectedTransactionIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleAddTransactionsSubmit = async () => {
    if (!project || selectedTransactionIds.length === 0) return;

    setIsAddingTransactions(true);
    try {
      await addTransactionsToProject.mutateAsync({
        projectId: project.id,
        transactionIds: selectedTransactionIds
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add transactions to project", error);
    } finally {
      setIsAddingTransactions(false);
    }
  };

  // Calculate total from project summary
  const totalCalculation = useMemo(() => {
    if (!projectSummary || projectSummary.length === 0) {
      return { total_income: 0, total_expense: 0, total_net: 0, base_currency_code: null, base_currency_symbol: null, can_calculate: true };
    }
    return calculateProjectTotalInBaseCurrency(projectSummary);
  }, [projectSummary]);

  if (!project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Proyek tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mb-4">Proyek yang Anda cari tidak ada atau telah dihapus</p>
            <Button onClick={() => navigate("/business-project")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Proyek
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const handleDelete = () => {
    deleteProject(project.id);
    setIsDeleteModalOpen(false);
    navigate("/business-project");
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate("/business-project")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground text-sm mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {project.start_date ? formatDate(project.start_date) : "Belum ditentukan"}
                  {project.end_date && ` — ${formatDate(project.end_date)}`}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
              <Button variant="outline" onClick={() => project && projectDialog.openEdit(project)}>
                <Edit className="w-4 h-4 mr-2" />
                Ubah
              </Button>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Pemasukan */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-emerald-500/10 shrink-0">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Pemasukan</span>
              </div>
              {totalCalculation.can_calculate ? (
                <p className="text-lg font-bold tabular-nums text-emerald-600">
                  {formatAmountCurrency(totalCalculation.total_income, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kurs belum tersedia</span>
                </div>
              )}
            </div>

            {/* Total Pengeluaran */}
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50 shadow-none">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-rose-500/10 shrink-0">
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Total Pengeluaran</span>
              </div>
              {totalCalculation.can_calculate ? (
                <p className="text-lg font-bold tabular-nums text-rose-600">
                  {formatAmountCurrency(totalCalculation.total_expense, totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                </p>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kurs belum tersedia</span>
                </div>
              )}
            </div>

            {/* Net */}
            <div className={`p-4 rounded-xl shadow-none ${totalCalculation.total_net >= 0 ? 'border border-emerald-100 bg-emerald-50/50' : 'border border-rose-100 bg-rose-50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-md shrink-0 ${totalCalculation.total_net >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                  <TrendingUp className={`w-3.5 h-3.5 ${totalCalculation.total_net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Net</span>
              </div>
              {totalCalculation.can_calculate ? (
                <AmountText amount={totalCalculation.total_net} showSign className="text-lg font-bold tabular-nums">
                  {formatAmountCurrency(Math.abs(totalCalculation.total_net), totalCalculation.base_currency_code, totalCalculation.base_currency_symbol)}
                </AmountText>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Kurs belum tersedia</span>
                </div>
              )}
            </div>
          </div>

          {/* Description if available */}
          {project.description && (
            <p className="text-muted-foreground text-sm">{project.description}</p>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat</TabsTrigger>
            </TabsList>

            {/* Project Summary */}
            <TabsContent value="summary" className="space-y-6">
              {projectTransactions && projectTransactions.length > 0 ? (
                <>
                  <BusinessProjectTrendChart
                    transactions={projectTransactions}
                    baseCurrencyCode={totalCalculation.base_currency_code}
                    baseCurrencySymbol={totalCalculation.base_currency_symbol}
                  />
                  {projectSummary && projectSummary.length > 0 && (
                    <BusinessProjectSummaryCard
                      summaryData={projectSummary}
                      title={`Ringkasan Keuangan - ${project.name}`}
                    />
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-sm mb-1">Belum ada transaksi</p>
                  <p className="text-xs text-muted-foreground">Tambahkan transaksi ke proyek ini untuk melihat ringkasan</p>
                </div>
              )}
            </TabsContent>

            {/* Transaction list */}
            <TabsContent value="history" className="space-y-4">
              <BusinessProjectTransactionList project={project} />
            </TabsContent>
          </Tabs>
        </div>

        <BusinessProjectDialog
          open={projectDialog.open}
          onOpenChange={(open) => !open && projectDialog.close()}
          form={form}
          isLoading={projectDialog.isLoading}
          onSubmit={handleFormSubmit}
          project={project}
        />

        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          title="Hapus Proyek Bisnis"
          description="Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan."
          onConfirm={handleDelete}
        />

        <BusinessProjectTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          project={project}
          isLoading={isAddingTransactions}
          selectedTransactionIds={selectedTransactionIds}
          onTransactionToggle={handleTransactionToggle}
          onSelectAll={handleSelectAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filteredTransactions={filteredTransactions}
          availableTransactionsCount={availableTransactions.length}
          onSubmit={handleAddTransactionsSubmit}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BusinessProjectDetail;
