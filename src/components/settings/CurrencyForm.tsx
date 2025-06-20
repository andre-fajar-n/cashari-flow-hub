
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface Currency {
  code: string;
  name: string;
  symbol: string;
  is_default: boolean;
}

interface CurrencyFormData {
  code: string;
  name: string;
  symbol: string;
}

interface CurrencyFormProps {
  editingCurrency: Currency | null;
  onSubmit: (data: CurrencyFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const CurrencyForm = ({ editingCurrency, onSubmit, onCancel, isLoading }: CurrencyFormProps) => {
  const form = useForm<CurrencyFormData>({
    defaultValues: {
      code: editingCurrency?.code || "",
      name: editingCurrency?.name || "",
      symbol: editingCurrency?.symbol || "",
    },
  });

  const handleSubmit = (data: CurrencyFormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode</FormLabel>
                <FormControl>
                  <Input placeholder="USD" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama</FormLabel>
                <FormControl>
                  <Input placeholder="US Dollar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="symbol"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Symbol</FormLabel>
                <FormControl>
                  <Input placeholder="$" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Menyimpan..." : editingCurrency ? "Perbarui" : "Simpan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CurrencyForm;
