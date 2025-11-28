import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  LogOut,
  Wallet,
  Target,
  TrendingUp,
  Calendar,
  Users,
  CreditCard,
  History,
} from "lucide-react";

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const mainMenuItems = [
    { path: "/dashboard", label: "Dasbor", icon: Home },
    { path: "/settings", label: "Pengaturan", icon: Settings },
  ];

  const transactionMenuItems = [
    { path: "/transaction-history", label: "Riwayat Transaksi", icon: History },
  ];

  const featureMenuItems = [
    { path: "/budget", label: "Budget", icon: Calendar },
    { path: "/business-project", label: "Proyek Bisnis", icon: Users },
    { path: "/debt", label: "Hutang/Piutang", icon: CreditCard },
    { path: "/goal", label: "Target", icon: Target },
  ];

  const investmentMenuItems = [
    { path: "/investment-instrument", label: "Instrumen Investasi", icon: TrendingUp },
    { path: "/investment-asset", label: "Aset Investasi", icon: Wallet },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Cashari</h2>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                    >
                      <button className="flex items-center gap-2 w-full">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Transaksi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {transactionMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                    >
                      <button className="flex items-center gap-2 w-full">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Fitur</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {featureMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                    >
                      <button className="flex items-center gap-2 w-full">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Investasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {investmentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                    >
                      <button className="flex items-center gap-2 w-full">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button
          onClick={signOut}
          variant="destructive"
          className="w-full flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
