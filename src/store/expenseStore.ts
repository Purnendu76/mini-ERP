import { create } from "zustand";
import { useAuditStore } from "./auditStore";
import { axiosClient } from "@/api/axiosClient";
import type { Expense, ExpenseInput } from "@/types/Expense.types";

type ExpenseStore = {
  expenses: Expense[];
  isFetched: boolean;
  isLoading: boolean;
  error: string | null;

  fetchExpenses: (force?: boolean) => Promise<void>;
  addExpense: (expense: ExpenseInput) => Promise<boolean>;
  updateExpense: (id: string, expense: ExpenseInput) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  getExpenseById: (id: string) => Expense | undefined;
};

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isFetched: false,
  isLoading: false,
  error: null,

  fetchExpenses: async (force = false) => {
    if (get().isFetched && !force) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axiosClient.get("/expenses");
      if (response.status === 200) {
        set({
          expenses: response.data,
          isFetched: true,
          isLoading: false,
        });
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : "Failed to fetch expenses",
      });
    }
  },

  addExpense: async (expense) => {
    try {
      const response = await axiosClient.post("/expenses", expense);
      if (response.status === 201) {
        const newExpense = response.data;
        set((state) => ({ expenses: [newExpense, ...state.expenses] }));

        useAuditStore.getState().addLog({
          action: "CREATE",
          entity: "EXPENSE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Added Expense: ${expense.title || expense.category}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  updateExpense: async (id, updatedExpense) => {
    try {
      const response = await axiosClient.put(`/expenses/${id}`, updatedExpense);
      if (response.status === 200) {
        const updated = response.data;
        set((state) => ({
          expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
        }));

        useAuditStore.getState().addLog({
          action: "UPDATE",
          entity: "EXPENSE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Updated Expense: ${updatedExpense.title || updatedExpense.category}`,
        });

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  deleteExpense: async (id) => {
    try {
      const targetExpense = get().expenses.find((e) => e.id === id);
      const response = await axiosClient.delete(`/expenses/${id}`);
      if (response.status === 200) {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));

        if (targetExpense) {
          useAuditStore.getState().addLog({
            action: "DELETE",
            entity: "EXPENSE",
            userName: "System Admin",
            userEmail: "admin@example.com",
            ipAddress: "127.0.0.1",
            details: `Deleted Expense: ${targetExpense.title || targetExpense.category}`,
          });
        }

        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },

  getExpenseById: (id) => {
    return get().expenses.find((expense) => expense.id === id);
  },
}));