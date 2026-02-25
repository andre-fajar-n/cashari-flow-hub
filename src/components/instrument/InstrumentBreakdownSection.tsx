import { useState } from "react";
import { ListTree } from "lucide-react";
import {
  buildGoalFirstBreakdown,
  buildWalletFirstBreakdown,
} from "@/hooks/queries/use-instrument-detail-summary";
import { InvestmentSummaryModel } from "@/models/investment-summary";
import {
  BreakdownSectionLayout,
  GoalHierarchyItem,
  WalletHierarchyItem,
} from "@/components/investment/breakdown/BreakdownUI";

interface InstrumentBreakdownSectionProps {
  items: InvestmentSummaryModel[];
  baseCurrencyCode: string;
}

export const InstrumentBreakdownSection = ({
  items,
  baseCurrencyCode,
}: InstrumentBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"goal-first" | "wallet-first">("goal-first");

  if (items.length === 0) return null;

  const goalFirstData = buildGoalFirstBreakdown(items);
  const walletFirstData = buildWalletFirstBreakdown(items);

  const toggleMode = () => {
    setMode((prev) => (prev === "goal-first" ? "wallet-first" : "goal-first"));
  };

  const isGoalFirst = mode === "goal-first";
  const displayItems = isGoalFirst ? goalFirstData : walletFirstData;
  const childCount = displayItems.length;
  const childLabel = isGoalFirst ? "Goal" : "Dompet";
  const hierarchyDescription = isGoalFirst ? "Goal → Dompet → Aset" : "Dompet → Goal → Aset";

  return (
    <BreakdownSectionLayout
      title="Rincian Alokasi Instrumen"
      icon={ListTree}
      childCount={childCount}
      childLabel={childLabel}
      hierarchyDescription={hierarchyDescription}
      onModeToggle={toggleMode}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {isGoalFirst
        ? goalFirstData
          ?.sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency || b.totalProfitBaseCurrency - a.totalProfitBaseCurrency)
          .map((goal) => (
            <GoalHierarchyItem key={goal.goalId} goal={goal} baseCurrency={baseCurrencyCode} mode="nested" />
          ))
        : walletFirstData
          ?.sort((a, b) => b.currentValueBaseCurrency - a.currentValueBaseCurrency || b.totalProfitBaseCurrency - a.totalProfitBaseCurrency)
          .map((wallet) => (
            <WalletHierarchyItem key={wallet.walletId} wallet={wallet} baseCurrency={baseCurrencyCode} mode="nested" />
          ))}
    </BreakdownSectionLayout>
  );
};

export default InstrumentBreakdownSection;
