import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  MoreHorizontal,
  Pencil,
  Plus,
  ReceiptText,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  WalletCards,
  Calendar as CalendarIcon,
  Download,
  Upload,
  FileSpreadsheet,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { useExpenseStore } from "@/store/expenseStore";
import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  PaymentMethod,
} from "@/types/Expense.types";

const expenseCategories: ExpenseCategory[] = [
  "Office Supplies",
  "Travel",
  "Food",
  "Software",
  "Marketing",
  "Utilities",
  "Other",
];

const paymentMethods: PaymentMethod[] = [
  "Cash",
  "Bank Transfer",
  "Credit Card",
  "UPI",
  "Other",
];

const expenseStatuses: ExpenseStatus[] = ["Pending", "Approved", "Rejected"];

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum([
    "Office Supplies",
    "Travel",
    "Food",
    "Software",
    "Marketing",
    "Utilities",
    "Other",
  ]),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMethod: z.enum([
    "Cash",
    "Bank Transfer",
    "Credit Card",
    "UPI",
    "Other",
  ]),
  expenseDate: z.string().min(1, "Expense date is required"),
  submittedBy: z.string().min(1, "Submitted by is required"),
  status: z.enum(["Pending", "Approved", "Rejected"]),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

const defaultFormValues: ExpenseFormValues = {
  title: "",
  category: "Office Supplies",
  amount: 0,
  paymentMethod: "Cash",
  expenseDate: "",
  submittedBy: "",
  status: "Pending",
};

