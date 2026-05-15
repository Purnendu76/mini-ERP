import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuditStore } from "./auditStore";

import type {
  Invoice,
  InvoiceInput,
  InvoiceItem,
} from "@/types/invoice.types";

type InvoiceStore = {
  invoices: Invoice[];

  addInvoice: (invoice: InvoiceInput) => void;
  updateInvoice: (id: string, invoice: InvoiceInput) => void;
  deleteInvoice: (id: string) => void;
  getInvoiceById: (id: string) => Invoice | undefined;
  markInvoiceAsPaid: (id: string) => void;
  clearInvoices: () => void;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return String(Date.now());
}

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

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set, get) => ({
      invoices: [],

      addInvoice: (invoice) =>
        set((state) => {
          const newInvoice = {
            id: createId(),
            ...buildInvoiceData(invoice),
            createdAt: new Date().toISOString(),
          };
          
          useAuditStore.getState().addLog({
            action: "CREATE",
            entity: "INVOICE",
            user: { name: "System Admin", email: "admin@invoice-system.local" },
            ipAddress: "127.0.0.1",
            details: `Created Invoice: ${newInvoice.invoiceNumber}`
          });

          return { invoices: [newInvoice, ...state.invoices] };
        }),

      updateInvoice: (id, updatedInvoice) =>
        set((state) => {
          const invoice = state.invoices.find(i => i.id === id);
          if (invoice) {
            useAuditStore.getState().addLog({
              action: "UPDATE",
              entity: "INVOICE",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Updated Invoice: ${invoice.invoiceNumber}`
            });
          }
          return {
            invoices: state.invoices.map((invoice) =>
              invoice.id === id
                ? {
                    ...invoice,
                    ...buildInvoiceData(updatedInvoice),
                  }
                : invoice
            ),
          };
        }),

      deleteInvoice: (id) =>
        set((state) => {
          const invoice = state.invoices.find(i => i.id === id);
          if (invoice) {
            useAuditStore.getState().addLog({
              action: "DELETE",
              entity: "INVOICE",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Deleted Invoice: ${invoice.invoiceNumber}`
            });
          }
          return {
            invoices: state.invoices.filter((invoice) => invoice.id !== id),
          };
        }),

      getInvoiceById: (id) => {
        return get().invoices.find((invoice) => invoice.id === id);
      },

      markInvoiceAsPaid: (id) =>
        set((state) => {
          const invoice = state.invoices.find(i => i.id === id);
          if (invoice) {
            useAuditStore.getState().addLog({
              action: "PAYMENT",
              entity: "INVOICE",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Marked Invoice ${invoice.invoiceNumber} as Paid`
            });
          }
          return {
            invoices: state.invoices.map((invoice) =>
              invoice.id === id
                ? {
                    ...invoice,
                    status: "Paid",
                  }
                : invoice
            ),
          };
        }),

      clearInvoices: () =>
        set({
          invoices: [],
        }),
    }),
    {
      name: "erp_invoices",
    }
  )
);