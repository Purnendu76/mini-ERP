export type ExpenseCategory =
  | "Office Supplies"
  | "Travel"
  | "Food"
  | "Software"
  | "Marketing"
  | "Utilities"
  | "Other";

export type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "Credit Card"
  | "UPI"
  | "Other";

export type ExpenseStatus = "Pending" | "Approved" | "Rejected";

export type Expense = {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: PaymentMethod;
  expenseDate: string;
  submittedBy: string;
  status: ExpenseStatus;
  createdAt: string;
};

export type ExpenseInput = Omit<Expense, "id" | "createdAt">;