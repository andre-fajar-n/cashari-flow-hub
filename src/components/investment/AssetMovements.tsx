import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import { ArrowUpRight, ArrowDownLeft, Calendar, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { formatAmountCurrency } from "@/lib/utils";
import { AmountText } from "@/components/ui/amount-text";
import { useGoalInvestmentRecords, useDeleteGoalInvestmentRecord } from "@/hooks/queries";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { DataTable } from "@/components/ui/data-table";

interface AssetMovementsProps {
  assetId: number;
  assetName: string;
}

const AssetMovements = ({ assetId, assetName }: AssetMovementsProps) => {
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });

  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: investmentRecords, isLoading } = useGoalInvestmentRecords();
  const { mutate: deleteRecord } = useDeleteGoalInvestmentRecord();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Filter records for this specific asset
  const assetRecords = investmentRecords?.filter(record => record.asset_id === assetId) || [];

  const handleDeleteClick = (id: number) => {
    setDeleteModal({ open: true, id });
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteModal.id) {
      deleteRecord(deleteModal.id, {
        onSuccess: () => {
          toast({
            title: "Berhasil",
            description: "Record berhasil dihapus",
          });
          setDeleteModal({ open: false, id: null });
        }
      });
    }
  };

  // Prepare render function for table items
  const renderAssetRecordItem = (record: any) => (
    <div key={record.id} className="p-4 border rounded-lg space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{formatDate(record.date)}</span>
        </div>
        <ActionDropdown
          isOpen={openDropdownId === record.id}
          onOpenChange={(open) => setOpenDropdownId(open ? record.id : null)}
          trigger={
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          }
          actions={[
            {
              label: "Edit",
              icon: <Edit className="w-4 h-4" />,
              onClick: () => {
                // TODO: Implement edit functionality
                toast({
                  title: "Info",
                  description: "Edit functionality akan ditambahkan",
                });
                setOpenDropdownId(null);
              }
            },
            {
              label: "Hapus",
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDeleteClick(record.id),
              variant: "destructive"
            }
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Goal</p>
          <p>{record.goal?.name || 'Tidak ada goal'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Wallet</p>
          <p>{record.wallet?.name || 'Tidak ada wallet'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Kategori</p>
          <Badge variant={record.category?.is_income ? "default" : "secondary"}>
            {record.category?.name || '-'}
          </Badge>
        </div>
        <div>
          <p className="text-muted-foreground">Jumlah</p>
          <AmountText 
            amount={record.amount || 0}
            showSign={true}
            className="font-medium"
          >
            {formatAmountCurrency(record.amount || 0, record.currency_code || 'IDR')}
          </AmountText>
        </div>
        {record.unit > 0 && (
          <div>
            <p className="text-muted-foreground">Unit</p>
            <p>{record.unit.toLocaleString("id-ID")} unit</p>
          </div>
        )}
        {record.note && record.note !== '-' && (
          <div className="col-span-2">
            <p className="text-muted-foreground">Catatan</p>
            <p>{record.note}</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Riwayat Aset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Memuat riwayat aset...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5" />
            Riwayat Aset - {assetName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assetRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Belum ada riwayat transaksi untuk aset {assetName}
              </p>
            </div>
          ) : (
            <DataTable
              data={assetRecords}
              isLoading={false}
              searchPlaceholder="Cari riwayat..."
              searchFields={["note"]}
              renderItem={renderAssetRecordItem}
              emptyStateMessage="Belum ada riwayat transaksi untuk aset"
            />
          )}
        </CardContent>
      </Card>

      <ConfirmationModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ ...deleteModal, open })}
        onConfirm={handleConfirmDelete}
        title="Hapus Record"
        description="Apakah Anda yakin ingin menghapus record ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
};

export default AssetMovements;