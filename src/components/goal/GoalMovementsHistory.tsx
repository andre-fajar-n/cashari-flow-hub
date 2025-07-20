import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Calendar } from "lucide-react";
import { formatAmount } from "@/lib/utils";
import { Database } from "@/integrations/supabase/types";

interface GoalMovementsHistoryProps {
  movements: Database["public"]["Views"]["money_movements"]["Row"][];
}

const GoalMovementsHistory = ({ movements }: GoalMovementsHistoryProps) => {
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
            {movements.map((movement, index) => (
              <div
                key={`${movement.resource_type}-${movement.resource_id}-${index}`}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {movement.amount && movement.amount > 0 ? (
                      <ArrowDownLeft className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {movement.amount && movement.amount > 0 ? 'Dana Masuk' : 'Dana Keluar'}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {movement.resource_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {movement.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(movement.date || '')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    movement.amount && movement.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {movement.amount && movement.amount > 0 ? '+' : '-'}
                    {formatAmount(Math.abs(movement.amount || 0), movement.currency_code || 'IDR')}
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
