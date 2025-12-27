import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InstrumentFormData } from "@/form-dto/investment-instruments";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";

interface InvestmentInstrumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<InstrumentFormData>;
  isLoading: boolean;
  onSubmit: (data: InstrumentFormData) => void;
  instrument?: InvestmentInstrumentModel;
}

const InvestmentInstrumentDialog = ({ 
  open, 
  onOpenChange, 
  form, 
  isLoading, 
  onSubmit, 
  instrument 
}: InvestmentInstrumentDialogProps) => {
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
                    <p className="text-sm text-muted-foreground">
                      Apakah nilai instrumen ini dapat dilacak atau dimonitor?
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
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
