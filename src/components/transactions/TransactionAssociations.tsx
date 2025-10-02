import { Badge } from "@/components/ui/badge";
import { TransactionModel } from "@/models/transactions";
import { Building2, Target } from "lucide-react";

interface TransactionAssociationsProps {
  transaction: TransactionModel;
}

const TransactionAssociations = ({ transaction }: TransactionAssociationsProps) => {
  const budgets = transaction.budget_items?.map((item) => item.budgets?.name).filter(Boolean) || [];
  const businessProjects = transaction.business_project_transactions?.map((item) => item.business_projects?.name).filter(Boolean) || [];

  if (budgets.length === 0 && businessProjects.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 mt-3">
      {budgets.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            <Target className="w-4 h-4" />
            <span>Budget:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {budgets.map((budgetName: string, index: number) => (
              <Badge key={`budget-${index}`} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                {budgetName}
              </Badge>
            ))}
          </div>
        </div>
      )}
      {businessProjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200">
            <Building2 className="w-4 h-4" />
            <span>Proyek Bisnis:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {businessProjects.map((projectName: string, index: number) => (
              <Badge key={`project-${index}`} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                {projectName}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionAssociations;
