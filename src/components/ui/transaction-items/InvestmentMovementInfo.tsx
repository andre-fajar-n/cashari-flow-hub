import { Target, Building2, TrendingUp } from "lucide-react";
import { MoneyMovementModel } from "@/models/money-movements";
import { generateTransactionKey } from "@/components/ui/transaction-items/utils";
import InfoItem from "@/components/ui/transaction-items/InfoItem";

interface InvestmentMovementInfoProps {
  movement: MoneyMovementModel;
}

const InvestmentMovementInfo = ({ movement }: InvestmentMovementInfoProps) => {
  const items = [];

  // Goal information
  if (movement.goal_name) {
    items.push(
      <InfoItem
        key={generateTransactionKey("goal", movement.id, movement.resource_id, movement.resource_type, movement.goal_id)}
        icon={<Target className="w-4 h-4" />}
        label="Goal"
        value={movement.goal_name}
        variant="green"
      />
    );
  }

  // Instrument information
  if (movement.instrument_name) {
    items.push(
      <InfoItem
        key={generateTransactionKey("instrument", movement.id, movement.resource_id, movement.resource_type, movement.instrument_id)}
        icon={<Building2 className="w-4 h-4" />}
        label="Instrumen"
        value={movement.instrument_name}
        variant="blue"
      />
    );
  }

  // Asset information
  if (movement.asset_name) {
    items.push(
      <InfoItem
        key={generateTransactionKey("asset", movement.id, movement.resource_id, movement.resource_type, movement.asset_id)}
        icon={<TrendingUp className="w-4 h-4" />}
        label="Aset"
        value={movement.asset_name}
        variant="orange"
      />
    );
  }

  return <div className="space-y-2">{items}</div>;
};

export default InvestmentMovementInfo;
