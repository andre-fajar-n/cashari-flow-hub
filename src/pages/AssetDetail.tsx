import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import AssetValueDialog from "@/components/investment/AssetValueDialog";
import { useInvestmentAssets, useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetValues } from "@/hooks/queries/use-investment-asset-values";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatAmountCurrency } from "@/lib/currency";
import AssetSummary from "@/components/investment/AssetSummary";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import { useWallets } from "@/hooks/queries/use-wallets";
import { MoneyMovementModel } from "@/models/money-movements";
import { formatDate } from "@/lib/date";
import AssetValueHistoryList from "@/components/investment/AssetValueHistoryList";
import AssetMovementList from "@/components/investment/AssetMovementList";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);

  const { mutate: deleteAsset } = useDeleteInvestmentAsset();
  const { data: assets } = useInvestmentAssets();
  const { data: assetValues } = useInvestmentAssetValues(parseInt(id!));
  const { data: movements } = useMoneyMovements({ assetId: parseInt(id!) });
  const { data: wallets } = useWallets();

  const asset = assets?.find(a => a.id === parseInt(id!));

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
  const assetCurrencyCode = movements?.find((r: MoneyMovementModel) => (r.asset_id ?? r.asset?.id) === (asset?.id))?.currency_code
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
    setIsValueDialogOpen(true);
  };

  const handleAddRecord = () => {
    setIsRecordDialogOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements"] });
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
    queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
    queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
    queryClient.invalidateQueries({ queryKey: ["investment_asset_values_paginated"] });
  };

  // Prepare chart data
  const chartData = assetValues?.map(value => ({
    date: formatDate(value.date),
    value: value.value,
    fullDate: value.date
  })).reverse() || [];

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
                Ubah
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
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Ringkasan</TabsTrigger>
              <TabsTrigger value="history">Riwayat Nilai</TabsTrigger>
              <TabsTrigger value="movements">Riwayat Pergerakan Dana</TabsTrigger>
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
                          <XAxis dataKey="date" padding={{ left: 30, right: 30 }} />
                          <YAxis
                            domain={['dataMin - dataMin * 0.05', 'dataMax + dataMax * 0.05']}
                            tickFormatter={(value) => formatAmountCurrency(value, assetCurrencyCode)}
                            width={100}
                          />
                          <Tooltip
                            formatter={(value) => [formatAmountCurrency(Number(value), assetCurrencyCode), 'Nilai']}
                            labelFormatter={(label) => {
                              const item = chartData.find(d => d.date === label);
                              return item ? formatDate(item.fullDate) : label;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Value History Table */}
              <AssetValueHistoryList assetId={asset.id} currencyCode={assetCurrencyCode} />
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <AssetSummary assetId={asset.id} assetName={asset.name} />
            </TabsContent>

            <TabsContent value="movements" className="space-y-4">
              <AssetMovementList assetId={asset.id} />
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

          <InvestmentAssetDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            asset={asset}
          />

          <AssetValueDialog
            open={isValueDialogOpen}
            onOpenChange={setIsValueDialogOpen}
            assetId={asset.id}
            onSuccess={handleSuccess}
          />

          <GoalInvestmentRecordDialog
            open={isRecordDialogOpen}
            onOpenChange={setIsRecordDialogOpen}
            assetId={asset.id}
            instrumentId={asset.instrument_id}
            onSuccess={handleSuccess}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AssetDetail;