export default function Expenses() {
  const navigate = useNavigate();
  const { expenses, addExpense, updateExpense, deleteExpense } =
    useExpenseStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [localSubmitting, setLocalSubmitting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteExpenseItem, setDeleteExpenseItem] = useState<Expense | null>(
    null
  );

  const pageSize = 6;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState,
  } = useForm<any>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultFormValues,
  });
  const errors = formState.errors as any;
  const { isSubmitting } = formState;

  const filteredExpenses = useMemo(() => {
    let data = [...expenses];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (expense) =>
          expense.title.toLowerCase().includes(value) ||
          expense.category.toLowerCase().includes(value) ||
          expense.submittedBy.toLowerCase().includes(value) ||
          expense.paymentMethod.toLowerCase().includes(value)
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((expense) => expense.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((expense) => expense.status === statusFilter);
    }

    if (paymentMethodFilter !== "all") {
      data = data.filter(
        (expense) => expense.paymentMethod === paymentMethodFilter
      );
    }

    if (dateRange?.from) {
      data = data.filter((expense) => {
        const expDate = parseISO(expense.expenseDate);
        const start = startOfDay(dateRange.from!);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
        return isWithinInterval(expDate, { start, end });
      });
    }

    if (sortBy === "amount-asc") data.sort((a, b) => a.amount - b.amount);
    if (sortBy === "amount-desc") data.sort((a, b) => b.amount - a.amount);

    if (sortBy === "date-asc") {
      data.sort(
        (a, b) =>
          new Date(a.expenseDate).getTime() -
          new Date(b.expenseDate).getTime()
      );
    }

    if (sortBy === "date-desc") {
      data.sort(
        (a, b) =>
          new Date(b.expenseDate).getTime() -
          new Date(a.expenseDate).getTime()
      );
    }

    if (sortBy === "newest") {
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (sortBy === "oldest") {
      data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return data;
  }, [
    expenses,
    search,
    categoryFilter,
    statusFilter,
    paymentMethodFilter,
    dateRange,
    sortBy,
  ]);

  const totalPages = Math.ceil(filteredExpenses.length / pageSize) || 1;

  const paginatedExpenses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, page]);

  const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = expenses.filter((item) => item.status === "Pending").length;
  const approvedCount = expenses.filter(
    (item) => item.status === "Approved"
  ).length;

  const openAddExpenseForm = () => {
    setEditingExpense(null);
    reset(defaultFormValues);
    setIsFormOpen(true);
  };

  const openEditExpenseForm = (expense: Expense) => {
    setEditingExpense(expense);
    reset({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      paymentMethod: expense.paymentMethod,
      expenseDate: expense.expenseDate,
      submittedBy: expense.submittedBy,
      status: expense.status,
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    // Artificial delay for loading feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingExpense) {
      updateExpense(editingExpense.id, values);
      toast.success("Expense updated successfully");
    } else {
      addExpense(values);
      toast.success("Expense created successfully");
    }

    setIsFormOpen(false);
    setEditingExpense(null);
    reset(defaultFormValues);
  };

  const confirmDelete = async () => {
    if (!deleteExpenseItem) return;

    setIsDeleting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    deleteExpense(deleteExpenseItem.id);

    setIsDeleting(false);
    toast.success("Expense deleted successfully");
    setDeleteExpenseItem(null);
  };

  const exportToExcel = () => {
    const dataToExport = expenses.length > 0 ? expenses : [
      {
        title: "",
        category: "",
        amount: 0,
        paymentMethod: "",
        expenseDate: "",
        submittedBy: "",
        status: "",
        createdAt: ""
      }
    ];

    setIsExporting(true);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    
    setTimeout(() => {
      XLSX.writeFile(workbook, "business_expenses.xlsx");
      setIsExporting(false);
      toast.success("Expenses exported successfully");
    }, 800);
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        let importedCount = 0;
        json.forEach((item) => {
          if (item.title && item.amount !== undefined && item.category) {
            addExpense({
              title: String(item.title),
              category: (item.category as any) || "Other",
              amount: Number(item.amount),
              paymentMethod: (item.paymentMethod as any) || "Cash",
              expenseDate: String(item.expenseDate || new Date().toISOString().split("T")[0]),
              submittedBy: String(item.submittedBy || "Unknown"),
              status: (item.status as any) || "Pending",
            });
            importedCount++;
          }
        });

        setTimeout(() => {
          setIsImporting(false);
          toast.success(`Successfully imported ${importedCount} expenses`);
        }, 1000);
        event.target.value = ""; // Reset input
      } catch (error) {
        setIsImporting(false);
        toast.error("Failed to import excel file");
        console.error(error);
      }
    };
    reader.onerror = () => {
      setIsImporting(false);
      toast.error("Failed to read file");
    };
    reader.readAsBinaryString(file);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setDateRange(undefined);
    setSortBy("newest");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400">
                  Expenses
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Business Expense Tracking
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Expenses
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Track expense amount, category, payment method, approval status,
                and submitted user.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="expense-import"
                className="hidden"
                onChange={importFromExcel}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                className="h-10 rounded-xl border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
                onClick={() => document.getElementById("expense-import")?.click()}
              >
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isImporting ? "Importing..." : "Import"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={isExporting}
                className="h-10 rounded-xl border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/20 dark:text-emerald-400"
                onClick={exportToExcel}
              >
                {isExporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isExporting ? "Exporting..." : "Export"}
              </Button>

              <Button
                type="button"
                onClick={openAddExpenseForm}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Expenses"
            value={formatCurrency(totalAmount)}
            description="Overall submitted amount"
            icon={IndianRupee}
            color="blue"
          />
          <SummaryCard
            title="Pending"
            value={pendingCount}
            description="Waiting for approval"
            icon={ReceiptText}
            color="amber"
          />
          <SummaryCard
            title="Approved"
            value={approvedCount}
            description="Approved expenses"
            icon={WalletCards}
            color="emerald"
          />
        </section>

        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-xl">Expense Records</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, filter, sort, and manage company expenses.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={showFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-10 rounded-xl"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10 rounded-xl"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr] pt-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Search by title, category, submitted by..."
                        className="h-10 rounded-xl pl-9"
                      />
                    </div>

                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => {
                        setCategoryFilter(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {expenseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {expenseStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={paymentMethodFilter}
                      onValueChange={(value) => {
                        setPaymentMethodFilter(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method} value={method}>
                            {method}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 justify-start text-left font-normal rounded-xl border-border bg-card",
                            !dateRange && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                        />
                      </PopoverContent>
                    </Popover>

                    <Select
                      value={sortBy}
                      onValueChange={(value) => {
                        setSortBy(value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="amount-asc">Amount: Low to High</SelectItem>
                        <SelectItem value="amount-desc">Amount: High to Low</SelectItem>
                        <SelectItem value="date-asc">Date: Old to New</SelectItem>
                        <SelectItem value="date-desc">Date: New to Old</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead>Expense</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Expense Date</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="w-[70px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <ReceiptText className="h-5 w-5" />
                          </div>

                          <div 
                            className="cursor-pointer group/link"
                            onClick={() => navigate(`/admin/expenses/${expense.id}`)}
                          >
                            <p className="font-bold text-blue-600 dark:text-blue-400 group-hover/link:underline">
                              {expense.title}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              ID: {expense.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{expense.category}</TableCell>

                      <TableCell className="font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          {expense.paymentMethod}
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(expense.expenseDate)}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserRound className="h-4 w-4 text-muted-foreground" />
                          {expense.submittedBy}
                        </div>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={expense.status} />
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(expense.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/expenses/${expense.id}`)}
                            >
                              <ReceiptText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openEditExpenseForm(expense)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              onClick={() => setDeleteExpenseItem(expense)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <ReceiptText className="h-6 w-6" />
                          </div>
                          <p className="font-medium">No expenses found</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try changing your filters or create a new expense.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {paginatedExpenses.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredExpenses.length}
                </span>{" "}
                expenses
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="h-9 rounded-lg"
                >
                  Previous
                </Button>

                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm">
                  Page {page} of {totalPages}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="h-9 rounded-lg"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-card">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl">
                {editingExpense ? "Edit Expense" : "Add New Expense"}
              </DialogTitle>
              <DialogDescription>
                Fill the details below to track your business expenses.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 pt-2">
              <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                <FormField label="Expense Title" error={errors.title?.message}>
                  <div className="relative">
                    <ReceiptText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      placeholder="Enter expense title"
                      className="h-10 rounded-xl pl-10 bg-muted/20 focus-visible:ring-blue-500/30"
                      {...register("title")}
                    />
                  </div>
                </FormField>

                <FormField label="Submitted By" error={errors.submittedBy?.message}>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      placeholder="Enter submitter name"
                      className="h-10 rounded-xl pl-10 bg-muted/20 focus-visible:ring-blue-500/30"
                      {...register("submittedBy")}
                    />
                  </div>
                </FormField>

                <FormField label="Category" error={errors.category?.message}>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/20 focus:ring-blue-500/30">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField
                  label="Payment Method"
                  error={errors.paymentMethod?.message}
                >
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/20 focus:ring-blue-500/30">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>

                <FormField label="Amount" error={errors.amount?.message}>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-10 rounded-xl pl-10 bg-muted/20 focus-visible:ring-blue-500/30"
                      {...register("amount")}
                    />
                  </div>
                </FormField>

                <FormField label="Expense Date" error={errors.expenseDate?.message}>
                  <Controller
                    control={control}
                    name="expenseDate"
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-10 w-full justify-start rounded-xl bg-muted/20 px-3 text-left font-normal border-input hover:bg-muted/30 focus:ring-blue-500/30",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground/70" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border-border" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date?.toISOString())}
                            className="rounded-2xl"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </FormField>

                <FormField label="Status" error={errors.status?.message}>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-10 rounded-xl bg-muted/20 focus:ring-blue-500/30">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {expenseStatuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
              </div>

              <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-xl px-5"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 rounded-xl bg-blue-600 px-8 font-medium text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingExpense
                    ? "Save Changes"
                    : "Create Expense"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteExpenseItem)}
        onOpenChange={() => setDeleteExpenseItem(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove{" "}
              <span className="font-medium text-foreground">
                {deleteExpenseItem?.title}
              </span>{" "}
              from your expense list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Expense"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-semibold tracking-tight text-foreground/80 pl-1">
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[13px] font-medium text-red-500 pl-1 animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: "blue" | "amber" | "emerald";
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: SummaryCardProps) {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  };

  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-foreground">
            {value}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors[color]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ExpenseStatus }) {
  const classes: Record<ExpenseStatus, string> = {
    Pending:
      "bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400",
    Approved:
      "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400",
    Rejected:
      "bg-red-500/10 text-red-700 hover:bg-red-500/10 dark:text-red-400",
  };

  return <Badge className={`rounded-full ${classes[status]}`}>{status}</Badge>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}