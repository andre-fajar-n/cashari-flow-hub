import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import GoalDialog from "@/components/goal/GoalDialog";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GoalModel } from "@/models/goals";
import { DataTable, ColumnFilter } from "@/components/ui/data-table";
import GoalCard from "@/components/goal/GoalCard";
import { useDeleteGoal } from "@/hooks/queries/use-goals";
import { useGoalsPaginated } from "@/hooks/queries/paginated/use-goals-paginated";
import { useCurrencies } from "@/hooks/queries/use-currencies";
import { useMoneySummary } from "@/hooks/queries/use-money-summary";

const Goal = () => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<GoalModel | undefined>(undefined);

  const { mutate: deleteGoal } = useDeleteGoal();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [serverSearch, setServerSearch] = useState("");
  const [serverFilters, setServerFilters] = useState<Record<string, any>>({});
  const { data: paged, isLoading: isGoalsLoading } = useGoalsPaginated({ page, itemsPerPage, searchTerm: serverSearch, filters: serverFilters });
  const goals = paged?.data || [];
  const { data: currencies, isLoading: isCurrencyLoading } = useCurrencies();
  const { data: goalFundsSummary, isLoading: isFundsSummaryLoading } = useMoneySummary({ investmentOnly: true });

  const isLoading = isGoalsLoading || isCurrencyLoading || isFundsSummaryLoading;

  const groupedByGoalId = (goalFundsSummary ?? []).reduce((acc, item) => {
    if (!acc[item.goal_id]) {
      acc[item.goal_id] = {
        goal_id: item.goal_id,
        amount: 0,
      };
    }
    acc[item.goal_id].amount += item.amount || 0;
    return acc;
  }, {} as Record<number, { goal_id: number; amount: number }>);

  const handleEdit = (goal: GoalModel) => {
    setSelectedGoal(goal);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (goalId: number) => {
    setGoalToDelete(goalId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete);
    }
  };

  const handleAddNew = () => {
    setSelectedGoal(undefined);
    setIsDialogOpen(true);
  };

  const renderGoalItem = (goal: GoalModel) => {    
    return (
      <GoalCard
        key={goal.id}
        goal={goal}
        totalAmount={groupedByGoalId[goal.id]?.amount || 0}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />
    );
  };

  const columnFilters: ColumnFilter[] = [
    {
      field: "is_achieved",
      label: "Status Pencapaian",
      type: "select",
      options: [
        { label: "Tercapai", value: "true" },
        { label: "Belum Tercapai", value: "false" }
      ]
    },
    {
      field: "is_active",
      label: "Status Aktif",
      type: "select",
      options: [
        { label: "Aktif", value: "true" },
        { label: "Tidak Aktif", value: "false" }
      ]
    },
    {
      field: "currency_code",
      label: "Mata Uang",
      type: "select",
      options: currencies?.map(currency => ({
        label: `${currency.code} (${currency.symbol})`,
        value: currency.code
      })) || []
    },
    {
      field: "target_amount",
      label: "Target Min",
      type: "number"
    },
    {
      field: "target_date",
      label: "Tanggal Target",
      type: "date"
    }
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <ConfirmationModal
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          title="Hapus Goal"
          description="Apakah Anda yakin ingin menghapus goal ini? Tindakan ini tidak dapat dibatalkan."
          confirmText="Ya, Hapus"
          cancelText="Batal"
          variant="destructive"
        />
        
        <DataTable
          data={goals}
          isLoading={isLoading}
          searchPlaceholder="Cari target..."
          searchFields={["name", "currency_code"]}
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
          useUrlParams={true}
          renderItem={renderGoalItem}
          emptyStateMessage="Belum ada target yang dibuat"
          title="Manajemen Target"
          description="Kelola target keuangan Anda"
          headerActions={
            goals && goals.length > 0 && (
              <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Target
              </Button>
            )
          }
        />

        {(!goals || goals.length === 0) && !isLoading && (
          <div className="text-center py-8">
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Buat Target Pertama
            </Button>
          </div>
        )}

        <GoalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          goal={selectedGoal}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
};

export default Goal;