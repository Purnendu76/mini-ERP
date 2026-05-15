import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/user.types";
import { useAuditStore } from "./auditStore";

interface UserState {
  users: User[];
  addUser: (user: Omit<User, "id" | "createdAt">) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [
        {
          id: "1",
          name: "System Admin",
          email: "admin@invoice-system.local",
          status: "active",
          role: "Admin",
          photo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop",
          createdAt: new Date().toISOString(),
        },
      ],
      addUser: (userData) =>
        set((state) => {
          const newUser = {
            ...userData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          };
          
          useAuditStore.getState().addLog({
            action: "CREATE",
            entity: "USER",
            user: { name: "System Admin", email: "admin@invoice-system.local" },
            ipAddress: "127.0.0.1",
            details: `Created ${userData.role}: ${userData.name}`
          });

          return { users: [newUser, ...state.users] };
        }),
      updateUser: (id, userData) =>
        set((state) => {
          const user = state.users.find(u => u.id === id);
          if (user) {
            useAuditStore.getState().addLog({
              action: "UPDATE",
              entity: "USER",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Updated User: ${user.name}`
            });
          }
          return {
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...userData } : user
            ),
          };
        }),
      deleteUser: (id) =>
        set((state) => {
          const user = state.users.find(u => u.id === id);
          if (user) {
            useAuditStore.getState().addLog({
              action: "DELETE",
              entity: "USER",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Deleted User: ${user.name}`
            });
          }
          return {
            users: state.users.filter((user) => user.id !== id),
          };
        }),
    }),
    {
      name: "erp-user-storage",
    }
  )
);
