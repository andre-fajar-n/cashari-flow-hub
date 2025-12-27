import { useState, useCallback } from "react";
import { UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";

interface UseDialogStateOptions<TData, TFormValues extends FieldValues> {
  form: UseFormReturn<TFormValues>;
  defaultValues: DefaultValues<TFormValues>;
  mapDataToForm?: (data: TData) => Partial<TFormValues>;
}

interface UseDialogStateReturn<TData> {
  open: boolean;
  isLoading: boolean;
  selectedData: TData | null;
  openAdd: () => void;
  openEdit: (data: TData) => void;
  close: () => void;
  setIsLoading: (loading: boolean) => void;
  handleSuccess: () => void;
}

export function useDialogState<TData, TFormValues extends FieldValues>({
  form,
  defaultValues,
  mapDataToForm,
}: UseDialogStateOptions<TData, TFormValues>): UseDialogStateReturn<TData> {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedData, setSelectedData] = useState<TData | null>(null);

  const openAdd = useCallback(() => {
    setSelectedData(null);
    form.reset(defaultValues);
    setOpen(true);
  }, [form, defaultValues]);

  const openEdit = useCallback(
    (data: TData) => {
      setSelectedData(data);
      if (mapDataToForm) {
        form.reset(mapDataToForm(data) as DefaultValues<TFormValues>);
      }
      setOpen(true);
    },
    [form, mapDataToForm]
  );

  const close = useCallback(() => {
    setOpen(false);
    setSelectedData(null);
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const handleSuccess = useCallback(() => {
    setIsLoading(false);
    setOpen(false);
    setSelectedData(null);
    form.reset(defaultValues);
  }, [form, defaultValues]);

  return {
    open,
    isLoading,
    selectedData,
    openAdd,
    openEdit,
    close,
    setIsLoading,
    handleSuccess,
  };
}
