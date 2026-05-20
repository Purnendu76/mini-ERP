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
  UserCog,
} from "lucide-react";

// Lazy-loaded components
const Staff = lazy(() => import("@/pages/Staff/staff"));
const StaffDetails = lazy(() => import("@/pages/Staff/staffDetails"));
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/invoice/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products/Products"));
const UsersList = lazy(() => import("@/pages/Admin/Users"));
const SettingPage = lazy(() => import("@/pages/Default/SettingPage"));
const InvoiceDetails = lazy(() => import("@/pages/Admin/invoice/InvoiceDetails"));
const ProductsDetails = lazy(() => import("@/pages/Admin/Products/ProductsDetails"));
const ExpensesDetails = lazy(() => import("@/pages/Admin/Expenses/ExpensesDetails"));

export const staffRoutes: AppRoute = {
  label: "Staff",
  path: "staff",
  icon: UserCog,
  element: (
    <RoleRoute allowedRoles={["Staff"]}>
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
      hidden: true,
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
      label: "Staff Details",
      path: "details/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <StaffDetails />
        </Suspense>
      ),
      hidden: true,
    },
    {
      label: "Invoice Details",
      path: "invoices/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <InvoiceDetails />
        </Suspense>
      ),
      hidden: true,
    },
    {
      label: "Product Details",
      path: "products/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <ProductsDetails />
        </Suspense>
      ),
      hidden: true,
    },
    {
      label: "Expense Details",
      path: "expenses/:id",
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <ExpensesDetails />
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
