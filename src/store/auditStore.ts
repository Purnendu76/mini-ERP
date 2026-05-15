import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuditLog } from "@/types/audit.types";

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [
        {
          id: "1",
          timestamp: "2026-05-15 10:49:56",
          action: "LOGIN",
          entity: "USER",
          user: {
            name: "System Admin",
            email: "admin@invoice-system.local",
          },
          ipAddress: "127.0.0.1",
          details: "Method: EMAIL",
        },
        {
          id: "2",
          timestamp: "2026-05-14 14:17:01",
          action: "LOGIN",
          entity: "USER",
          user: {
            name: "System Admin",
            email: "admin@invoice-system.local",
          },
          ipAddress: "127.0.0.1",
          details: "Method: EMAIL",
        },
      ],
      addLog: (logData) =>
        set((state) => ({
          logs: [
            {
              ...logData,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString().replace('T', ' ').split('.')[0],
            },
            ...state.logs,
          ],
        })),
      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "erp-audit-storage",
    }
  )
);
