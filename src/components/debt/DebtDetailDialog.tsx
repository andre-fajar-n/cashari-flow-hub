
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, DollarSign, CheckCircle } from "lucide-react";
import { DEBT_TYPES } from "@/constants/enums";
import { useMarkDebtAsPaid } from "@/hooks/queries/use-debt-histories";
import DebtHistoryDialog from "./DebtHistoryDialog";
import DebtHistoryList from "./DebtHistoryList";
import ConfirmationModal from "@/components/ConfirmationModal";

interface DebtDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: any;
  onSuccess?: () => void;
}

const DebtDetailDialog = ({ open, onOpenChange, debt, onSuccess }: DebtDetailDialogProps) => {
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const markAsPaid = useMarkDebtAsPaid();

  if (!debt) return null;

  const handleMarkAsPaid = async () => {
    try {
      await markAsPaid.mutateAsync(debt.id);
      setIsMarkPaidModalOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error marking debt as paid:", error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {debt.name}
              <Badge variant={debt.status === 'active' ? 'default' : 'secondary'}>
                {debt.status === 'active' ? 'Aktif' : 'Lunas'}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tipe:</span>
                <div className="font-medium">
                  {debt.type === DEBT_TYPES.LOAN ? 'Hutang' : 'Piutang'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Mata Uang:</span>
                <div className="font-medium">{debt.currency_code}</div>
              </div>
              {debt.due_date && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Jatuh Tempo:</span>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(debt.due_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="history">History Pembayaran</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">History Pembayaran</h3>
                  <div className="flex gap-2">
                    {debt.status === 'active' && (
                      <>
                        <Button
                          onClick={() => setIsHistoryDialogOpen(true)}
                          size="sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Tambah History
                        </Button>
                        <Button
                          onClick={() => setIsMarkPaidModalOpen(true)}
                          variant="outline"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Tandai Lunas
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <DebtHistoryList debtId={debt.id} />
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <DebtHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        debtId={debt.id}
        debtCurrency={debt.currency_code}
        onSuccess={() => {
          onSuccess?.();
        }}
      />

      <ConfirmationModal
        open={isMarkPaidModalOpen}
        onOpenChange={setIsMarkPaidModalOpen}
        onConfirm={handleMarkAsPaid}
        title="Tandai Sebagai Lunas"
        description="Apakah Anda yakin ingin menandai hutang/piutang ini sebagai lunas? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Tandai Lunas"
        cancelText="Batal"
      />
    </>
  );
};

export default DebtDetailDialog;
