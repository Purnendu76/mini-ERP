import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps routes that should only be accessible to unauthenticated users
 * (e.g. /login). If the user is already logged in, they are redirected
 * to their role-specific dashboard.
 */
export default function GuestRoute({ children }: GuestRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    const dashboardByRole: Record<string, string> = {
      Admin: "/admin/dashboard",
      Manager: "/manager/dashboard",
      Staff: "/staff/dashboard",
    };

    const targetDashboard = dashboardByRole[user.role] || "/login";
    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
}
