
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";

interface Movement {
  movement_type: string;
  movement_id: number;
  amount: number;
  currency_code: string;
  date: string;
  direction: string;
  source_description: string;
  destination_description: string;
}

interface GoalMovementsHistoryProps {
  movements: Movement[];
  goalName: string;
}

const GoalMovementsHistory = ({ movements, goalName }: GoalMovementsHistoryProps) => {
  const formatAmount = (amount: number, currencyCode: string) => {
    return `${currencyCode === 'IDR' ? 'Rp' : currencyCode} ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Riwayat Pergerakan Dana
        </CardTitle>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada riwayat pergerakan dana</p>
          </div>
        ) : (
          <div className="space-y-4">
            {movements.map((movement) => (
              <div
                key={`${movement.movement_type}-${movement.movement_id}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {movement.direction === 'IN' ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {movement.direction === 'IN' ? 'Dana Masuk' : 'Dana Keluar'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {movement.movement_type === 'goal_transfer' ? 'Transfer' : 'Record'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {movement.direction === 'IN' 
                        ? `Dari ${movement.source_description}`
                        : `Ke ${movement.destination_description}`
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(movement.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    movement.direction === 'IN' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.direction === 'IN' ? '+' : '-'}
                    {formatAmount(movement.amount, movement.currency_code)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalMovementsHistory;
