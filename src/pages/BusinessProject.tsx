import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2, Eye } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useBusinessProjects, useDeleteBusinessProject } from "@/hooks/queries/use-business-projects";
import { useBusinessProjectsPaginated } from "@/hooks/queries/paginated/use-business-projects-paginated";
import { BusinessProjectModel } from "@/models/business-projects";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const BusinessProject = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [businessProjectToDelete, setBusinessProjectToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<BusinessProjectModel | undefined>(undefined);
  const { mutate: deleteBusinessProject } = useDeleteBusinessProject();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useBusinessProjectsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const projects = paged?.data || [];

  const handleView = (project: BusinessProjectModel) => {
    navigate(`/business-project/${project.id}`);
  };

  const handleEdit = (project: BusinessProjectModel) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (businessProjectId: number) => {
    setBusinessProjectToDelete(businessProjectId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (businessProjectToDelete) {
      deleteBusinessProject(businessProjectToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedProject(undefined);
    setIsDialogOpen(true);
  };

  const renderProjectItem = (project: BusinessProjectModel) => (
    <Card key={project.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <h3 className="font-semibold">{project.name}</h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Mulai: {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Belum ditentukan"}
            </div>
            {project.end_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Selesai: {new Date(project.end_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleView(project)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Detail
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(project)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClick(project.id)}
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
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Proyek Bisnis"
          description="Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
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
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Proyek
              </Button>
            )
          }
        />

        {(!projects || projects.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Proyek Pertama
            </Button>
          </div>
        )}

        <BusinessProjectDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          project={selectedProject}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["business_projects"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BusinessProject;
