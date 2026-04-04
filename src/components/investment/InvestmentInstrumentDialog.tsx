import { UseFormReturn } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InstrumentFormData } from "@/form-dto/investment-instruments";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { TrendingUp, Tag, Activity, Loader2 } from "lucide-react";

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
  const isEditing = !!instrument;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg">
              {isEditing ? "Edit Instrumen Investasi" : "Tambah Instrumen Baru"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEditing
              ? "Perbarui informasi instrumen investasi Anda."
              : "Tambahkan instrumen investasi baru untuk mulai melacak portofolio Anda."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-1">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nama instrumen harus diisi" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                    Nama Instrumen
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contoh: Saham BBCA, Reksa Dana XYZ" {...field} />
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
                  <FormLabel className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                    Label Unit
                    <span className="text-xs text-muted-foreground font-normal">(opsional)</span>
                  </FormLabel>
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
                <FormItem className="flex flex-row items-start gap-3 rounded-lg border p-4 bg-muted/30">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Instrumen Dapat Dilacak
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Aktifkan untuk mencatat harga pasar dan menghitung unrealized profit/loss secara otomatis.
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : isEditing ? "Simpan Perubahan" : "Tambah Instrumen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentInstrumentDialog;
