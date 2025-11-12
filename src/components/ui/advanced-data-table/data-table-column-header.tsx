import { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  /**
   * Enable sorting feature
   * @default false (if column.getCanSort() is true)
   */
  enableSorting?: boolean;
  /**
   * Disable hide column feature
   * @default false
   */
  disableHiding?: boolean;
}

/**
 * Flexible column header component with optional sorting and hiding features
 *
 * @example
 * Full features (sorting + hiding)
 * <DataTableColumnHeader column={column} title="Name" enableSorting={true} />
 *
 * @example
 * Sorting only
 * <DataTableColumnHeader column={column} title="Name" disableHiding={true} enableSorting={true} />
 *
 * @example
 * Hide only (simple button without dropdown)
 * <DataTableColumnHeader column={column} title="Name" />
 *
 * @example
 * Plain text (no features)
 * <DataTableColumnHeader column={column} title="Name" disableHiding={true} />
 */
export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  enableSorting = false,
  disableHiding = false,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const canSort = column.getCanSort() && enableSorting;
  const canHide = !disableHiding;

  // Plain text header (no features)
  if (!canSort && !canHide) {
    return <div className={cn("font-medium", className)}>{title}</div>;
  }

  // Hide only (simple button without dropdown)
  if (!canSort && canHide) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <span className="font-medium">{title}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-muted"
          onClick={() => column.toggleVisibility(false)}
          title="Sembunyikan kolom"
        >
          <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </div>
    );
  }

  // Sorting only (button with sort icon, no dropdown)
  if (canSort && !canHide) {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 h-8 hover:bg-muted"
          onClick={() => {
            // Toggle sorting: none -> asc -> desc -> none
            if (column.getIsSorted() === "asc") {
              column.toggleSorting(true); // Set to desc
            } else if (column.getIsSorted() === "desc") {
              column.clearSorting(); // Clear sorting
            } else {
              column.toggleSorting(false); // Set to asc
            }
          }}
        >
          <span className="font-medium">{title}</span>
          {column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />
          )}
        </Button>
      </div>
    );
  }

  // Full features (sorting + hiding with dropdown menu)
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span className="font-medium">{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUp className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Urutkan Naik
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDown className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Urutkan Turun
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Sembunyikan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

