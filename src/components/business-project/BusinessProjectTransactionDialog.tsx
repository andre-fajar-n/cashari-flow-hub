import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowUpCircle, ArrowDownCircle, ListChecks } from "lucide-react";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BusinessProjectModel } from "@/models/business-projects";
import { TransactionModel } from "@/models/transactions";
import { formatDate } from "@/lib/date";

interface BusinessProjectTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: BusinessProjectModel | null;
  isLoading: boolean;
  // Selection state from parent
  selectedTransactionIds: number[];
  onTransactionToggle: (transactionId: number) => void;
  onSelectAll: () => void;
  // Search state from parent
  searchQuery: string;
  onSearchChange: (query: string) => void;
  // Transactions data from parent
  filteredTransactions: TransactionModel[];
  availableTransactionsCount: number;
  // Submit handler
  onSubmit: () => void;
}

const BusinessProjectTransactionDialog = ({
  open,
  onOpenChange,
  project,
  isLoading,
  selectedTransactionIds,
  onTransactionToggle,
  onSelectAll,
  searchQuery,
  onSearchChange,
  filteredTransactions,
  availableTransactionsCount,
  onSubmit,
}: BusinessProjectTransactionDialogProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
              <ListChecks className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Tambah Transaksi ke Proyek</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{project.name}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Select All */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedTransactionIds.length === filteredTransactions.length
                  }
                  onCheckedChange={onSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  Pilih Semua ({filteredTransactions.length} transaksi)
                </label>
              </div>
              <Badge variant="secondary">
                {selectedTransactionIds.length} dipilih
              </Badge>
            </div>
          </div>

          {/* Transaction List with ScrollArea */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-[400px] border rounded-lg">
              {filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {availableTransactionsCount === 0
                    ? "Semua transaksi sudah ada di proyek ini"
                    : "Tidak ada transaksi yang sesuai dengan pencarian"
                  }
                </div>
              ) : (
                <div className="space-y-0 pb-12">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={`flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${selectedTransactionIds.includes(transaction.id) ? "bg-accent/30" : ""}`}
                    >
                      <Checkbox
                        checked={selectedTransactionIds.includes(transaction.id)}
                        onCheckedChange={() => onTransactionToggle(transaction.id)}
                      />

                      <div className="flex-shrink-0">
                        {transaction.categories?.is_income ? (
                          <ArrowUpCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {transaction.categories?.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{transaction.wallets?.name}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.date)}</span>
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {transaction.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right flex-shrink-0">
                        <AmountText
                          amount={transaction.categories?.is_income ? transaction.amount : -transaction.amount}
                          className="font-semibold text-sm"
                          showSign={true}
                        >
                          {formatAmountCurrency(transaction.amount, transaction.wallets?.currency_code, transaction.wallets?.currencies?.symbol)}
                        </AmountText>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {transaction.wallets?.currency_code}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t mt-2 px-6 pb-6 bg-background relative z-10 flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={selectedTransactionIds.length === 0 || isLoading}
          >
            {isLoading
              ? "Menambahkan..."
              : `Tambah ${selectedTransactionIds.length} Transaksi`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BusinessProjectTransactionDialog;
