import type { RegisteredUser } from "@/types/auth.types";

const USERS_KEY = "erp_registered_users";

export function getRegisteredUsers(): RegisteredUser[] {
  const users = localStorage.getItem(USERS_KEY);

  if (!users) {
    const defaultAdmin: RegisteredUser = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "Admin",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    saveRegisteredUsers([defaultAdmin]);
    return [defaultAdmin];
  }

  try {
    return JSON.parse(users) as RegisteredUser[];
  } catch {
    return [];
  }
}

export function saveRegisteredUsers(users: RegisteredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function addRegisteredUser(user: RegisteredUser) {
  const users = getRegisteredUsers();

  const alreadyExists = users.some(
    (item) => item.email.toLowerCase() === user.email.toLowerCase()
  );

  if (alreadyExists) {
    throw new Error("User already exists with this email");
  }

  saveRegisteredUsers([user, ...users]);
}