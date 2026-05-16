import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";
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
  ShieldCheck,
} from "lucide-react";

// Lazy-loaded components
const AdminDashboard = lazy(() => import("@/pages/Admin/AdminDashboard"));
const AdminDetails = lazy(() => import("@/pages/Admin/AdminDetails"));
const Expenses = lazy(() => import("@/pages/Admin/Expenses/Expenses"));
const Invoices = lazy(() => import("@/pages/Admin/invoice/Invoices"));
const Products = lazy(() => import("@/pages/Admin/Products/Products"));
const AuditLog = lazy(() => import("@/pages/Admin/AuditLog"));
const SettingPage = lazy(() => import("@/pages/Default/SettingPage"));
const InvoiceDetails = lazy(() => import("@/pages/Admin/invoice/InvoiceDetails"));
const ProductsDetails = lazy(() => import("@/pages/Admin/Products/ProductsDetails"));
const ExpensesDetails = lazy(() => import("@/pages/Admin/Expenses/ExpensesDetails"));

// User management sub-pages
const ManageAdmins = lazy(() => import("@/pages/Admin/users/Manage-Admins"));
const ManageManagers = lazy(
  () => import("@/pages/Admin/users/Manage-Managers"),
);
const ManageStaffs = lazy(() => import("@/pages/Admin/users/Manage-Staffs"));

export const adminRoutes: AppRoute = {
  label: "Admin",
  path: "admin",
  icon: ShieldCheck,
  element: (
    <RoleRoute allowedRoles={["Admin"]}>
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
      label: "Users",
      path: "users",
      icon: Users,
      element: <Outlet />,
      children: [
        {
          label: "Manage Admins",
          path: "manage-admins",
          element: (
            <Suspense fallback={<SuspenseLoader />}>
              <ManageAdmins />
            </Suspense>
          ),
        },
        {
          label: "Manage Staffs",
          path: "staffs",
          element: (
            <Suspense fallback={<SuspenseLoader />}>
              <ManageStaffs />
            </Suspense>
          ),
        },
        {
          label: "Manage Managers",
          path: "managers",
          element: (
            <Suspense fallback={<SuspenseLoader />}>
              <ManageManagers />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "audit-log",
      label: "Audit Log",
      icon: ShieldCheck,
      element: (
        <Suspense fallback={<SuspenseLoader />}>
          <AuditLog />
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
