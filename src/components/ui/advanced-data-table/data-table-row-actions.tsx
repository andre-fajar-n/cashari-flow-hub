import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, LucideIcon } from "lucide-react";

export interface RowAction<T = any> {
  label: string;
  icon: LucideIcon;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean; // Add separator before this action
}

interface DataTableRowActionsProps<T> {
  item: T;
  actions: RowAction<T>[];
  menuLabel?: string;
}

/**
 * Reusable row actions component for data tables
 * Displays a dropdown menu with customizable actions
 * 
 * @example
 * ```tsx
 * <DataTableRowActions
 *   item={budget}
 *   actions={[
 *     {
 *       label: "Detail",
 *       icon: Eye,
 *       onClick: (budget) => handleView(budget),
 *     },
 *     {
 *       label: "Edit",
 *       icon: Edit,
 *       onClick: (budget) => handleEdit(budget),
 *     },
 *     {
 *       label: "Hapus",
 *       icon: Trash2,
 *       onClick: (budget) => handleDelete(budget.id),
 *       variant: "destructive",
 *       separator: true,
 *     },
 *   ]}
 * />
 * ```
 */
export function DataTableRowActions<T>({
  item,
  actions,
  menuLabel = "Aksi",
}: DataTableRowActionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Buka menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isDestructive = action.variant === "destructive";
          
          return (
            <div key={index}>
              {action.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => action.onClick(item)}
                className={isDestructive ? "text-red-600" : ""}
              >
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

