import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import { DeleteConfirmationModal, useDeleteConfirmation } from "@/components/DeleteConfirmationModal";
import { useCreateBusinessProject, useUpdateBusinessProject, useDeleteBusinessProject } from "@/hooks/queries/use-business-projects";
import { useBusinessProjectsPaginated } from "@/hooks/queries/paginated/use-business-projects-paginated";
import { BusinessProjectModel } from "@/models/business-projects";
import { BusinessProjectFormData, defaultBusinessProjectFormValues } from "@/form-dto/business-projects";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/lib/date";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useDialogState } from "@/hooks/use-dialog-state";

const BusinessProject = () => {
  const navigate = useNavigate();
  
  const createProject = useCreateBusinessProject();
  const updateProject = useUpdateBusinessProject();
  const { mutate: deleteBusinessProject } = useDeleteBusinessProject();
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useBusinessProjectsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const projects = paged?.data || [];

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
    queryKeysToInvalidate: QUERY_KEY_SETS.BUSINESS_PROJECTS
  });

  const handleFormSubmit = (data: BusinessProjectFormData) => {
    dialog.setIsLoading(true);
    if (dialog.selectedData) {
      updateProject.mutate({ id: dialog.selectedData.id, ...data }, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    } else {
      createProject.mutate(data, {
        onSuccess: handleSuccess,
        onError: handleError
      });
    }
  };

  const handleView = (project: BusinessProjectModel) => {
    navigate(`/business-project/${project.id}`);
  };


  const renderProjectItem = (project: BusinessProjectModel) => (
    <Card key={project.id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-2">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-gray-900 truncate">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
        </div>

        {/* Date Information */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs">
          <div className="flex items-center gap-1 text-blue-700">
            <Calendar className="w-3 h-3" />
            <span>
              Mulai: {project.start_date ? formatDate(project.start_date) : "Belum ditentukan"}
            </span>
          </div>
          {project.end_date && (
            <>
              <span className="hidden sm:inline text-blue-400 mx-1">•</span>
              <div className="flex items-center gap-1 text-blue-700">
                <Calendar className="w-3 h-3 sm:hidden" />
                <span>
                  Selesai: {formatDate(project.end_date)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-1 border-t-2 sm:border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => handleView(project)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detail
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => dialog.openEdit(project)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Ubah
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
            onClick={() => deleteConfirmation.openModal(project.id)}
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
      field: "start_date",
      label: "Tanggal Mulai",
      type: "date"
    },
    {
      field: "end_date",
      label: "Tanggal Selesai",
      type: "date"
    },
    {
      field: "description",
      label: "Deskripsi",
      type: "text"
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <DeleteConfirmationModal
          deleteConfirmation={deleteConfirmation}
          onConfirm={(id) => deleteBusinessProject(id)}
        />

        <DataTable
          data={projects}
          isLoading={isLoading}
          searchPlaceholder="Cari proyek..."
          searchFields={["name", "description"]}
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
          renderItem={renderProjectItem}
          emptyStateMessage="Belum ada proyek bisnis yang dibuat"
          title="Proyek Bisnis"
          description="Kelola proyek bisnis dan investasi Anda"
          headerActions={
            projects && projects.length > 0 && (
              <Button onClick={dialog.openAdd} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Proyek
              </Button>
            )
          }
        />

        {(!projects || projects.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={dialog.openAdd} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Proyek Pertama
            </Button>
          </div>
        )}

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
