import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings2, Info } from "lucide-react";
import { CurrencyDropdown } from "@/components/ui/dropdowns";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useUserSettings, useCreateUserSettings, useUpdateUserSettings } from "@/hooks/queries/use-user-settings";
import { UserSettingsFormData, defaultUserSettingsFormValues } from "@/form-dto/user-settings";

const userSettingsSchema = z.object({
  base_currency_code: z.string().min(1, "Mata uang dasar harus dipilih"),
});

const UserSettingsManagement = () => {
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const { data: userSettings, isLoading: settingsLoading } = useUserSettings();
  const createUserSettings = useCreateUserSettings();
  const updateUserSettings = useUpdateUserSettings();

  const form = useForm<UserSettingsFormData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: defaultUserSettingsFormValues,
  });

  // Load existing settings into form
  useEffect(() => {
    if (userSettings) {
      form.reset({
        base_currency_code: userSettings.base_currency_code,
      });
    }
  }, [userSettings, form]);

  const onSubmit = (data: UserSettingsFormData) => {
    if (userSettings) {
      updateUserSettings.mutate(data);
    } else {
      createUserSettings.mutate(data);
    }
  };

  const isLoading = currenciesLoading || settingsLoading;
  const isSaving = createUserSettings.isPending || updateUserSettings.isPending;

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-gray-600" />
          <div>
            <div className="font-semibold text-gray-900">Pengaturan Umum</div>
            <div className="text-xs text-muted-foreground">Konfigurasi preferensi aplikasi</div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-100 rounded-lg" />
            <div className="h-8 bg-gray-100 rounded w-32 mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
        <Settings2 className="w-5 h-5 text-gray-600" />
        <div>
          <div className="font-semibold text-gray-900">Pengaturan Umum</div>
          <div className="text-xs text-muted-foreground">Konfigurasi preferensi aplikasi</div>
        </div>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <CurrencyDropdown
                control={form.control}
                name="base_currency_code"
                label="Mata Uang Dasar"
                currencies={currencies || []}
                rules={{ required: "Mata uang dasar harus dipilih" }}
              />
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Mata uang dasar digunakan sebagai referensi untuk konversi nilai dan laporan keuangan keseluruhan.
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserSettingsManagement;
