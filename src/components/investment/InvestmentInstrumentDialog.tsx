
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { defaultInstrumentFormValues, InstrumentFormData } from "@/form-dto/investment-instruments";
import { useCreateInvestmentInstrument, useUpdateInvestmentInstrument } from "@/hooks/queries";

interface InvestmentInstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instrument?: any;
  onSuccess?: () => void;
}

const InvestmentInstrumentDialog = ({ open, onOpenChange, instrument, onSuccess }: InvestmentInstrumentDialogProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const createInstrument = useCreateInvestmentInstrument();
  const updateInstrument = useUpdateInvestmentInstrument();

  const form = useForm<InstrumentFormData>({
    defaultValues: defaultInstrumentFormValues,
  });

  const onSubmit = async (data: InstrumentFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    if (instrument) {
      updateInstrument.mutate({ id: instrument.id, ...data });
    } else {
      createInstrument.mutate(data);
    }
  };

  // Reset form when instrument prop changes or dialog opens/closes
  useEffect(() => {
    if (open) {
      if (instrument) {
        form.reset({
          name: instrument.name || "",
          unit_label: instrument.unit_label || "",
          is_trackable: instrument.is_trackable ?? false,
        });
      } else {
        form.reset(defaultInstrumentFormValues);
      }
    }
  }, [instrument, open, form]);

  useEffect(() => {
    if (createInstrument.isSuccess || updateInstrument.isSuccess) {
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    }
  }, [createInstrument.isSuccess, updateInstrument.isSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {instrument ? "Edit Instrumen Investasi" : "Tambah Instrumen Investasi Baru"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama instrumen harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Instrumen</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama instrumen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit_label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: lembar, lot, unit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_trackable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Dapat Dilacak
                    </FormLabel>
                    <p className="text-sm text-gray-600">
                      Apakah nilai instrumen ini dapat dilacak atau dimonitor?
                    </p>
                  </div>
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
                {isLoading ? "Menyimpan..." : instrument ? "Update" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentInstrumentDialog;
