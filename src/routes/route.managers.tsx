import { lazy, Suspense } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import AppLayout from "@/Layout/AppLayout";
import RoleRoute from "@/components/auth/RoleRoute";
import type { AppRoute } from "./utils";
import {
  LayoutGrid,
  Package,
  CreditCard,
  Receipt,
  Users,
  UsersRound,
} from "lucide-react";

// Lazy-loaded components
const Managers = lazy(() => import("@/pages/Manager/Manages"));
const ManagerDetails = lazy(() => import("@/pages/Manager/ManagersDetails"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/invoice/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products/Products"));
const UsersList = lazy(() => import("@/pages/Admin/Users"));
const SettingPage = lazy(() => import("@/pages/Default/SettingPage"));

export const managerRoutes: AppRoute = {
  label: "Managers",
  path: "manager",
  icon: UsersRound,
  element: (
    <RoleRoute allowedRoles={["Admin", "Manager"]}>
      <AppLayout />
    </RoleRoute>
  ),
  children: [
    {
      label: "Dashboard",
      path: "dashboard",
      icon: LayoutGrid,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <AdminDashboard />
        </Suspense>
      ),
    },
    {
      label: "Products",
      path: "products",
      icon: Package,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Products />
        </Suspense>
      ),
    },
    {
      label: "Expenses",
      path: "expenses",
      icon: CreditCard,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Expenses />
        </Suspense>
      ),
    },
    {
      label: "Invoices",
      path: "invoices",
      icon: Receipt,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Invoices />
        </Suspense>
      ),
    },

    {
      label: "Manager Details",
      path: "details/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <ManagerDetails />
        </Suspense>
      ),
      hidden: true,
    },
    {
      label: "Settings",
      path: "settings",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <SettingPage />
        </Suspense>
      ),
      hidden: true,
    },
  ],
};
