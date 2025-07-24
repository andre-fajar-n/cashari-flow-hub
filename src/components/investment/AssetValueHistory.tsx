
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, TrendingUp } from "lucide-react";
import { useInvestmentAssetValues, useDeleteInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import { InvestmentAssetModel } from "@/models/investment-assets";
import ConfirmationModal from "@/components/ConfirmationModal";
import AssetValueDialog from "./AssetValueDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface AssetValueHistoryProps {
  asset: InvestmentAssetModel;
}

const AssetValueHistory = ({ asset }: AssetValueHistoryProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetValueToDelete, setAssetValueToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAssetValue, setSelectedAssetValue] = useState<any | undefined>(undefined);
  
  const { mutate: deleteAssetValue } = useDeleteInvestmentAssetValue();
  const { data: assetValues, isLoading } = useInvestmentAssetValues(asset.id);

  const handleEdit = (assetValue: any) => {
    setSelectedAssetValue(assetValue);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (assetValueId: number) => {
    setAssetValueToDelete(assetValueId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetValueToDelete) {
      deleteAssetValue(assetValueToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedAssetValue(undefined);
    setIsDialogOpen(true);
  };

  const renderAssetValueItem = (assetValue: any) => (
    <Card key={assetValue.id} className="p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <h3 className="font-semibold">
              {assetValue.value.toLocaleString()} {asset.currency_code || 'IDR'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tanggal: {format(new Date(assetValue.date), 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleEdit(assetValue)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDeleteClick(assetValue.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Hapus
          </Button>
        </div>
      </div>
    </Card>
  );

  // Prepare chart data
  const chartData = assetValues?.map(value => ({
    date: format(new Date(value.date), 'dd/MM'),
    value: value.value,
    fullDate: value.date
  })).reverse() || [];

  const safeAssetValues = assetValues || [];

  return (
    <div className="space-y-6">
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Nilai Aset"
        description="Apakah Anda yakin ingin menghapus nilai aset ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />

      {/* Chart Section */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Grafik Nilai {asset.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()} ${asset.currency_code || 'IDR'}`, 'Nilai']}
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.date === label);
                      return item ? format(new Date(item.fullDate), 'dd MMMM yyyy') : label;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Asset Values List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>History Nilai - {asset.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Kelola history nilai untuk aset {asset.name} {asset.symbol ? `(${asset.symbol})` : ''}
              </p>
            </div>
            {safeAssetValues.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Nilai
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Memuat data...</p>
            </div>
          ) : safeAssetValues.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Belum ada history nilai aset</p>
              <Button onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Nilai Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeAssetValues.map(renderAssetValueItem)}
            </div>
          )}
        </CardContent>
      </Card>

      <AssetValueDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        assetValue={selectedAssetValue}
        assetId={asset.id}
        onSuccess={() => {
          // Dialog will close automatically on success
        }}
      />
    </div>
  );
};

export default AssetValueHistory;
