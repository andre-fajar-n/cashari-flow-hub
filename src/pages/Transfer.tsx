
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRightLeft, Edit, Trash2 } from "lucide-react";
import { useTransfers, useDeleteTransfer } from "@/hooks/queries/useTransfers";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransferDialog from "@/components/transfers/TransferDialog";
import { useQueryClient } from "@tanstack/react-query";
import ConfirmationModal from "@/components/ConfirmationModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TransferModel } from "@/models/transfer";
import { formatAmount } from "@/lib/utils";


const Transfer = () => {
  const [activeDropdownId, setActiveDropdownId] = useState<number | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transferToDelete, setTransferToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferModel | undefined>(undefined);
  const { data: transfers, isLoading } = useTransfers();
  const { mutate: deleteTransfer } = useDeleteTransfer();
  const queryClient = useQueryClient();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const openDialog = (transfer: TransferModel | undefined) => {
    setSelectedTransfer(transfer);
    setActiveDropdownId(null);
    setTimeout(() => setIsDialogOpen(true), 50)
  };

  const handleDeleteClick = (transactionId: number) => {
    setTransferToDelete(transactionId);
    setActiveDropdownId(null);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transferToDelete) {
      deleteTransfer(transferToDelete);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Transfer</h1>
              <p className="text-muted-foreground">Kelola transfer antar dompet</p>
            </div>
            <Button onClick={() => openDialog(undefined)}>
              <Plus className="w-4 h-4 mr-2" />
              Transfer Baru
            </Button>

            <TransferDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              transfer={selectedTransfer}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["transfers"] });
              }}
            />

            <ConfirmationModal
              open={isDeleteModalOpen}
              onOpenChange={setIsDeleteModalOpen}
              onConfirm={handleConfirmDelete}
              title="Hapus Transfer"
              description="Apakah Anda yakin ingin menghapus transfer ini? Tindakan ini tidak dapat dibatalkan."
              confirmText="Ya, Hapus"
              cancelText="Batal"
              variant="destructive"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Riwayat Transfer</CardTitle>
              <CardDescription>
                Daftar semua transfer yang telah dilakukan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat transfer...</p>
                </div>
              ) : transfers?.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada transfer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transfers?.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {(transfer.from_wallet as any)?.name} → {(transfer.to_wallet as any)?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(transfer.date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-red-600">
                                -{formatAmount(transfer.amount_from, (transfer.from_currency as any)?.symbol)}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                              <Badge variant="outline" className="text-green-600">
                                +{formatAmount(transfer.amount_to, (transfer.to_currency as any)?.symbol)}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {transfer.currency_from} → {transfer.currency_to}
                            </div>
                          </div>
                        </div>
                        <DropdownMenu
                          open={activeDropdownId === transfer.id}
                          onOpenChange={(open) =>
                            setActiveDropdownId(open ? transfer.id : null)
                          }
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => openDialog(transfer)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(transfer.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Transfer;
