export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Cancelled";

export type InvoiceItemInput = {
  itemName: string;
  quantity: number;
  price: number;
};

export type InvoiceItem = InvoiceItemInput & {
  total: number;
};

export type InvoiceInput = {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItemInput[];
  taxRate: number;
  status: InvoiceStatus;
};

export type Invoice = Omit<InvoiceInput, "items"> & {
  id: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
};