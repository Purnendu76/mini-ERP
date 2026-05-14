import { LayoutDashboard, Users, UserCircle } from "lucide-react";

export const navbarMenu = [
  {
    label: "Admin",
    icon: LayoutDashboard,
    path: "/admin",
    children: [
      { label: "Dashboard", path: "/admin/dashboard" },
      { label: "Products", path: "/admin/products" },
      { label: "Expenses", path: "/admin/expenses" },
      { label: "Invoices", path: "/admin/invoices" },
      { label: "Users", path: "/admin/users" },
    ],
  },
  {
    label: "Managers",
    icon: Users,
    path: "/manager",
    children: [
      { label: "Managers List", path: "/manager/managers" },
    ],
  },
  {
    label: "Staff",
    icon: UserCircle,
    path: "/staff",
    children: [
      { label: "Staff List", path: "/staff/staff" },
    ],
  },
];
