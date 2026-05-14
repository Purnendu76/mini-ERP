import { lazy, Suspense } from "react";
import { SuspenseLoader } from "@/components/loaders/SuspenseLoader";
import AppLayout from "@/Layout/AppLayout";
import type { AppRoute } from "./utils";
import { LayoutGrid, Package, CreditCard, Receipt, Users, UserCog } from "lucide-react";

// Lazy-loaded components
const Staff = lazy(() => import("@/pages/Staff/staff"));
const StaffDetails = lazy(() => import("@/pages/Staff/staffDetails"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products"));
const UsersList = lazy(() => import("@/pages/Admin/Users"));

export const staffRoutes: AppRoute = {
  label: "Staff",
  path: "staff",
  icon: UserCog,
  element: <AppLayout />,
  children: [
    {
      label: "Staff List",
      path: "staff",
      icon: UserCog,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <Staff />
        </Suspense>
      ),
    },
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
