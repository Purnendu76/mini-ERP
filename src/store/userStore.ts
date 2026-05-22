import { create } from "zustand";
import type { RegisteredUser } from "@/types/auth.types";
import { useAuditStore } from "./auditStore";
import { axiosClient } from "@/api/axiosClient";

interface UserState {
  users: RegisteredUser[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchUsers: (force?: boolean) => Promise<void>;
  addUser: (userData: Omit<RegisteredUser, "id" | "createdAt">) => Promise<boolean>;
  updateUser: (id: string, userData: Partial<RegisteredUser>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  syncWithAuth: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  isFetched: false,
  isLoading: false,
  error: null,

  syncWithAuth: () => {
    get().fetchUsers(true);
  },

  fetchUsers: async (force = false) => {
    if (get().isFetched && !force) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.get("/auth/users");
      if (response.status === 200) {
        set({
          users: response.data,
          isFetched: true,
          isLoading: false,
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch users",
      });
    }
  },

  addUser: async (userData) => {
    try {
      const payload = {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password.trim(),
        role: userData.role || "Staff",
        status: userData.status || "Active",
        photo: userData.photo || null,
      };

      const response = await axiosClient.post("/auth/register", payload);
      if (response.status === 201) {
        await get().fetchUsers(true);

        useAuditStore.getState().addLog({
          action: "CREATE",
          entity: "USER",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Created User ${payload.role}: ${payload.name}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const payload: any = {};
      if (userData.name) payload.name = userData.name.trim();
      if (userData.email) payload.email = userData.email.trim().toLowerCase();
      if (userData.password) payload.password = userData.password.trim();
      if (userData.role) payload.role = userData.role;
      if (userData.status) payload.status = userData.status;
      if (userData.photo !== undefined) payload.photo = userData.photo;

      const response = await axiosClient.put(`/auth/users/${id}`, payload);
      if (response.status === 200) {
        const updatedUser = response.data;
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updatedUser } : u)),
        }));

        useAuditStore.getState().addLog({
          action: "UPDATE",
          entity: "USER",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Updated User: ${updatedUser.name}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteUser: async (id) => {
    try {
      const targetUser = get().users.find((u) => u.id === id);
      const response = await axiosClient.delete(`/auth/users/${id}`);
      if (response.status === 200) {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));

        if (targetUser) {
          useAuditStore.getState().addLog({
            action: "DELETE",
            entity: "USER",
            userName: "System Admin",
            userEmail: "admin@example.com",
            ipAddress: "127.0.0.1",
            details: `Deleted User: ${targetUser.name}`,
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
}));

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === "erp_registered_users") {
      useUserStore.getState().syncWithAuth();
    }
  });
}
