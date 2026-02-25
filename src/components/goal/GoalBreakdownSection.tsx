import { useState } from "react";
import { ListTree } from "lucide-react";
import {
  buildBreakdownData,
} from "@/hooks/queries/use-goal-detail-summary";
import {
  BreakdownSectionLayout,
  WalletHierarchyItem,
} from "@/components/investment/breakdown/BreakdownUI";
import { InvestmentSummaryExtended } from "@/models/investment";

interface GoalBreakdownSectionProps {
  items: InvestmentSummaryExtended[];
  baseCurrencyCode: string;
}

const GoalBreakdownSection = ({ items, baseCurrencyCode }: GoalBreakdownSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const breakdownData = buildBreakdownData(items);

  if (breakdownData.length === 0) {
    return null;
  }

  return (
    <BreakdownSectionLayout
      title="Rincian Goal"
      icon={ListTree}
      childCount={breakdownData.length}
      childLabel="wallet"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      {breakdownData.map((wallet) => (
        <WalletHierarchyItem
          key={wallet.walletId}
          wallet={wallet}
          baseCurrency={baseCurrencyCode}
        />
      ))}
    </BreakdownSectionLayout>
  );
};

export default GoalBreakdownSection;
