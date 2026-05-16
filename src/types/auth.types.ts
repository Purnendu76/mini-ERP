export type UserRole = "Admin" | "Manager" | "Staff";
export type UserStatus = "Active" | "Inactive";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photo?: string;
};
export type RegisteredUser = AuthUser & {
  password: string;
  createdAt: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};