export type UserRole = "Admin" | "Manager" | "Staff";
export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  photo?: string;
  status: UserStatus;
  role: UserRole;
  createdAt: string;
}
