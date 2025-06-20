
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Settings, LogOut } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/settings", label: "Pengaturan", icon: Settings },
  ];

  return (
    <Card className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {navItems.map((item) => {
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
        <Button 
          onClick={signOut} 
          variant="destructive" 
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </Button>
      </div>
    </Card>
  );
};

export default Navbar;
