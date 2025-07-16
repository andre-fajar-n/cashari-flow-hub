
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDebtHistories } from "@/hooks/queries/use-debt-histories";
import { Loader2 } from "lucide-react";

interface DebtHistoryListProps {
  debtId: number;
}

const DebtHistoryList = ({ debtId }: DebtHistoryListProps) => {
  const { data: histories, isLoading } = useDebtHistories(debtId);

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!histories || histories.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Belum ada history untuk hutang/piutang ini
        </CardContent>
      </Card>
    );
  }

  const totalAmount = histories.reduce((sum, history) => sum + Number(history.amount), 0);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Total: {totalAmount.toLocaleString()} {histories[0]?.currency_code}</CardTitle>
        </CardHeader>
      </Card>

      {histories.map((history) => (
        <Card key={history.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">
                    {Number(history.amount).toLocaleString()} {history.currency_code}
                  </span>
                  <Badge variant="outline">
                    {new Date(history.date).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>Dompet: {history.wallets?.name}</div>
                  <div>Kategori: {history.categories?.name}</div>
                  {history.description && (
                    <div>Deskripsi: {history.description}</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DebtHistoryList;
