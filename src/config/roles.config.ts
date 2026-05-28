export const USER_ROLES = [
  { id: "Admin", label: "Admin" },
  { id: "Manager", label: "Manager" },
  { id: "Staff", label: "Staff" },
] as const;

export type UserRole = typeof USER_ROLES[number]["id"];

export const USER_STATUSES = [
  { id: "Active", label: "Active" },
  { id: "Inactive", label: "Inactive" },
] as const;

export type UserStatus = typeof USER_STATUSES[number]["id"];

// Centralized role permissions mapping.
// Each role defines its CRUD capability.
export const ROLE_PERMISSIONS: Record<UserRole, { create: boolean; view: boolean; edit: boolean; delete: boolean }> = {
  Admin: { create: true, view: true, edit: true, delete: true },
  Manager: { create: true, view: true, edit: true, delete: false },
  Staff: { create: true, view: true, edit: true, delete: false },
};
