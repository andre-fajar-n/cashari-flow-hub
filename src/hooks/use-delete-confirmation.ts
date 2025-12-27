import { useState, useCallback } from "react";

export interface DeleteConfirmationConfig {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface UseDeleteConfirmationReturn<T = number> {
  open: boolean;
  itemToDelete: T | null;
  config: DeleteConfirmationConfig;
  openModal: (item: T, customConfig?: DeleteConfirmationConfig) => void;
  closeModal: () => void;
  handleConfirm: (onConfirm: (item: T) => void) => void;
  onOpenChange: (open: boolean) => void;
}

const defaultConfig: DeleteConfirmationConfig = {
  title: "Hapus Item",
  description: "Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.",
  confirmText: "Ya, Hapus",
  cancelText: "Batal",
};

export function useDeleteConfirmation<T = number>(
  initialConfig?: DeleteConfirmationConfig
): UseDeleteConfirmationReturn<T> {
  const [open, setOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const [config, setConfig] = useState<DeleteConfirmationConfig>({
    ...defaultConfig,
    ...initialConfig,
  });

  const openModal = useCallback(
    (item: T, customConfig?: DeleteConfirmationConfig) => {
      setItemToDelete(item);
      if (customConfig) {
        setConfig((prev) => ({ ...prev, ...customConfig }));
      }
      setOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    setOpen(false);
    setItemToDelete(null);
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setOpen(false);
      setItemToDelete(null);
    }
  }, []);

  const handleConfirm = useCallback(
    (onConfirm: (item: T) => void) => {
      if (itemToDelete !== null) {
        onConfirm(itemToDelete);
        closeModal();
      }
    },
    [itemToDelete, closeModal]
  );

  return {
    open,
    itemToDelete,
    config,
    openModal,
    closeModal,
    handleConfirm,
    onOpenChange,
  };
}
