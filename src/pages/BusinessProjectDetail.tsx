
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import BusinessProjectTransactionList from "@/components/business-project/BusinessProjectTransactionList";
import { useBusinessProjects } from "@/hooks/queries";
import { useState } from "react";
import BusinessProjectDialog from "@/components/business-project/BusinessProjectDialog";

const BusinessProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: projects } = useBusinessProjects();
  const project = projects?.find(p => p.id === parseInt(id || "0"));

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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
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
            <Button 
              onClick={() => setIsEditDialogOpen(true)}
              variant="outline"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Proyek
            </Button>
          </div>

          {/* Project Info */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Tanggal Mulai:</span>
                <span className="font-medium">
                  {project.start_date 
                    ? new Date(project.start_date).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : "Belum ditentukan"
                  }
                </span>
              </div>
              {project.end_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tanggal Selesai:</span>
                  <span className="font-medium">
                    {new Date(project.end_date).toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Transactions */}
          <BusinessProjectTransactionList project={project} />
        </div>

        <BusinessProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          project={project}
          onSuccess={() => {
            // Refresh will happen automatically due to query invalidation
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default BusinessProjectDetail;
