import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { defaultProjectFormValues, ProjectFormData } from "@/form-dto/business-projects";
import { useCreateProject, useUpdateProject } from "@/hooks/queries";

interface BusinessProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onSuccess?: () => void;
}

const BusinessProjectDialog = ({ open, onOpenChange, project, onSuccess }: BusinessProjectDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const form = useForm<ProjectFormData>({
    defaultValues: defaultProjectFormValues,
  });

  // Reset form when project prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (project) {
        form.reset({
          name: project.name || "",
          description: project.description || "",
          start_date: project.start_date || "",
          end_date: project.end_date || "",
        });
      } else {
        form.reset(defaultProjectFormValues);
      }
    }
  }, [project, open, form]);

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    if (project) {
      updateProject.mutate({ id: project.id, ...data });
    } else {
      createProject.mutate(data);
    }
  };

  useEffect(() => {
    if (createProject.isSuccess || updateProject.isSuccess) {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    }
  }, [createProject.isSuccess, updateProject.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? "Edit Proyek Bisnis" : "Tambah Proyek Bisnis Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama proyek harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Proyek</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama proyek" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Masukkan deskripsi proyek" 
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Mulai</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tanggal Selesai</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : project ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProjectDialog;
