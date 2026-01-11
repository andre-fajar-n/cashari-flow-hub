import { UseFormReturn } from "react-hook-form";
import { TransactionHistoryTable } from "@/components/transactions/TransactionHistoryTable";
import { getTransactionHistoryColumns } from "@/components/transactions/TransactionHistoryColumns";
import { SelectFilterConfig, DateRangeFilterConfig } from "@/components/ui/advanced-data-table/advanced-data-table-toolbar";
import GoalTransferDialog from "@/components/goal/GoalTransferDialog";
import GoalInvestmentRecordDialog from "@/components/goal/GoalInvestmentRecordDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { MoneyMovementModel } from "@/models/money-movements";
import { GoalTransferModel } from "@/models/goal-transfers";
import { GoalInvestmentRecordModel } from "@/models/goal-investment-records";
import { WalletModel } from "@/models/wallets";
import { GoalModel } from "@/models/goals";
import { InvestmentInstrumentModel } from "@/models/investment-instruments";
import { InvestmentAssetModel } from "@/models/investment-assets";
import { CategoryModel } from "@/models/categories";
import { GoalTransferFormData } from "@/form-dto/goal-transfers";
import { GoalInvestmentRecordFormData } from "@/form-dto/goal-investment-records";
import { GoalTransferConfig } from "@/components/goal/GoalTransferModes";
import { MOVEMENT_TYPES } from "@/constants/enums";

export interface GoalMovementListProps {
  // Data
  movements: MoneyMovementModel[];
  totalCount: number;
  isLoading: boolean;
  
  // Table state (controlled from parent)
  searchTerm: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, any>;
  onFiltersChange: (filters: Record<string, any>) => void;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  
  // Filter options
  wallets: WalletModel[];
  instruments: InvestmentInstrumentModel[];
  assets: InvestmentAssetModel[];
  categories: CategoryModel[];
  
  // Edit/Delete handlers (from parent)
  onEdit: (movement: MoneyMovementModel) => void;
  onDelete: (movement: MoneyMovementModel) => void;
  
  // Transfer Dialog
  transferDialogOpen: boolean;
  onTransferDialogChange: (open: boolean) => void;
  transferForm: UseFormReturn<GoalTransferFormData>;
  isTransferFormLoading: boolean;
  onTransferFormSubmit: (data: GoalTransferFormData) => void;
  editTransfer?: GoalTransferModel;
  transferConfig?: GoalTransferConfig;
  goals: GoalModel[];
  
  // Record Dialog
  recordDialogOpen: boolean;
  onRecordDialogChange: (open: boolean) => void;
  recordForm: UseFormReturn<GoalInvestmentRecordFormData>;
  isRecordFormLoading: boolean;
  onRecordFormSubmit: (data: GoalInvestmentRecordFormData) => void;
  editRecord?: GoalInvestmentRecordModel;
  
  // Delete Modal
  deleteModalOpen: boolean;
  onDeleteModalChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  deleteItemType?: 'transfer' | 'record';
}

const GoalMovementList = ({
  // Data
  movements,
  totalCount,
  isLoading,
  
  // Table state
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  
  // Filter options
  wallets,
  instruments,
  assets,
  categories,
  
  // Handlers
  onEdit,
  onDelete,
  
  // Transfer Dialog
  transferDialogOpen,
  onTransferDialogChange,
  transferForm,
  isTransferFormLoading,
  onTransferFormSubmit,
  editTransfer,
  transferConfig,
  goals,
  
  // Record Dialog
  recordDialogOpen,
  onRecordDialogChange,
  recordForm,
  isRecordFormLoading,
  onRecordFormSubmit,
  editRecord,
  
  // Delete Modal
  deleteModalOpen,
  onDeleteModalChange,
  onConfirmDelete,
  deleteItemType,
}: GoalMovementListProps) => {
  // Generate columns with edit/delete actions
  const columns = getTransactionHistoryColumns({
    onEdit,
    onDelete,
  });
  
  // Select filters configuration
  const selectFilters: SelectFilterConfig[] = [
    {
      key: "resource_type",
      label: "Tipe",
      placeholder: "Semua Tipe",
      options: [
        { label: "Transfer Dana", value: MOVEMENT_TYPES.GOAL_TRANSFER },
        { label: "Progres Investasi", value: MOVEMENT_TYPES.INVESTMENT_GROWTH },
      ],
    },
    {
      key: "category_id",
      label: "Kategori",
      placeholder: "Semua Kategori",
      options: categories?.map(category => ({
        label: category.name,
        value: category.id.toString()
      })) || []
    },
    {
      key: "wallet_id",
      label: "Dompet",
      placeholder: "Semua Dompet",
      options: wallets?.map(wallet => ({
        label: `${wallet.name} (${wallet.currency_code})`,
        value: wallet.id.toString()
      })) || []
    },
    {
      key: "instrument_id",
      label: "Instrumen",
      placeholder: "Semua Instrumen",
      options: instruments?.map(instrument => ({
        label: instrument.name,
        value: instrument.id.toString()
      })) || []
    },
    {
      key: "asset_id",
      label: "Aset",
      placeholder: "Semua Aset",
      options: assets?.map(asset => ({
        label: asset.name,
        value: asset.id.toString()
      })) || []
    }
  ];
  
  // Date range filter configuration
  const dateRangeFilter: DateRangeFilterConfig = {
    key: "date",
    label: "Tanggal",
    placeholder: "Pilih rentang tanggal",
  };
  
  return (
    <>
      <TransactionHistoryTable
        columns={columns}
        data={movements}
        totalCount={totalCount}
        isLoading={isLoading}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
        selectFilters={selectFilters}
        dateRangeFilter={dateRangeFilter}
        page={page}
        pageSize={pageSize}
        setPage={onPageChange}
        setPageSize={onPageSizeChange}
      />
      
      {/* Transfer Dialog */}
      <GoalTransferDialog
        open={transferDialogOpen}
        onOpenChange={onTransferDialogChange}
        form={transferForm}
        isLoading={isTransferFormLoading}
        onSubmit={onTransferFormSubmit}
        transfer={editTransfer}
        transferConfig={transferConfig}
        wallets={wallets}
        goals={goals}
        instruments={instruments}
        assets={assets}
      />
      
      {/* Investment Record Dialog */}
      <GoalInvestmentRecordDialog
        open={recordDialogOpen}
        onOpenChange={onRecordDialogChange}
        form={recordForm}
        isLoading={isRecordFormLoading}
        onSubmit={onRecordFormSubmit}
        record={editRecord}
        goals={goals}
        instruments={instruments}
        assets={assets}
        wallets={wallets}
        categories={categories}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={deleteModalOpen}
        onOpenChange={onDeleteModalChange}
        onConfirm={onConfirmDelete}
        title="Hapus Item"
        description={`Apakah Anda yakin ingin menghapus ${deleteItemType === 'transfer' ? 'transfer' : 'record'} ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="destructive"
      />
    </>
  );
};

export default GoalMovementList;
