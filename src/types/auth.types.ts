import type { UserRole, UserStatus } from "@/config/roles.config";
export type { UserRole, UserStatus };

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