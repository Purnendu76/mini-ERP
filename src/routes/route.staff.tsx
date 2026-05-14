import { lazy, Suspense } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import AppLayout from "@/Layout/AppLayout";
import type { AppRoute } from "./utils";

// Lazy-loaded components
const Staff = lazy(() => import("@/pages/Staff/staff"));
const StaffDetails = lazy(() => import("@/pages/Staff/staffDetails"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products"));
const Users = lazy(() => import("@/pages/Admin/Users"));

export const staffRoutes: AppRoute = {
  label: "Staff",
  path: "staff",
  element: <AppLayout />,
  children: [
    {
      label: "Staff List",
      path: "staff",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Staff />
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
      label: "Staff Details",
      path: "details/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <StaffDetails />
        </Suspense>
      ),
      hidden: true,
    },
  ],
};
