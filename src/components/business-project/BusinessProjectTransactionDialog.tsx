import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBusinessProjectTransactions } from "@/hooks/queries/use-business-project-transactions";
import { formatAmountCurrency } from "@/lib/currency";
import { AmountText } from "@/components/ui/amount-text";
import { BusinessProjectModel } from "@/models/business-projects";
import { TransactionFilter } from "@/form-dto/transactions";

interface BusinessProjectTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: BusinessProjectModel | null;
  onSuccess?: () => void;
}

const BusinessProjectTransactionDialog = ({ 
  open, 
  onOpenChange, 
  project, 
  onSuccess 
}: BusinessProjectTransactionDialogProps) => {
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const filter: TransactionFilter = {
    startDate: project?.start_date,
    endDate: project?.end_date
  };

  const { data: allTransactions } = useTransactions(filter);
  const { 
    data: projectTransactions, 
    addTransactionsToProject 
  } = useBusinessProjectTransactions(project?.id);

  // Get transactions that are not already in this project
  const availableTransactions = allTransactions?.filter(transaction => {
    const isAlreadyInProject = projectTransactions?.some(
      projectTrx => projectTrx.transaction_id === transaction.id
    );
    return !isAlreadyInProject;
  }) || [];

  // Filter transactions based on search query
  const filteredTransactions = availableTransactions.filter(transaction => {
    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.categories?.name?.toLowerCase().includes(searchLower) ||
      transaction.wallets?.name?.toLowerCase().includes(searchLower) ||
      transaction.amount.toString().includes(searchQuery)
    );
  });

  // Reset selected transactions when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTransactionIds([]);
      setSearchQuery("");
    }
  }, [open]);

  const handleTransactionToggle = (transactionId: number) => {
    setSelectedTransactionIds(prev => {
      if (prev.includes(transactionId)) {
        return prev.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactionIds.length === filteredTransactions.length) {
      setSelectedTransactionIds([]);
    } else {
      setSelectedTransactionIds(filteredTransactions.map(t => t.id));
    }
  };

  const handleAddTransactions = async () => {
    if (!project || selectedTransactionIds.length === 0) return;

    setIsLoading(true);
    try {
      await addTransactionsToProject.mutateAsync({
        projectId: project.id,
        transactionIds: selectedTransactionIds
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to add transactions to business project", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle>
            Tambah Transaksi ke Proyek: {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 min-h-0">
          {/* Search and Select All */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                  onCheckedChange={handleSelectAll}
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
                  {availableTransactions.length === 0 
                    ? "Semua transaksi sudah ada di proyek ini"
                    : "Tidak ada transaksi yang sesuai dengan pencarian"
                  }
                </div>
              ) : (
                <div className="space-y-0 pb-12">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedTransactionIds.includes(transaction.id)}
                        onCheckedChange={() => handleTransactionToggle(transaction.id)}
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
                          {formatAmountCurrency(transaction.amount, transaction.wallets?.currency_code)}
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

        {/* Action Buttons - Fixed with proper background and z-index */}
        <div className="flex justify-end gap-2 pt-4 border-t bg-background relative z-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            onClick={handleAddTransactions}
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
