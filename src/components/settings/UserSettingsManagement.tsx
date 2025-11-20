import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Dropdown } from "@/components/ui/dropdown";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Settings } from "lucide-react";
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Pengaturan Umum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Memuat pengaturan...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Pengaturan Umum
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Dropdown
                control={form.control}
                name="base_currency_code"
                label="Mata Uang Dasar"
                placeholder="Pilih mata uang dasar"
                rules={{ required: "Mata uang dasar harus dipilih" }}
                options={[
                  { value: "none", label: "Pilih mata uang dasar" },
                  ...(currencies?.map((currency) => ({
                    value: currency.code,
                    label: `${currency.code} - ${currency.name} (${currency.symbol})`
                  })) || [])
                ]}
                onValueChange={(value) => form.setValue("base_currency_code", value === "none" ? "" : value)}
              />
              <div className="text-sm text-muted-foreground">
                Mata uang dasar akan digunakan untuk konversi dan laporan keuangan
              </div>
            </div>

            <div className="flex gap-2">
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
