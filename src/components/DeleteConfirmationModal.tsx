import ConfirmationModal from "@/components/ConfirmationModal";
import { useDeleteConfirmation, type UseDeleteConfirmationReturn } from "@/hooks/use-delete-confirmation";

interface DeleteConfirmationModalProps<T> {
  deleteConfirmation: UseDeleteConfirmationReturn<T>;
  onConfirm: (item: T) => void;
}

export function DeleteConfirmationModal<T>({
  deleteConfirmation,
  onConfirm,
}: DeleteConfirmationModalProps<T>) {
  return (
    <ConfirmationModal
      open={deleteConfirmation.open}
      onOpenChange={deleteConfirmation.onOpenChange}
      onConfirm={() => deleteConfirmation.handleConfirm(onConfirm)}
      title={deleteConfirmation.config.title}
      description={deleteConfirmation.config.description}
      confirmText={deleteConfirmation.config.confirmText}
      cancelText={deleteConfirmation.config.cancelText}
      variant="destructive"
    />
  );
}

export { useDeleteConfirmation };
