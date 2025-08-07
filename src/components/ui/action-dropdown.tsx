import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReactNode } from "react";

interface ActionDropdownProps {
  dropdownId: string | number;
  openDropdownId: string | number | null;
  setOpenDropdownId: (id: string | number | null) => void;
  triggerContent: ReactNode;
  menuItems: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    className?: string;
  }[];
}

export const ActionDropdown = ({
  dropdownId,
  openDropdownId,
  setOpenDropdownId,
  triggerContent,
  menuItems,
}: ActionDropdownProps) => {
  return (
    <DropdownMenu
      open={openDropdownId === dropdownId}
      onOpenChange={(open) => {
        setOpenDropdownId(open ? dropdownId : null);
      }}
    >
      <DropdownMenuTrigger asChild>
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {menuItems.map((item, index) => (
          <DropdownMenuItem
            key={index}
            onClick={item.onClick}
            className={item.className}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
