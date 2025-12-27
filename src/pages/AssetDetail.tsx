import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, BarChart3 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ConfirmationModal from "@/components/ConfirmationModal";
import AssetValueDialog from "@/components/investment/AssetValueDialog";
import { useInvestmentAssets, useDeleteInvestmentAsset, useUpdateInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useInvestmentAssetValues, useCreateInvestmentAssetValue, useUpdateInvestmentAssetValue } from "@/hooks/queries/use-investment-asset-values";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatAmountCurrency } from "@/lib/currency";
import AssetSummary from "@/components/investment/AssetSummary";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import { useMoneyMovements } from "@/hooks/queries/use-money-movements";
import { useWallets } from "@/hooks/queries/use-wallets";
import { useGoals } from "@/hooks/queries/use-goals";
import { useCategories } from "@/hooks/queries/use-categories";
import { useCreateGoalInvestmentRecord, useUpdateGoalInvestmentRecord } from "@/hooks/queries/use-goal-investment-records";
import { MoneyMovementModel } from "@/models/money-movements";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { formatDate } from "@/lib/date";
import AssetValueHistoryList from "@/components/investment/AssetValueHistoryList";
import AssetMovementList from "@/components/investment/AssetMovementList";
import { GoalInvestmentRecordFormData, defaultGoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { AssetFormData, defaultAssetFormValues } from "@/form-dto/investment-assets";
import { AssetValueFormData, defaultAssetValueFormValues } from "@/form-dto/investment-asset-values";
import { useMutationCallbacks, QUERY_KEY_SETS } from "@/lib/hooks/mutation-handlers";
import { useAuth } from "@/hooks/use-auth";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isValueDialogOpen, setIsValueDialogOpen] = useState(false);
  const [recordDialog, setRecordDialog] = useState<{
    open: boolean;
    record?: GoalInvestmentRecordModel;
  }>({ open: false });

  const [isEditFormLoading, setIsEditFormLoading] = useState(false);
  const [isValueFormLoading, setIsValueFormLoading] = useState(false);
  const [isRecordFormLoading, setIsRecordFormLoading] = useState(false);

  const { mutate: deleteAsset } = useDeleteInvestmentAsset();
  const updateAsset = useUpdateInvestmentAsset();
  const createAssetValue = useCreateInvestmentAssetValue();
  const updateAssetValue = useUpdateInvestmentAssetValue();
  const createRecord = useCreateGoalInvestmentRecord();
  const updateRecord = useUpdateGoalInvestmentRecord();

  const { data: assets } = useInvestmentAssets();
  const { data: assetValues } = useInvestmentAssetValues(parseInt(id!));
  const { data: movements } = useMoneyMovements({ assetId: parseInt(id!) });
  const { data: wallets } = useWallets();
  const { data: goals } = useGoals();
  const { data: instruments } = useInvestmentInstruments();
  const { data: categories } = useCategories();

  const asset = assets?.find(a => a.id === parseInt(id!));

  // Forms
  const editForm = useForm<AssetFormData>({
    defaultValues: defaultAssetFormValues,
  });

  const valueForm = useForm<AssetValueFormData>({
    defaultValues: defaultAssetValueFormValues,
  });

  const recordForm = useForm<GoalInvestmentRecordFormData>({
    defaultValues: defaultGoalInvestmentRecordFormData,
  });

  // Mutation callbacks
  const { handleSuccess: handleEditSuccess, handleError: handleEditError } = useMutationCallbacks({
    setIsLoading: setIsEditFormLoading,
    onOpenChange: setIsEditDialogOpen,
    form: editForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSETS
  });

  const { handleSuccess: handleValueSuccess, handleError: handleValueError } = useMutationCallbacks({
    setIsLoading: setIsValueFormLoading,
    onOpenChange: setIsValueDialogOpen,
    form: valueForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_ASSET_VALUES
  });

  const { handleSuccess: handleRecordSuccess, handleError: handleRecordError } = useMutationCallbacks({
    setIsLoading: setIsRecordFormLoading,
    onOpenChange: (open) => setRecordDialog({ open }),
    form: recordForm,
    queryKeysToInvalidate: QUERY_KEY_SETS.INVESTMENT_RECORDS
  });

  // Reset edit form when dialog opens
  useEffect(() => {
    if (isEditDialogOpen && asset) {
      editForm.reset({
        name: asset.name || "",
        symbol: asset.symbol || "",
        instrument_id: asset.instrument_id || null,
      });
    }
  }, [isEditDialogOpen, asset, editForm]);

  // Reset value form when dialog opens
  useEffect(() => {
    if (isValueDialogOpen) {
      valueForm.reset({
        ...defaultAssetValueFormValues,
        asset_id: parseInt(id!) || 0,
      });
    }
  }, [isValueDialogOpen, id, valueForm]);

  // Reset record form when dialog opens
  useEffect(() => {
    if (recordDialog.open) {
      const record = recordDialog.record;
      if (record) {
        recordForm.reset({
          goal_id: record.goal_id,
          instrument_id: asset?.instrument_id || null,
          asset_id: asset?.id || null,
          wallet_id: record.wallet_id,
          category_id: record.category_id,
          amount: record.amount,
          amount_unit: record.amount_unit,
          date: record.date,
          description: record.description || "",
          is_valuation: record.is_valuation || false,
        });
      } else {
        recordForm.reset({
          ...defaultGoalInvestmentRecordFormData,
          instrument_id: asset?.instrument_id || null,
          asset_id: asset?.id || null,
        });
      }
    }
  }, [recordDialog.open, recordDialog.record, recordForm, asset]);

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
  const assetCurrencySymbol = movements?.find((r: MoneyMovementModel) => (r.asset_id ?? r.asset?.id) === (asset?.id))?.currency_symbol
    || 'unknown currency';

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["money_movements"] });
    queryClient.invalidateQueries({ queryKey: ["money_movements_paginated"] });
    queryClient.invalidateQueries({ queryKey: ["goal_transfers"] });
    queryClient.invalidateQueries({ queryKey: ["goal_investment_records"] });
    queryClient.invalidateQueries({ queryKey: ["investment_asset_values"] });
    queryClient.invalidateQueries({ queryKey: ["investment_asset_values_paginated"] });
  };

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
    setRecordDialog({ open: true });
  };

  const handleEditFormSubmit = (data: AssetFormData) => {
    if (!user || !asset) return;
    setIsEditFormLoading(true);

    updateAsset.mutate({ id: asset.id, ...data }, {
      onSuccess: handleEditSuccess,
      onError: handleEditError
    });
  };

  const handleValueFormSubmit = (data: AssetValueFormData) => {
    if (!user) return;
    setIsValueFormLoading(true);

    createAssetValue.mutate(data, {
      onSuccess: () => {
        handleValueSuccess();
        handleSuccess();
      },
      onError: handleValueError
    });
  };

  const handleRecordFormSubmit = (data: GoalInvestmentRecordFormData) => {
    if (!user) return;
    setIsRecordFormLoading(true);

    const submitData = {
      ...data,
      instrument_id: asset?.instrument_id || data.instrument_id,
      asset_id: asset?.id || data.asset_id,
      user_id: user.id,
    };

    if (recordDialog.record) {
      updateRecord.mutate({ id: recordDialog.record.id, ...submitData }, {
        onSuccess: () => {
          handleRecordSuccess();
          handleSuccess();
        },
        onError: handleRecordError
      });
    } else {
      createRecord.mutate(submitData, {
        onSuccess: () => {
          handleRecordSuccess();
          handleSuccess();
        },
        onError: handleRecordError
      });
    }
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
                    <span className="text-lg bg-primary/10 text-primary px-3 py-1 rounded">
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
                            tickFormatter={(value) => formatAmountCurrency(value, assetCurrencyCode, assetCurrencySymbol)}
                            width={100}
                          />
                          <Tooltip
                            formatter={(value) => [formatAmountCurrency(Number(value), assetCurrencyCode, assetCurrencySymbol), 'Nilai']}
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
              <AssetValueHistoryList assetId={asset.id} currencyCode={assetCurrencyCode} currencySymbol={assetCurrencySymbol} />
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
            form={editForm}
            isLoading={isEditFormLoading}
            onSubmit={handleEditFormSubmit}
            asset={asset}
            instruments={instruments}
          />

          <AssetValueDialog
            open={isValueDialogOpen}
            onOpenChange={setIsValueDialogOpen}
            form={valueForm}
            isLoading={isValueFormLoading}
            onSubmit={handleValueFormSubmit}
          />

          <GoalInvestmentRecordDialog
            open={recordDialog.open}
            onOpenChange={(open) => setRecordDialog({ open })}
            form={recordForm}
            isLoading={isRecordFormLoading}
            onSubmit={handleRecordFormSubmit}
            record={recordDialog.record}
            assetId={asset.id}
            instrumentId={asset.instrument_id}
            goals={goals}
            instruments={instruments}
            assets={assets}
            wallets={wallets}
            categories={categories}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AssetDetail;
