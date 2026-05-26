import { create } from "zustand";
import { axiosClient } from "@/api/axiosClient";

import { useProductStore } from "./productStore";
import { useExpenseStore } from "./expenseStore";
import { useInvoiceStore } from "./invoiceStore";
import { useUserStore } from "./userStore";
import { useAuditStore } from "./auditStore";

import type { AuditLog } from "@/types/audit.types";

type DashboardStore = {
  isLoading: boolean;
  isFetched: boolean;
  error: string | null;

  fetchDashboard: (force?: boolean) => Promise<void>;
  resetDashboard: () => void;
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  isLoading: false,
  isFetched: false,
  error: null,

  fetchDashboard: async (force = false) => {
    const { isLoading, isFetched } = get();

    // Prevent duplicate API calls
    if (isLoading) return;

    // Prevent re-fetch after already loaded
    if (isFetched && !force) return;

    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await axiosClient.get("/dashboard");

      if (response.status === 200) {
        const {
          products = [],
          expenses = [],
          invoices = [],
          users = [],
          auditLogs = [],
        } = response.data;

        useProductStore.setState({
          products,
          isFetched: true,
          isLoading: false,
        });

        useExpenseStore.setState({
          expenses,
          isFetched: true,
          isLoading: false,
        });

        useInvoiceStore.setState({
          invoices,
          isFetched: true,
          isLoading: false,
        });

        useUserStore.setState({
          users,
          isFetched: true,
          isLoading: false,
        });

        const mappedLogs: AuditLog[] = auditLogs.map((log: any) => ({
          id: log.id,
          timestamp: log.timestamp
            ? new Date(log.timestamp).toISOString().replace("T", " ").split(".")[0]
            : new Date().toISOString().replace("T", " ").split(".")[0],
          action: log.action,
          entity: log.entity,
          user: {
            name:
              log.userName ||
              (log.user && log.user.name) ||
              "System Admin",
            email:
              log.userEmail ||
              (log.user && log.user.email) ||
              "admin@example.com",
          },
          ipAddress: log.ipAddress || "127.0.0.1",
          details: log.details,
        }));

        mappedLogs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));

        useAuditStore.setState({
          logs: mappedLogs,
          isFetched: true,
          isLoading: false,
        });

        set({
          isLoading: false,
          isFetched: true,
          error: null,
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error:
          err instanceof Error
            ? err.message
            : "Failed to fetch dashboard data",
      });
    }
  },

  resetDashboard: () => {
    set({
      isFetched: false,
      error: null,
    });
  },
}));