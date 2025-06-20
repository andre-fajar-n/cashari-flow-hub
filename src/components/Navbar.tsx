
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Home, Settings, LogOut, Menu, Wallet, Target, TrendingUp, Calendar, Users, CreditCard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const mainNavItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/settings", label: "Pengaturan", icon: Settings },
  ];

  const featureNavItems = [
    { path: "/budget", label: "Budget", icon: Calendar },
    { path: "/business-project", label: "Proyek Bisnis", icon: Users },
    { path: "/debt", label: "Hutang", icon: CreditCard },
    { path: "/goal", label: "Target", icon: Target },
    { path: "/investment-instrument", label: "Instrumen Investasi", icon: TrendingUp },
    { path: "/investment-asset", label: "Aset Investasi", icon: Wallet },
  ];

  return (
    <Card className="mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-center p-4 gap-4">
        {/* Main Navigation */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "outline"}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {/* Features Navigation - Dropdown for mobile */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <div className="hidden lg:flex flex-wrap gap-2">
            {featureNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1"
                >
                  <Icon className="w-3 h-3" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Mobile/Tablet Features Menu */}
          <div className="lg:hidden w-full sm:w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Menu className="w-4 h-4 mr-2" />
                  Fitur
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {featureNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={isActive ? "bg-accent" : ""}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Logout Button */}
          <Button 
            onClick={signOut} 
            variant="destructive" 
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Navbar;
