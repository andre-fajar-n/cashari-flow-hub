import { Badge } from "@/components/ui/badge";
import { Building2, Target } from "lucide-react";

interface TransactionAssociationsProps {
  transaction: any;
}

const TransactionAssociations = ({ transaction }: TransactionAssociationsProps) => {
  const budgets = transaction.budget_items?.map((item: any) => item.budgets?.name).filter(Boolean) || [];
  const businessProjects = transaction.business_project_transactions?.map((item: any) => item.business_projects?.name).filter(Boolean) || [];

  if (budgets.length === 0 && businessProjects.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {budgets.map((budgetName: string, index: number) => (
        <Badge key={`budget-${index}`} variant="secondary" className="text-xs">
          <Target className="w-3 h-3 mr-1" />
          {budgetName}
        </Badge>
      ))}
      {businessProjects.map((projectName: string, index: number) => (
        <Badge key={`project-${index}`} variant="outline" className="text-xs">
          <Building2 className="w-3 h-3 mr-1" />
          {projectName}
        </Badge>
      ))}
    </div>
  );
};

export default TransactionAssociations;
