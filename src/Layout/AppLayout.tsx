import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppRoutes } from "@/context/RouteContext";
import { Settings, DownloadCloud, LayoutGrid } from "lucide-react";
import { Suspense, useState, useEffect } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = useAppRoutes();
  const [isPageLoading, setIsPageLoading] = useState(false);

  // Derive role prefix from URL (e.g., admin, manager, staff)
  const rolePrefix = location.pathname.split("/")[1] || "admin";

  // Trigger skeleton on route change for a smoother transition
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 400); // Small artificial delay to show the skeleton

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Logic to find current page label
  const findPageLabel = () => {
    for (const route of routes) {
      if (location.pathname.startsWith(`/${route.path}`)) {
        if (route.children) {
          const child = route.children.find(
            (c) => location.pathname === `/${route.path}/${c.path}`,
          );
          if (child) return child.label;
        }
        return route.label;
      }
    }
    return "ERP System";
  };

  const pageLabel = findPageLabel();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto bg-slate-50/50 dark:bg-background">
        {/* Premium Header */}
        <div className="px-6 py-3 border-b flex items-center justify-between bg-white/80 dark:bg-card/80 backdrop-blur-md sticky top-0 z-10 shadow-sm border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md shadow-sm border border-blue-100 dark:border-blue-800">
                <LayoutGrid size={18} strokeWidth={2.5} />
              </div>
              <h1 className="font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                {pageLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="hidden md:flex items-center gap-2 px-3.5 py-1.5 text-sm font-bold border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all shadow-sm active:scale-95">
              <DownloadCloud size={16} strokeWidth={2.5} />
              <span>Analysis Report</span>
            </button>
            <ThemeToggle />
            <button
              onClick={() => navigate(`/${rolePrefix}/settings`)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            >
              <Settings size={20} strokeWidth={2} />
            </button>
            <div className="size-9 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700 cursor-pointer hover:ring-blue-400 transition-all">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"
                alt="User"
                className="size-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 min-h-[calc(100vh-65px)]">
          {isPageLoading ? (
            <SuspenseLoader />
          ) : (
            <Suspense fallback={<SuspenseLoader />}>
              <Outlet />
            </Suspense>
          )}
        </div>
      </main>
    </SidebarProvider>
  );
}
