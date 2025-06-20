
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface BusinessProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onSuccess?: () => void;
}

const BusinessProjectDialog = ({ open, onOpenChange, project, onSuccess }: BusinessProjectDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProjectFormData>({
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      start_date: project?.start_date || "",
      end_date: project?.end_date || "",
    },
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      if (project) {
        // Update existing project
        const { error } = await supabase
          .from("business_projects")
          .update({
            name: data.name,
            description: data.description,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
          })
          .eq("id", project.id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast({ title: "Proyek berhasil diperbarui" });
      } else {
        // Create new project
        const { error } = await supabase
          .from("business_projects")
          .insert({
            user_id: user.id,
            name: data.name,
            description: data.description,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
          });

        if (error) throw error;
        toast({ title: "Proyek berhasil ditambahkan" });
      }

      queryClient.invalidateQueries({ queryKey: ["business_projects"] });
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error saving project:", error);
      toast({ 
        title: "Error", 
        description: "Gagal menyimpan proyek",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
