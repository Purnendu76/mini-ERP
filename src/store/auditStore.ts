import { create } from "zustand";
import type { AuditLog } from "@/types/audit.types";
import { axiosClient } from "@/api/axiosClient";
import { useAuthStore } from "./authStore";

interface AuditState {
  logs: AuditLog[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchLogs: (force?: boolean) => Promise<void>;
  addLog: (log: any) => Promise<boolean>;
  clearLogs: () => Promise<boolean>;
}

let activeFetchPromise: Promise<void> | null = null;

export const useAuditStore = create<AuditState>((set, get) => ({
  logs: [],
  isFetched: false,
  isLoading: false,
  error: null,

  fetchLogs: async (force = false) => {
    // Deduplicate concurrent requests
    if (activeFetchPromise) return activeFetchPromise;
    if (get().isFetched && !force) return;

    activeFetchPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosClient.get("/audit-logs");
        if (response.status === 200) {
          const mappedLogs: AuditLog[] = response.data.map((log: any) => ({
            id: log.id,
            timestamp: log.timestamp ? new Date(log.timestamp).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
            action: log.action,
            entity: log.entity,
            user: {
              name: log.userName || (log.user && log.user.name) || "System Admin",
              email: log.userEmail || (log.user && log.user.email) || "admin@example.com",
            },
            ipAddress: log.ipAddress || "127.0.0.1",
            details: log.details,
          }));

          mappedLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

          set({
            logs: mappedLogs,
            isFetched: true,
            isLoading: false,
          });
        }
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to fetch audit logs",
        });
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  addLog: async (logData) => {
    try {
      const currentUser = useAuthStore.getState().user;
      
      const userName = currentUser?.name || logData.userName || logData.user?.name || "System Admin";
      const userEmail = currentUser?.email || logData.userEmail || logData.user?.email || "admin@example.com";
      const ipAddress = logData.ipAddress || "127.0.0.1";

      const payload = {
        action: logData.action,
        entity: logData.entity,
        userName,
        userEmail,
        ipAddress,
        details: logData.details,
      };

      const response = await axiosClient.post("/audit-logs", payload);
      if (response.status === 201) {
        const createdLog = response.data;
        const newMappedLog: AuditLog = {
          id: createdLog.id,
          timestamp: createdLog.timestamp ? new Date(createdLog.timestamp).toISOString().replace('T', ' ').split('.')[0] : new Date().toISOString().replace('T', ' ').split('.')[0],
          action: createdLog.action,
          entity: createdLog.entity,
          user: {
            name: createdLog.userName || "System Admin",
            email: createdLog.userEmail || "admin@example.com",
          },
          ipAddress: createdLog.ipAddress || "127.0.0.1",
          details: createdLog.details,
        };

        set((state) => ({ logs: [newMappedLog, ...state.logs] }));
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  clearLogs: async () => {
    try {
      const response = await axiosClient.delete("/audit-logs");
      if (response.status === 200) {
        set({ logs: [] });
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
}));
