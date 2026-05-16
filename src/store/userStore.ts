import { create } from "zustand";
import type { RegisteredUser, UserRole, UserStatus } from "@/types/auth.types";
import { useAuditStore } from "./auditStore";
import { getRegisteredUsers, saveRegisteredUsers } from "@/lib/registeredUsers";

interface UserState {
  users: RegisteredUser[];
  addUser: (user: Omit<RegisteredUser, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Partial<RegisteredUser>) => void;
  deleteUser: (id: string) => void;
  syncWithAuth: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: getRegisteredUsers(),
  
  syncWithAuth: () => {
    set({ users: getRegisteredUsers() });
  },

  addUser: (userData) => {
    const email = userData.email.trim().toLowerCase();
    const name = userData.name.trim();
    const password = userData.password.trim();

    const newUser: RegisteredUser = {
      ...userData,
      id: crypto.randomUUID(),
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
      status: userData.status || "Active",
    } as RegisteredUser;
    
    const currentUsers = getRegisteredUsers();
    
    // Check for duplicate email
    if (currentUsers.some(u => u.email.toLowerCase() === email)) {
      throw new Error("A user with this email already exists");
    }

    const updatedUsers = [newUser, ...currentUsers];
    saveRegisteredUsers(updatedUsers);
    
    set({ users: updatedUsers });

    useAuditStore.getState().addLog({
      action: "CREATE",
      entity: "USER",
      user: { name: "System Admin", email: "admin@example.com" },
      ipAddress: "127.0.0.1",
      details: `Created ${userData.role}: ${name}`
    });
  },

  updateUser: (id, userData) => {
    const currentUsers = getRegisteredUsers();
    
    // Create a copy of userData and normalize
    const cleanData = { ...userData };
    if (cleanData.email) cleanData.email = cleanData.email.trim().toLowerCase();
    if (cleanData.name) cleanData.name = cleanData.name.trim();
    if (cleanData.password) {
      cleanData.password = cleanData.password.trim();
    } else {
      delete cleanData.password;
    }

    const updatedUsers = currentUsers.map((user) =>
      user.id === id ? { ...user, ...cleanData } : user
    );
    saveRegisteredUsers(updatedUsers);
    
    set({ users: updatedUsers });

    const user = updatedUsers.find(u => u.id === id);
    if (user) {
      useAuditStore.getState().addLog({
        action: "UPDATE",
        entity: "USER",
        user: { name: "System Admin", email: "admin@example.com" },
        ipAddress: "127.0.0.1",
        details: `Updated User: ${user.name}`
      });
    }
  },

  deleteUser: (id) => {
    const currentUsers = getRegisteredUsers();
    const user = currentUsers.find(u => u.id === id);
    const updatedUsers = currentUsers.filter((user) => user.id !== id);
    saveRegisteredUsers(updatedUsers);
    
    set({ users: updatedUsers });

    if (user) {
      useAuditStore.getState().addLog({
        action: "DELETE",
        entity: "USER",
        user: { name: "System Admin", email: "admin@example.com" },
        ipAddress: "127.0.0.1",
        details: `Deleted User: ${user.name}`
      });
    }
  },
}));

// Sync across tabs
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "erp_registered_users") {
      useUserStore.getState().syncWithAuth();
    }
  });
}
