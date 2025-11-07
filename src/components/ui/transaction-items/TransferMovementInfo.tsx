import { Wallet, Target, Building2, TrendingUp } from "lucide-react";
import { MoneyMovementModel } from "@/models/money-movements";
import { 
  generateTransactionKey, 
  hasTransferBetweenDifferentEntities, 
  hasSingleEntity, 
  getTransferDirection, 
  getDirectionalLabel 
} from "@/components/ui/transaction-items/utils";
import InfoItem from "@/components/ui/transaction-items/InfoItem";
import TransferDirectionItem from "@/components/ui/transaction-items/TransferDirectionItem";

interface TransferMovementInfoProps {
  movement: MoneyMovementModel;
}

const TransferMovementInfo = ({ movement }: TransferMovementInfoProps) => {
  const items = [];
  const direction = getTransferDirection(movement.amount);

  // Wallet information
  if (hasTransferBetweenDifferentEntities(movement.wallet_id, movement.opposite_wallet_id)) {
    items.push(
      <TransferDirectionItem
        key={generateTransactionKey("wallet", movement.id, movement.resource_id, movement.resource_type, movement.wallet_id, movement.opposite_wallet_id)}
        icon={<Wallet className="w-4 h-4" />}
        label="Dompet"
        from={movement.wallet_name}
        to={movement.opposite_wallet_name}
        direction={direction}
        variant="purple"
      />
    );
  } else {
    items.push(
      <InfoItem
        key={generateTransactionKey("wallet", movement.id, movement.resource_id, movement.resource_type, movement.wallet_id)}
        icon={<Wallet className="w-4 h-4" />}
        label="Dompet"
        value={movement.wallet_name}
        variant="purple"
      />
    );
  }

  // Goal information
  if (hasTransferBetweenDifferentEntities(movement.goal_id, movement.opposite_goal_id)) {
    items.push(
      <TransferDirectionItem
        key={generateTransactionKey("goal", movement.id, movement.resource_id, movement.resource_type, movement.goal_id, movement.opposite_goal_id)}
        icon={<Target className="w-4 h-4" />}
        label="Goal"
        from={movement.goal_name}
        to={movement.opposite_goal_name}
        direction={direction}
        variant="green"
      />
    );
  } else if (hasSingleEntity(movement.goal_id, movement.opposite_goal_id)) {
    items.push(
      <InfoItem
        key={generateTransactionKey("goal", movement.id, movement.resource_id, movement.resource_type, movement.goal_id)}
        icon={<Target className="w-4 h-4" />}
        label={getDirectionalLabel(movement.amount, "Goal")}
        value={movement.goal_name}
        variant="green"
      />
    );
  }

  // Instrument information
  if (hasTransferBetweenDifferentEntities(movement.instrument_id, movement.opposite_instrument_id)) {
    items.push(
      <TransferDirectionItem
        key={generateTransactionKey("instrument", movement.id, movement.resource_id, movement.resource_type, movement.instrument_id, movement.opposite_instrument_id)}
        icon={<Building2 className="w-4 h-4" />}
        label="Instrumen"
        from={movement.instrument_name}
        to={movement.opposite_instrument_name}
        direction={direction}
        variant="blue"
      />
    );
  } else if (hasSingleEntity(movement.instrument_id, movement.opposite_instrument_id)) {
    items.push(
      <InfoItem
        key={generateTransactionKey("instrument", movement.id, movement.resource_id, movement.resource_type, movement.instrument_id)}
        icon={<Building2 className="w-4 h-4" />}
        label={getDirectionalLabel(movement.amount, "Instrumen")}
        value={movement.instrument_name}
        variant="blue"
      />
    );
  }

  // Asset information
  if (hasTransferBetweenDifferentEntities(movement.asset_id, movement.opposite_asset_id)) {
    items.push(
      <TransferDirectionItem
        key={generateTransactionKey("asset", movement.id, movement.resource_id, movement.resource_type, movement.asset_id, movement.opposite_asset_id)}
        icon={<TrendingUp className="w-4 h-4" />}
        label="Aset"
        from={movement.asset_name}
        to={movement.opposite_asset_name}
        direction={direction}
        variant="orange"
      />
    );
  } else if (hasSingleEntity(movement.asset_id, movement.opposite_asset_id)) {
    items.push(
      <InfoItem
        key={generateTransactionKey("asset", movement.id, movement.resource_id, movement.resource_type, movement.asset_id)}
        icon={<TrendingUp className="w-4 h-4" />}
        label={getDirectionalLabel(movement.amount, "Aset")}
        value={movement.asset_name}
        variant="orange"
      />
    );
  }

  return <div className="space-y-2">{items}</div>;
};

export default TransferMovementInfo;
