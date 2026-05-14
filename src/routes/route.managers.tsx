import { lazy, Suspense } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import AppLayout from "@/Layout/AppLayout";
import type { AppRoute } from "./utils";

// Lazy-loaded components
const Managers = lazy(() => import("@/pages/Manager/Manages"));
const ManagerDetails = lazy(() => import("@/pages/Manager/ManagersDetails"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products"));
const Users = lazy(() => import("@/pages/Admin/Users"));

export const managerRoutes: AppRoute = {
  label: "Managers",
  path: "manager",
  element: <AppLayout />,
  children: [
    {
      label: "Managers List",
      path: "managers",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Managers />
        </Suspense>
      ),
    },
    {
      label: "Dashboard",
      path: "dashboard",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <AdminDashboard />
        </Suspense>
      ),
    },
    {
      label: "Products",
      path: "products",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Products />
        </Suspense>
      ),
    },
    {
      label: "Expenses",
      path: "expenses",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Expenses />
        </Suspense>
      ),
    },
    {
      label: "Invoices",
      path: "invoices",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Invoices />
        </Suspense>
      ),
    },
    {
      label: "Users",
      path: "users",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Users />
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
  ],
};
