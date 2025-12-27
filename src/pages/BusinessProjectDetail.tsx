import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Edit, Calendar, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ConfirmationModal from "@/components/ConfirmationModal";
import BusinessProjectTransactionDialog from "@/components/business-project/BusinessProjectTransactionDialog";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectTransactionList from "@/components/business-project/BusinessProjectTransactionList";
import { useBusinessProjectDetail, useDeleteBusinessProject, useUpdateBusinessProject } from "@/hooks/queries/use-business-projects";
import { useState, useEffect } from "react";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import { formatDate } from "@/lib/date";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { TransactionFilter } from "@/form-dto/transactions";
import { BusinessProjectFormData, defaultBusinessProjectFormValues, mapBusinessProjectToFormData } from "@/form-dto/business-projects";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";
import { BusinessProjectModel } from "@/models/business-projects";

const BusinessProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for BusinessProjectTransactionDialog
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingTransactions, setIsAddingTransactions] = useState(false);

  const { data: project } = useBusinessProjectDetail(parseInt(id || "0"));
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

  if (!project) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Proyek tidak ditemukan</p>
            <Button
              onClick={() => navigate("/business-project")}
              className="mt-4"
              variant="outline"
            >
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
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/business-project")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{project.name}</h1>
                  {project.description && (
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Tambah Transaksi
                </Button>
                <Button
                  onClick={() => project && projectDialog.openEdit(project)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Ubah Proyek
                </Button>
                <Button
                  onClick={() => setIsDeleteModalOpen(true)}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus
                </Button>
              </div>
            </div>
          </div>

          {/* Project Info */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tanggal Mulai:</span>
                <span className="font-medium">
                  {project.start_date ? formatDate(project.start_date) : "Belum ditentukan"}
                </span>
              </div>
              {project.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tanggal Selesai:</span>
                  <span className="font-medium">
                    {project.end_date ? formatDate(project.end_date) : "Belum ditentukan"}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Transactions */}
          <BusinessProjectTransactionList project={project} />
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
