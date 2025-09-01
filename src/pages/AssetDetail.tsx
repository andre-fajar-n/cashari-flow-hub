import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import AssetValueDialog from "@/components/investment/AssetValueDialog";
import { useInvestmentAssets, useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetValues, useDeleteInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { DataTable } from "@/components/ui/data-table";
import AmountText from "@/components/ui/amount-text";
import { formatAmountCurrency } from "@/lib/currency";
import AssetSummary from "@/components/investment/AssetSummary";
import AssetRecordDialog from "@/components/investment/AssetRecordDialog";
import MovementsDataTable from "@/components/shared/MovementsDataTable";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import { useGoalTransfers } from "@/hooks/queries/use-goal-transfers";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useGoals } from "@/hooks/queries/use-goals";
import { useGoalInvestmentRecords } from "@/hooks/queries/use-goal-investment-records";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [selectedAssetValue, setSelectedAssetValue] = useState<any | undefined>(undefined);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [deleteValueModal, setDeleteValueModal] = useState<{
    open: boolean;
    id: number | null;
  }>({ open: false, id: null });

  const { mutate: deleteAsset } = useDeleteInvestmentAsset();
  const { mutate: deleteAssetValue } = useDeleteInvestmentAssetValue();
  const { data: assets } = useInvestmentAssets();
  const { data: assetValues, isLoading: isValuesLoading } = useInvestmentAssetValues(parseInt(id!));
  const { data: movements, isLoading: isMovementsLoading } = useMoneyMovements({ assetId: parseInt(id!) });
  const { data: transfers, isLoading: isTransfersLoading } = useGoalTransfers();
  const { data: wallets, isLoading: isWalletsLoading } = useWallets();
  const { data: goals, isLoading: isGoalsLoading } = useGoals();
  const { data: records, isLoading: isRecordsLoading } = useGoalInvestmentRecords(undefined, parseInt(id!));

  const isLoadingHistoryTab = isMovementsLoading || isTransfersLoading || isWalletsLoading || isGoalsLoading ||
                              isRecordsLoading;

  const asset = assets?.find(a => a.id === parseInt(id!)) as InvestmentAssetModel;

  if (!asset) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aset tidak ditemukan</p>
            <Button onClick={() => navigate('/investment-asset')} className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Daftar Aset
            </Button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Derive currency code from related wallet records (since assets no longer have currency_code)
  const assetCurrencyCode = movements?.find((r: any) => (r.asset_id ?? r.asset?.id) === (asset?.id))?.currency_code
    || (wallets && wallets.length > 0 ? wallets[0].currency_code : undefined)
    || 'unknown currency';

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteAsset(asset.id, {
      onSuccess: () => {
        navigate('/investment-asset');
      }
    });
  };

  const handleAddValue = () => {
    setSelectedAssetValue(undefined);
    setIsValueDialogOpen(true);
  };

  const handleEditValue = (assetValue: any) => {
    setSelectedAssetValue(assetValue);
    setIsValueDialogOpen(true);
  };
  const handleAddRecord = () => {
    setIsRecordDialogOpen(true);
  };
  const handleDeleteValueClick = (id: number) => {
    setDeleteValueModal({ open: true, id });
  };

  const handleConfirmDeleteValue = () => {
    if (deleteValueModal.id) {
      deleteAssetValue(deleteValueModal.id);
      setDeleteValueModal({ open: false, id: null });
    }
  };

  // Prepare chart data
  const chartData = assetValues?.map(value => ({
    date: format(new Date(value.date), 'dd/MM/yyyy'),
    value: value.value,
    fullDate: value.date
  })).reverse() || [];

  // Prepare table data for asset values history
  const valueHistoryTableData = assetValues || [];

  const renderValueHistoryItem = (value: any) => (
    <div key={value.id} className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-4">
          <div>
            <p className="font-medium">{format(new Date(value.date), 'dd/MM/yyyy')}</p>
            <p className="text-sm text-muted-foreground">Tanggal</p>
          </div>
          <div>
            <AmountText amount={value.value} showSign={true}>
              {formatAmountCurrency(value.value, assetCurrencyCode)}
            </AmountText>
            <p className="text-sm text-muted-foreground">Nilai</p>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditValue(value)}
        >
          <Edit className="w-3 h-3 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteValueClick(value.id)}
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Hapus
        </Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/investment-asset')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  {asset.name}
                  {asset.symbol && (
                    <span className="text-lg bg-blue-100 text-blue-800 px-3 py-1 rounded">
                      {asset.symbol}
                    </span>
                  )}
                </h1>
                <p className="text-muted-foreground">
                  Detail Aset Investasi - {asset.investment_instruments?.name}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDeleteClick}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleAddValue} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Tambah Nilai
            </Button>
            <Button onClick={handleAddRecord} variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Tambah Record
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">Riwayat Nilai</TabsTrigger>
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="movements">Riwayat</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
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
                            formatter={(value) => [`${Number(value).toLocaleString('id-ID')} ${assetCurrencyCode}`, 'Nilai']}
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

              {/* Value History Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    History Nilai Aset
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isValuesLoading ? (
                    <div className="text-center py-8">
                      <p>Memuat data...</p>
                    </div>
                  ) : valueHistoryTableData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Belum ada history nilai aset</p>
                      <Button onClick={handleAddValue}>
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Nilai Pertama
                      </Button>
                    </div>
                  ) : (
                    <DataTable
                      data={valueHistoryTableData}
                      isLoading={false}
                      searchPlaceholder="Cari history nilai..."
                      searchFields={["date"]}
                      renderItem={renderValueHistoryItem}
                      emptyStateMessage="Belum ada history nilai aset"
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <AssetSummary assetId={asset.id} assetName={asset.name} />
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              {isLoadingHistoryTab ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat riwayat pergerakan dana...</p>
                </div>
              ) : (
                <MovementsDataTable
                  movements={movements || []}
                  transfers={transfers || []}
                  records={records || []}
                  wallets={wallets || []}
                  goals={goals || []}
                  filterType="asset"
                  filterId={asset.id}
                  title={`Riwayat Aset - ${asset.name}`}
                  description="Kelola dan pantau semua pergerakan dana untuk aset ini"
                  emptyMessage={`Belum ada riwayat pergerakan dana untuk aset ${asset.name}`}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Modals */}
          <ConfirmationModal
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
            onConfirm={handleConfirmDelete}
            title="Hapus Aset"
            description="Apakah Anda yakin ingin menghapus aset ini? Tindakan ini tidak dapat dibatalkan."
            confirmText="Ya, Hapus"
            cancelText="Batal"
            variant="destructive"
          />
          <ConfirmationModal
            open={deleteValueModal.open}
            onOpenChange={(open) => setDeleteValueModal({ ...deleteValueModal, open })}
            onConfirm={handleConfirmDeleteValue}
            title="Hapus Nilai Aset"
            description="Apakah Anda yakin ingin menghapus nilai aset ini? Tindakan ini tidak dapat dibatalkan."
            confirmText="Ya, Hapus"
            cancelText="Batal"
            variant="destructive"
          />

          <InvestmentAssetDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            asset={asset}
          />

          <AssetValueDialog
            open={isValueDialogOpen}
            onOpenChange={setIsValueDialogOpen}
            assetValue={selectedAssetValue}
            assetId={asset.id}
          />
          <AssetRecordDialog
            open={isRecordDialogOpen}
            onOpenChange={setIsRecordDialogOpen}
            asset={asset}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AssetDetail;