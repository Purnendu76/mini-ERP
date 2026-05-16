import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuditStore } from "./auditStore";

import type { Expense, ExpenseInput } from "@/types/Expense.types";

type ExpenseStore = {
  expenses: Expense[];

  addExpense: (expense: ExpenseInput) => void;
  updateExpense: (id: string, expense: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  getExpenseById: (id: string) => Expense | undefined;
};

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expense) =>
        set((state) => {
          const newExpense = {
            id: crypto.randomUUID(),
            ...expense,
            createdAt: new Date().toISOString(),
          };

          useAuditStore.getState().addLog({
            action: "CREATE",
            entity: "EXPENSE",
            user: { name: "System Admin", email: "admin@invoice-system.local" },
            ipAddress: "127.0.0.1",
            details: `Added Expense: ${expense.expenseDate}`
          });

          return { expenses: [newExpense, ...state.expenses] };
        }),

      updateExpense: (id, updatedExpense) =>
        set((state) => {
          const expense = state.expenses.find(e => e.id === id);
          if (expense) {
            useAuditStore.getState().addLog({
              action: "UPDATE",
              entity: "EXPENSE",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Updated Expense: ${expense.expenseDate}`
            });
          }
          return {
            expenses: state.expenses.map((expense) =>
              expense.id === id
                ? {
                    ...expense,
                    ...updatedExpense,
                  }
                : expense
            ),
          };
        }),

      deleteExpense: (id) =>
        set((state) => {
          const expense = state.expenses.find(e => e.id === id);
          if (expense) {
            useAuditStore.getState().addLog({
              action: "DELETE",
              entity: "EXPENSE",
              user: { name: "System Admin", email: "admin@invoice-system.local" },
              ipAddress: "127.0.0.1",
              details: `Deleted Expense: ${expense.expenseDate}`
            });
          }
          return {
            expenses: state.expenses.filter((expense) => expense.id !== id),
          };
        }),

      getExpenseById: (id) => {
        return get().expenses.find((expense) => expense.id === id);
      },
    }),
    {
      name: "erp_expenses",
    }
  )
);