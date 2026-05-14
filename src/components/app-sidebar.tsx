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
import { Link, useLocation } from "react-router-dom";
import { useAppRoutes } from "@/context/RouteContext";
import { generateNavbarMenu } from "@/routes/utils";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export function AppSidebar() {
  const location = useLocation();
  const routes = useAppRoutes();
  
  // We use the helper function to build the menu structure from the actual routes
  const allMenuGroups = generateNavbarMenu(routes, location.pathname);

  // Filter menu groups based on the current URL prefix to isolate sections
  const menuGroups = allMenuGroups.filter((group) => {
    const path = location.pathname;
    if (path.startsWith("/admin")) return group.label === "Admin";
    if (path.startsWith("/manager")) return group.label === "Managers";
    if (path.startsWith("/staff")) return group.label === "Staff";
    return true; // Show all if not in a specific section (e.g., home/login)
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/20">
            <span className="font-bold text-xs">ERP</span>
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100">Management</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menuGroups.map((group) => {
          const Icon = typeof group.icon === "string" ? LayoutDashboard : (group.icon || LayoutDashboard);
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="flex items-center gap-2">
                <Icon size={14} />
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1.5">
                  {group.submenus?.map((item) => {
                    const SubIcon = LayoutDashboard; // Fallback or dynamic icon mapping
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={location.pathname === item.link}
                          className={`
                            h-11 px-4 transition-all duration-200 rounded-lg
                            ${location.pathname === item.link 
                              ? "!bg-blue-600 !text-white shadow-md hover:!bg-blue-700" 
                              : "text-slate-600 hover:bg-slate-100"
                            }
                          `}
                        >
                          <Link to={item.link} className="flex items-center gap-3">
                            {item.icon ? (
                              <item.icon size={20} strokeWidth={location.pathname === item.link ? 2.5 : 2} />
                            ) : (
                              <LayoutDashboard size={20} strokeWidth={location.pathname === item.link ? 2.5 : 2} />
                            )}
                            <span className="font-bold text-[15px]">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                  {group.link && (
                    <SidebarMenuItem key={group.label}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === group.link}
                        className={`
                          h-11 px-4 transition-all duration-200 rounded-lg
                          ${location.pathname === group.link 
                            ? "!bg-blue-600 !text-white shadow-md hover:!bg-blue-700" 
                            : "text-slate-600 hover:bg-slate-100"
                          }
                        `}
                      >
                        <Link to={group.link} className="flex items-center gap-3">
                          <Icon size={20} strokeWidth={location.pathname === group.link ? 2.5 : 2} />
                          <span className="font-bold text-[15px]">{group.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border/50">
        <div className="relative group">
          {/* Application Menu (Hidden by default, shows on hover or focus-within) */}
          <div className="absolute bottom-full left-0 w-full mb-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200 ease-out z-50">
            <div className="bg-white dark:bg-card border dark:border-slate-800 rounded-lg p-2 shadow-xl ring-1 ring-black/5 space-y-1">
              <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                <span>Application</span>
                <ThemeToggle />
              </div>
              <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md transition-colors group/item text-slate-700 dark:text-slate-300">
                <Settings size={16} className="text-slate-400 dark:text-slate-500 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300" />
                <span className="font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-2 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors group/item">
                <LogOut size={16} className="text-red-400 group-hover/item:text-red-600" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* User Profile Trigger */}
          <div className="flex items-center gap-3 px-1 py-2 cursor-pointer rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="relative">
              <div className="size-10 rounded-full overflow-hidden border-2 border-background shadow-sm ring-1 ring-border">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" 
                  alt="System Admin" 
                  className="size-full object-cover" 
                />
              </div>
              <div className="absolute bottom-0 right-0 size-2.5 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold leading-tight truncate text-slate-900 dark:text-slate-100">System Admin</span>
              <div className="flex gap-1 mt-1">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 uppercase tracking-tighter">Admin</span>
                <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 uppercase tracking-tighter">All Projects</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
