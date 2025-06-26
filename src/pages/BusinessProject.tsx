
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Edit, Trash2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useBusinessProjects, useDeleteBusinessProject } from "@/hooks/queries";

interface BusinessProject {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

const BusinessProject = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [businessProjectToDelete, setBusinessProjectToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<BusinessProject | undefined>(undefined);

  const { mutate: deleteBusinessProject } = useDeleteBusinessProject();

  const { data: projects, isLoading } = useBusinessProjects();

  const handleEdit = (project: BusinessProject) => {
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

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus BusinessProject"
          description="Apakah Anda yakin ingin menghapus proyek ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
        
        <Card className="mb-6">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Proyek Bisnis</CardTitle>
              <p className="text-gray-600">Kelola proyek bisnis dan investasi Anda</p>
            </div>
            {projects && projects.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Proyek
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat proyek bisnis...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada proyek bisnis yang dibuat</p>
                <Button onClick={handleAddNew} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Proyek Pertama
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
