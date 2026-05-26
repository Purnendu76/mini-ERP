import { create } from "zustand";
import { useAuditStore } from "./auditStore";
import { axiosClient } from "@/api/axiosClient";
import type {
  Invoice,
  InvoiceInput,
  InvoiceItem,
} from "@/types/invoice.types";

type InvoiceStore = {
  invoices: Invoice[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchInvoices: (force?: boolean) => Promise<void>;
  addInvoice: (invoice: InvoiceInput) => Promise<boolean>;
  updateInvoice: (id: string, invoice: InvoiceInput) => Promise<boolean>;
  deleteInvoice: (id: string) => Promise<boolean>;
  getInvoiceById: (id: string) => Invoice | undefined;
  markInvoiceAsPaid: (id: string) => Promise<boolean>;
  clearInvoices: () => void;
};

function buildInvoiceData(input: InvoiceInput) {
  const items: InvoiceItem[] = input.items.map((item) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    return {
      itemName: item.itemName,
      quantity,
      price,
      total: quantity * price,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxRate = Number(input.taxRate);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;

  return {
    ...input,
    taxRate,
    items,
    subtotal,
    tax,
    total,
  };
}

let activeFetchPromise: Promise<void> | null = null;

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  isFetched: false,
  isLoading: false,
  error: null,

  fetchInvoices: async (force = false) => {
    // Deduplicate concurrent requests
    if (activeFetchPromise) return activeFetchPromise;
    if (get().isFetched && !force) return;

    activeFetchPromise = (async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await axiosClient.get("/invoices");
        if (response.status === 200) {
          set({
            invoices: response.data,
            isFetched: true,
            isLoading: false,
          });
        }
      } catch (err) {
        set({
          isLoading: false,
          error: err instanceof Error ? err.message : "Failed to fetch invoices",
        });
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  addInvoice: async (invoice) => {
    try {
      const payload = buildInvoiceData(invoice);
      const response = await axiosClient.post("/invoices", payload);
      if (response.status === 201) {
        const newInvoice = response.data;
        set((state) => ({ invoices: [newInvoice, ...state.invoices] }));

        useAuditStore.getState().addLog({
          action: "CREATE",
          entity: "INVOICE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Created Invoice: ${newInvoice.invoiceNumber}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  updateInvoice: async (id, updatedInvoice) => {
    try {
      const payload = buildInvoiceData(updatedInvoice);
      const response = await axiosClient.put(`/invoices/${id}`, payload);
      if (response.status === 200) {
        const updated = response.data;
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        }));

        useAuditStore.getState().addLog({
          action: "UPDATE",
          entity: "INVOICE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Updated Invoice: ${payload.invoiceNumber}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteInvoice: async (id) => {
    try {
      const targetInvoice = get().invoices.find((i) => i.id === id);
      const response = await axiosClient.delete(`/invoices/${id}`);
      if (response.status === 200) {
        set((state) => ({
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));

        if (targetInvoice) {
          useAuditStore.getState().addLog({
            action: "DELETE",
            entity: "INVOICE",
            userName: "System Admin",
            userEmail: "admin@example.com",
            ipAddress: "127.0.0.1",
            details: `Deleted Invoice: ${targetInvoice.invoiceNumber}`,
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  getInvoiceById: (id) => {
    return get().invoices.find((invoice) => invoice.id === id);
  },

  markInvoiceAsPaid: async (id) => {
    try {
      const target = get().invoices.find((i) => i.id === id);
      if (!target) return false;

      const response = await axiosClient.put(`/invoices/${id}`, {
        ...target,
        status: "Paid",
      });

      if (response.status === 200) {
        const updated = response.data;
        set((state) => ({
          invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        }));

        useAuditStore.getState().addLog({
          action: "PAYMENT",
          entity: "INVOICE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Marked Invoice ${target.invoiceNumber} as Paid`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  clearInvoices: () => {
    set({ invoices: [] });
  },
}));