import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import PageLoading from "@/components/PageLoading";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import { BusinessProjectTable } from "@/components/business-project/BusinessProjectTable";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useCreateBusinessProject, useUpdateBusinessProject, useDeleteBusinessProject } from "@/hooks/queries/use-business-projects";
import { useBusinessProjectsPaginated } from "@/hooks/queries/paginated/use-business-projects-paginated";
import { useBusinessProjectsSummaryAll } from "@/hooks/queries/use-business-project-summary";
import { BusinessProjectModel } from "@/models/business-projects";
import { BusinessProjectFormData, defaultBusinessProjectFormValues } from "@/form-dto/business-projects";
import { useTableState } from "@/hooks/use-table-state";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";

const BusinessProject = () => {
  const navigate = useNavigate();
  
  const createProject = useCreateBusinessProject();
  const updateProject = useUpdateBusinessProject();
  const { mutate: deleteBusinessProject } = useDeleteBusinessProject();

  // Form state managed at page level
  const form = useForm<BusinessProjectFormData>({
    defaultValues: defaultBusinessProjectFormValues,
  });

  // Dialog state using reusable hook
  const dialog = useDialogState<BusinessProjectModel, BusinessProjectFormData>({
    form,
    defaultValues: defaultBusinessProjectFormValues,
    mapDataToForm: (project) => ({
      name: project.name || "",
      description: project.description || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
    }),
  });

  // Table state management using generic hook
  const { state: tableState, actions: tableActions } = useTableState({
    initialPage: 1,
    initialPageSize: 10,
  });

  const { data: paged, isLoading } = useBusinessProjectsPaginated({
    page: tableState.page,
    itemsPerPage: tableState.pageSize,
    searchTerm: tableState.searchTerm,
    filters: tableState.filters,
  });
  const projects = paged?.data || [];
  const totalCount = paged?.count || 0;

  // Fetch all projects summary for displaying in the table
  const { data: projectsSummary } = useBusinessProjectsSummaryAll();

  // Delete confirmation hook
  const deleteConfirmation = useDeleteConfirmation<number>({
    title: "Hapus Proyek Bisnis",
    description: "Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan.",
  });

  // Mutation callbacks
  const { handleSuccess, handleError } = useMutationCallbacks({
    setIsLoading: dialog.setIsLoading,
    onOpenChange: (open) => !open && dialog.close(),
    form,
    queryKeysToInvalidate: QUERY_KEY_SETS.BUSINESS_PROJECTS,
  });

  const handleFormSubmit = (data: BusinessProjectFormData) => {
    dialog.setIsLoading(true);
    if (dialog.selectedData) {
      updateProject.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    } else {
      createProject.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError,
      });
    }
  };

  const handleView = (project: BusinessProjectModel) => {
    navigate(`/business-project/${project.id}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageLoading message="Memuat data proyek bisnis..." />
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Proyek Bisnis</h1>
              <p className="text-sm text-muted-foreground mt-1">Kelola proyek bisnis dan investasi Anda</p>
            </div>
            <Button onClick={dialog.openAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Proyek
            </Button>
          </div>

          {/* Business Project Table */}
          <BusinessProjectTable
            projects={projects}
            projectsSummary={projectsSummary}
            isLoading={isLoading}
            totalCount={totalCount}
            page={tableState.page}
            pageSize={tableState.pageSize}
            searchTerm={tableState.searchTerm}
            filters={tableState.filters}
            onPageChange={tableActions.handlePageChange}
            onPageSizeChange={tableActions.handlePageSizeChange}
            onSearchChange={tableActions.handleSearchChange}
            onFiltersChange={tableActions.handleFiltersChange}
            onEdit={dialog.openEdit}
            onDelete={deleteConfirmation.openModal}
            onView={handleView}
          />
        </div>

        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={(id) => deleteBusinessProject(id)}
        />

        <BusinessProjectDialog
          open={dialog.open}
          onOpenChange={(open) => !open && dialog.close()}
          form={form}
          isLoading={dialog.isLoading}
          onSubmit={handleFormSubmit}
          project={dialog.selectedData}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BusinessProject;
