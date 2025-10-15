import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Coins, Edit, Trash2, TrendingUp, DollarSign, Hash, ArrowUp, ArrowDown } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import InvestmentAssetDialog from "@/components/investment/InvestmentAssetDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import { Card } from "@/components/ui/card";
import { useInvestmentInstruments } from "@/hooks/queries/use-investment-instruments";
import { useDeleteInvestmentAsset } from "@/hooks/queries/use-investment-assets";
import { useInvestmentAssetsPaginated } from "@/hooks/queries/paginated/use-investment-assets-paginated";
import { useAssetSummaries } from "@/hooks/queries/use-asset-summaries";
import { formatAmountCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";


const InvestmentAsset = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investmentAssetToDelete, setInvestmentAssetToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InvestmentAssetModel | undefined>(undefined);
  
  const { mutate: deleteInvestmentAsset } = useDeleteInvestmentAsset();
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading } = useInvestmentAssetsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const assets = paged?.data || [];
  const { data: instruments } = useInvestmentInstruments();
  const { data: assetSummaries } = useAssetSummaries();

  const handleEdit = (asset: InvestmentAssetModel) => {
    setSelectedAsset(asset);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (investmentAssetId: number) => {
    setInvestmentAssetToDelete(investmentAssetId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (investmentAssetToDelete) {
      deleteInvestmentAsset(investmentAssetToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedAsset(undefined);
    setIsDialogOpen(true);
  };

  const handleViewHistory = (asset: InvestmentAssetModel) => {
    navigate(`/investment-asset/${asset.id}`);
  };

  const renderAssetItem = (asset: InvestmentAssetModel) => {
    // Find summary data for this asset
    const assetSummary = assetSummaries?.find(summary => summary.assetId === asset.id);

    return (
      <Card key={asset.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <Coins className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 truncate">{asset.name}</h3>
                {asset.symbol && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    {asset.symbol}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-2 mb-3">
                <p className="text-sm font-medium text-gray-700">
                  Instrumen: {asset.investment_instruments?.name}
                </p>
              </div>

              {/* Summary Information - Compact Design */}
              {assetSummary && (
                <div className="border rounded-lg p-3 mb-3 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    {/* Left Column */}
                    <div className="space-y-2">
                      {/* Latest Asset Value */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">Nilai Aset</span>
                        </div>
                        {assetSummary.latestAssetValue ? (
                          <div>
                            <div className="font-bold text-gray-900">
                              {formatAmountCurrency(assetSummary.latestAssetValue, assetSummary.currencyCode)}
                            </div>
                            {assetSummary.latestAssetValueDate && (
                              <div className="text-gray-500 text-xs">
                                {formatDate(assetSummary.latestAssetValueDate)}
                              </div>
                            )}
                            {assetSummary.assetValueChange !== null && (
                              <div className="flex items-center gap-1">
                                {assetSummary.assetValueChange >= 0 ? (
                                  <ArrowUp className="w-3 h-3 text-green-600" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-red-600" />
                                )}
                                <span className={`font-medium ${assetSummary.assetValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {assetSummary.assetValueChangePercentage?.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">Belum ada data</span>
                        )}
                      </div>

                      {/* Amount */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">Amount</span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {formatAmountCurrency(assetSummary.totalAmount, assetSummary.currencyCode)}
                        </div>
                      </div>

                      {/* Amount Unit */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Hash className="w-3 h-3" />
                          <span className="font-medium">Unit</span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {assetSummary.totalAmountUnit.toLocaleString('id-ID')} unit
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-2">
                      {/* Current Asset Amount */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">Amount Saat Ini</span>
                        </div>
                        {assetSummary.currentAssetAmount ? (
                          <div>
                            <div className="font-bold text-gray-900">
                              {formatAmountCurrency(assetSummary.currentAssetAmount, assetSummary.currencyCode)}
                            </div>
                            {assetSummary.amountChange !== null && (
                              <div className="flex items-center gap-1">
                                {assetSummary.amountChange >= 0 ? (
                                  <ArrowUp className="w-3 h-3 text-green-600" />
                                ) : (
                                  <ArrowDown className="w-3 h-3 text-red-600" />
                                )}
                                <span className={`font-medium ${assetSummary.amountChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {assetSummary.amountChangePercentage?.toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>

                      {/* Unrealized Amount */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">Unrealized</span>
                        </div>
                        {assetSummary.unrealizedAmount !== null ? (
                          <div className="flex items-center gap-1">
                            <div className={`font-bold ${assetSummary.unrealizedAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {assetSummary.unrealizedAmount >= 0 ? '+' : ''}{formatAmountCurrency(assetSummary.unrealizedAmount, assetSummary.currencyCode)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>

                      {/* Average Price Per Unit */}
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <TrendingUp className="w-3 h-3" />
                          <span className="font-medium">Rata-rata/Unit</span>
                        </div>
                        {assetSummary.averagePricePerUnit ? (
                          <div className="font-bold text-gray-900">
                            {formatAmountCurrency(assetSummary.averagePricePerUnit, assetSummary.currencyCode)}
                          </div>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions - Mobile responsive */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 pt-4 sm:pt-1 border-t-2 sm:border-t border-gray-100">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
              onClick={() => handleViewHistory(asset)}
            >
              <TrendingUp className="w-3 h-3 sm:mr-1" />
              Detail
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
              onClick={() => handleEdit(asset)}
            >
              <Edit className="w-3 h-3 sm:mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="flex-1 h-9 sm:h-8 text-sm sm:text-xs"
              onClick={() => handleDeleteClick(asset.id)}
            >
              <Trash2 className="w-3 h-3 sm:mr-1" />
              Hapus
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  const columnFilters: ColumnFilter[] = [
    {
      field: "instrument_id",
      label: "Instrumen",
      type: "select",
      options: instruments?.map(instrument => ({
        label: instrument.name,
        value: instrument.id.toString()
      })) || []
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Aset Investasi"
          description="Apakah Anda yakin ingin menghapus aset investasi ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />

        <DataTable
          data={assets}
          isLoading={isLoading}
          searchPlaceholder="Cari aset investasi..."
          searchFields={["name", "symbol"]}
          columnFilters={columnFilters}
          itemsPerPage={itemsPerPage}
          serverMode
          totalCount={paged?.count}
          page={page}
          onServerParamsChange={({ searchTerm, filters, page: nextPage }) => {
            setServerSearch(searchTerm);
            setServerFilters(filters);
            setPage(nextPage);
          }}
          renderItem={renderAssetItem}
          emptyStateMessage="Belum ada aset investasi yang dibuat"
          title="Aset Investasi"
          description="Kelola aset investasi dalam instrumen Anda"
          headerActions={
            assets && assets.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Aset
              </Button>
            )
          }
        />

        {(!assets || assets.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Aset Pertama
            </Button>
          </div>
        )}

        <InvestmentAssetDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          asset={selectedAsset}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["investment_assets"] });
            queryClient.invalidateQueries({ queryKey: ["asset_summaries"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default InvestmentAsset;
