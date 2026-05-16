import type { RegisteredUser } from "@/types/auth.types";
import bcrypt from "bcryptjs";

const USERS_KEY = "erp_registered_users";

export function getRegisteredUsers(): RegisteredUser[] {
  const users = localStorage.getItem(USERS_KEY);

  if (!users) {
    const defaultAdmin: RegisteredUser = {
      id: "admin-1",
      name: "Admin User",
      email: "admin@example.com",
      password: bcrypt.hashSync("admin123", 10),
      role: "Admin",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    saveRegisteredUsers([defaultAdmin]);
    return [defaultAdmin];
  }

  try {
    const parsedUsers = JSON.parse(users) as RegisteredUser[];
    let needsUpdate = false;

    // Migrate any plain-text passwords to bcrypt hashes
    const migratedUsers = parsedUsers.map(user => {
      // bcrypt hashes start with $2a$, $2b$, or $2y$
      const isHashed = user.password && user.password.startsWith("$2");
      if (!isHashed) {
        needsUpdate = true;
        return {
          ...user,
          password: bcrypt.hashSync(user.password, 10)
        };
      }
      return user;
    });

    if (needsUpdate) {
      saveRegisteredUsers(migratedUsers);
    }

    return migratedUsers;
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