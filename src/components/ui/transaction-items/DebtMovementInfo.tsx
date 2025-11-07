import { CreditCard } from "lucide-react";
import { MoneyMovementModel } from "@/models/money-movements";
import { generateTransactionKey } from "@/components/ui/transaction-items/utils";
import InfoItem from "@/components/ui/transaction-items/InfoItem";

interface DebtMovementInfoProps {
  movement: MoneyMovementModel;
}

const DebtMovementInfo = ({ movement }: DebtMovementInfoProps) => {
  return (
    <div className="space-y-2">
      <InfoItem
        key={generateTransactionKey("debt", movement.id, movement.resource_id, movement.resource_type)}
        icon={<CreditCard className="w-4 h-4" />}
        label="Hutang/Piutang"
        value={movement.debt_name}
        variant="red"
      />
    </div>
  );
};

export default DebtMovementInfo;
