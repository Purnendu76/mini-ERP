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
  resetExpenseFetch: () => void;
};

let activeFetchPromise: Promise<void> | null = null;

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  isFetched: false,
  isLoading: false,
  error: null,

  fetchExpenses: async (force = false) => {
    const { isFetched, isLoading } = get();

    /**
     * Prevent duplicate API calls.
     *
     * This fixes:
     * 1. React StrictMode double useEffect call
     * 2. Same page/component calling fetch twice
     * 3. Dashboard already pre-filling expense store
     */
    if (activeFetchPromise) {
      return activeFetchPromise;
    }

    if ((isFetched || isLoading) && !force) {
      return;
    }

    activeFetchPromise = (async () => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const response = await axiosClient.get("/expenses");

        if (response.status === 200) {
          set({
            expenses: response.data,
            isFetched: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        set({
          isLoading: false,
          error:
            err instanceof Error
              ? err.message
              : "Failed to fetch expenses",
        });
      } finally {
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },

  addExpense: async (expense) => {
    try {
      const response = await axiosClient.post("/expenses", expense);

      if (response.status === 201) {
        const newExpense = response.data;

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          isFetched: true,
          isLoading: false,
          error: null,
        }));

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
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to add expense",
      });

      return false;
    }
  },

  updateExpense: async (id, updatedExpense) => {
    try {
      const response = await axiosClient.put(`/expenses/${id}`, updatedExpense);

      if (response.status === 200) {
        const updated = response.data;

        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id ? updated : expense
          ),
          isFetched: true,
          isLoading: false,
          error: null,
        }));

        useAuditStore.getState().addLog({
          action: "UPDATE",
          entity: "EXPENSE",
          userName: "System Admin",
          userEmail: "admin@example.com",
          ipAddress: "127.0.0.1",
          details: `Updated Expense: ${
            updatedExpense.title || updatedExpense.category
          }`,
        });

        return true;
      }

      return false;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to update expense",
      });

      return false;
    }
  },

  deleteExpense: async (id) => {
    try {
      const targetExpense = get().expenses.find(
        (expense) => expense.id === id
      );

      const response = await axiosClient.delete(`/expenses/${id}`);

      if (response.status === 200) {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
          isFetched: true,
          isLoading: false,
          error: null,
        }));

        if (targetExpense) {
          useAuditStore.getState().addLog({
            action: "DELETE",
            entity: "EXPENSE",
            userName: "System Admin",
            userEmail: "admin@example.com",
            ipAddress: "127.0.0.1",
            details: `Deleted Expense: ${
              targetExpense.title || targetExpense.category
            }`,
          });
        }

        return true;
      }

      return false;
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : "Failed to delete expense",
      });

      return false;
    }
  },

  getExpenseById: (id) => {
    return get().expenses.find((expense) => expense.id === id);
  },

  resetExpenseFetch: () => {
    activeFetchPromise = null;

    set({
      isFetched: false,
      isLoading: false,
      error: null,
    });
  },
}));