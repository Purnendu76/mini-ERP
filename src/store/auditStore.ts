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
      logs: [],
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
