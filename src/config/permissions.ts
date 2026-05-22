import type { UserRole } from "@/types/auth.types";
import { ROLE_PERMISSIONS } from "./roles.config.js";

export type PermissionAction = "create" | "view" | "edit" | "delete";
export type PermissionModule = "users" | "products" | "invoices" | "expenses" | "profile" | "settings";

export function canPerformAction(
  role: UserRole,
  action: PermissionAction,
  _module?: PermissionModule
): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) {
    return false;
  }
  return permissions[action] ?? false;
}
