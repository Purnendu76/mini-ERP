import type { UserRole } from "@/types/auth.types";

export type PermissionAction = "create" | "view" | "edit" | "delete";
export type PermissionModule = "users" | "products" | "invoices" | "expenses" | "profile" | "settings";

export function canPerformAction(
  role: UserRole,
  action: PermissionAction,
  _module?: PermissionModule
): boolean {
  if (role === "Admin") {
    return true; // Admin has full access to everything
  }

  if (role === "Manager") {
    // Manager has all permissions except delete
    if (action === "delete"  ) {
      return false;
    }
    return true;
  }

  if (role === "Staff") {
    // Staff can only view
    if (action === "view") {
      return true;
    }
    return false;
  }

  return false;
}
