import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import FetchExchangeRatesButton from "@/components/header/FetchExchangeRatesButton";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 sm:bg-background">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 sm:h-14 shrink-0 items-center gap-3 sm:gap-2 border-b bg-white px-4 sm:px-4 shadow-sm sm:shadow-none">
            <SidebarTrigger className="-ml-1 p-2 sm:p-1 hover:bg-gray-100 rounded-lg sm:rounded-md transition-colors" />
            <div className="flex-1 flex items-center justify-between">
              <span /> {/* Spacer */}
              <h1 className="text-lg sm:text-base font-bold sm:font-semibold text-gray-900">Financial Management</h1>
              <FetchExchangeRatesButton />
            </div>
          </header>
          <main className="flex-1 p-3 sm:p-4 bg-gray-50 sm:bg-background">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
