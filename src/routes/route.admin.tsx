import { lazy, Suspense } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import AppLayout from "@/Layout/AppLayout";
import type { AppRoute } from "./utils";
import { LayoutGrid, Package, CreditCard, Receipt, Users, ShieldCheck } from "lucide-react";

// Lazy-loaded components
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const AdminDetails = lazy(() => import("@/pages/Admin/AdminDetails"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products"));
const UsersList = lazy(() => import("@/pages/Admin/Users"));

export const adminRoutes: AppRoute = {
  label: "Admin",
  path: "admin",
  icon: ShieldCheck,
  element: <AppLayout />,
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
      label: "Users",
      path: "users",
      icon: Users,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <UsersList />
        </Suspense>
      ),
    },
    {
      label: "Admin Details",
      path: "details/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <AdminDetails />
        </Suspense>
      ),
      hidden: true,
    },
  ],
};
