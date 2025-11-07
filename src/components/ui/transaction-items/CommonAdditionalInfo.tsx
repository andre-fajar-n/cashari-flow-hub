import { MOVEMENT_TYPES } from "@/constants/enums";
import { CommonAdditionalInfoProps } from "@/components/ui/transaction-items/types";
import TransactionAdditionalInfo from "@/components/ui/transaction-items/TransactionAdditionalInfo";
import TransferMovementInfo from "@/components/ui/transaction-items/TransferMovementInfo";
import InvestmentMovementInfo from "@/components/ui/transaction-items/InvestmentMovementInfo";
import DebtMovementInfo from "@/components/ui/transaction-items/DebtMovementInfo";

const CommonAdditionalInfo = ({ movement }: CommonAdditionalInfoProps) => {
  const renderContent = () => {
    switch (movement.resource_type) {
      case MOVEMENT_TYPES.TRANSACTION:
        return <TransactionAdditionalInfo movement={movement} />;

      case MOVEMENT_TYPES.TRANSFER:
      case MOVEMENT_TYPES.GOAL_TRANSFER:
        return <TransferMovementInfo movement={movement} />;

      case MOVEMENT_TYPES.INVESTMENT_GROWTH:
        return <InvestmentMovementInfo movement={movement} />;

      case MOVEMENT_TYPES.DEBT_HISTORY:
        return <DebtMovementInfo movement={movement} />;

      default:
        return null;
    }
  };

  const content = renderContent();
  
  if (!content) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      {content}
    </div>
  );
};

export default CommonAdditionalInfo;
