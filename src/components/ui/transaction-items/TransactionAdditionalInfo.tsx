import { Badge } from "@/components/ui/badge";
import { Building2, Target } from "lucide-react";
import { TransactionAdditionalInfoProps } from "@/components/ui/transaction-items/types";

const TransactionAdditionalInfo = ({ movement }: TransactionAdditionalInfoProps) => {
  const hasBudget = movement.budget_ids && movement.budget_ids.length > 0;
  const hasProject = movement.project_ids && movement.project_ids.length > 0;

  if (!hasBudget && !hasProject) {
    return null;
  }

  const budgets = movement.budget_names_text?.split(",") || [];
  const businessProjects = movement.business_project_names_text?.split(",") || [];

  return (
    <div className="flex flex-col gap-2 mt-3">
      {hasBudget && (
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
      {hasProject && (
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

export default TransactionAdditionalInfo;
