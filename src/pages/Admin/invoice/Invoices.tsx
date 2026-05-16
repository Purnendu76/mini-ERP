import {  useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Eye,
  FileText,
  IndianRupee,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  X,
  Upload,
  Download,
  Loader2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useInvoiceStore } from "@/store/invoiceStore";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceItem,
  
} from "@/types/invoice.types";

const invoiceStatuses: InvoiceStatus[] = [
  "Paid",
  "Pending",
  "Overdue",
  "Cancelled",
];

const invoiceItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  price: z.coerce.number().positive("Price must be greater than 0"),
});

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z
    .string()
    .min(1, "Customer email is required")
    .email("Enter a valid email address"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  taxRate: z.coerce.number().min(0, "Tax cannot be negative"),
  status: z.enum(["Paid", "Pending", "Overdue", "Cancelled"]),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const defaultFormValues: InvoiceFormValues = {
  invoiceNumber: "",
  customerName: "",
  customerEmail: "",
  invoiceDate: "",
  dueDate: "",
  taxRate: 18,
  status: "Pending",
  items: [
    {
      itemName: "",
      quantity: 1,
      price: 0,
    },
  ],
};



export default function Invoices() {
  const navigate = useNavigate();
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useInvoiceStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deleteInvoiceItem, setDeleteInvoiceItem] = useState<Invoice | null>(
    null
  );
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pageSize = 6;

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: defaultFormValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTaxRate = Number(watch("taxRate") || 0);

  const formSubtotal = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const quantity = Number(item.quantity || 0);
      const price = Number(item.price || 0);

      return sum + quantity * price;
    }, 0);
  }, [watchedItems]);

  const formTax = formSubtotal * (watchedTaxRate / 100);
  const formTotal = formSubtotal + formTax;

  const filteredInvoices = useMemo(() => {
    let data = [...invoices];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(value) ||
          invoice.customerName.toLowerCase().includes(value) ||
          invoice.customerEmail.toLowerCase().includes(value)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((invoice) => invoice.status === statusFilter);
    }

    if (dateRange?.from) {
      data = data.filter((invoice) => {
        const invDate = new Date(invoice.invoiceDate);
        const start = startOfDay(dateRange.from!);
        const end = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from!);
        return isWithinInterval(invDate, { start, end });
      });
    }

    if (sortBy === "amount-asc") {
      data.sort((a, b) => a.total - b.total);
    }

    if (sortBy === "amount-desc") {
      data.sort((a, b) => b.total - a.total);
    }

    if (sortBy === "date-asc") {
      data.sort(
        (a, b) =>
          new Date(a.invoiceDate).getTime() -
          new Date(b.invoiceDate).getTime()
      );
    }

    if (sortBy === "date-desc") {
      data.sort(
        (a, b) =>
          new Date(b.invoiceDate).getTime() -
          new Date(a.invoiceDate).getTime()
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
  }, [invoices, search, statusFilter, dateRange, sortBy]);

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;

  const paginatedInvoices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, page]);

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );

  const paidCount = invoices.filter((item) => item.status === "Paid").length;
  const pendingCount = invoices.filter(
    (item) => item.status === "Pending"
  ).length;

  const openAddInvoiceForm = () => {
    setEditingInvoice(null);
    reset({
      ...defaultFormValues,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: new Date().toISOString().slice(0, 10),
    });
    setIsFormOpen(true);
  };

  const openEditInvoiceForm = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    reset({
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      taxRate: invoice.taxRate,
      status: invoice.status,
      items: invoice.items.map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    // Artificial delay for loading feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const normalizedItems: InvoiceItem[] = values.items.map((item) => ({
      itemName: item.itemName,
      quantity: Number(item.quantity),
      price: Number(item.price),
      total: Number(item.quantity) * Number(item.price),
    }));

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (Number(values.taxRate) / 100);
    const total = subtotal + tax;

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, {
        invoiceNumber: values.invoiceNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        items: normalizedItems,
        taxRate: Number(values.taxRate),
        status: values.status,
      });

      toast.success("Invoice updated successfully");
    } else {
      addInvoice({
        invoiceNumber: values.invoiceNumber,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate,
        items: normalizedItems,
        taxRate: Number(values.taxRate),
        status: values.status,
      });
      toast.success("Invoice created successfully");
    }

    setIsFormOpen(false);
    setEditingInvoice(null);
    reset(defaultFormValues);
  };

  const confirmDelete = async () => {
    if (!deleteInvoiceItem) return;

    setIsDeleting(true);
    // Artificial delay for loading feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    deleteInvoice(deleteInvoiceItem.id);

    setIsDeleting(false);
    toast.success("Invoice deleted successfully");
    setDeleteInvoiceItem(null);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDateRange(undefined);
    setSortBy("newest");
    setPage(1);
  };

  const exportToExcel = () => {
    const dataToExport = invoices.length > 0 ? invoices.map(inv => ({
      ...inv,
      items: JSON.stringify(inv.items)
    })) : [
      {
        invoiceNumber: "",
        customerName: "",
        customerEmail: "",
        invoiceDate: "",
        dueDate: "",
        status: "Pending",
        taxRate: 18,
        items: "[]",
        createdAt: new Date().toISOString()
      }
    ];

    setIsExporting(true);
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    
    setTimeout(() => {
      XLSX.writeFile(workbook, "invoices_records.xlsx");
      setIsExporting(false);
      toast.success("Invoices exported successfully");
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
          if (item.invoiceNumber && item.customerName) {
            let parsedItems = [];
            try {
              parsedItems = item.items ? JSON.parse(item.items) : [];
            } catch (pErr) {
              console.warn("Could not parse items for invoice", item.invoiceNumber);
            }

            addInvoice({
              invoiceNumber: String(item.invoiceNumber),
              customerName: String(item.customerName),
              customerEmail: String(item.customerEmail || ""),
              invoiceDate: String(item.invoiceDate || new Date().toISOString().split('T')[0]),
              dueDate: String(item.dueDate || new Date().toISOString().split('T')[0]),
              status: (item.status as any) || "Pending",
              taxRate: Number(item.taxRate || 18),
              items: parsedItems,
            });
            importedCount++;
          }
        });

        setTimeout(() => {
          setIsImporting(false);
          toast.success(`Successfully imported ${importedCount} invoices`);
        }, 1000);
        event.target.value = "";
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1600px] space-y-5 p-4 sm:p-5 lg:p-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/10 dark:text-blue-400">
                  Invoices
                </Badge>
                <span className="text-xs font-medium text-muted-foreground">
                  Billing & Payment Records
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Invoices
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Create invoices, calculate tax, track status, and manage
                customer billing records.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                id="invoice-import"
                className="hidden"
                onChange={importFromExcel}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isImporting}
                className="h-10 rounded-xl border-blue-200 bg-blue-50/50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400"
                onClick={() => document.getElementById("invoice-import")?.click()}
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
                onClick={openAddInvoiceForm}
                className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Invoice
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Invoice Amount"
            value={formatCurrency(totalInvoiceAmount)}
            description="Overall invoice value"
            icon={IndianRupee}
            color="blue"
          />

          <SummaryCard
            title="Paid Invoices"
            value={paidCount}
            description="Payment completed"
            icon={FileText}
            color="emerald"
          />

          <SummaryCard
            title="Pending Invoices"
            value={pendingCount}
            description="Waiting for payment"
            icon={CalendarDays}
            color="amber"
          />
        </section>

        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-xl">Invoice Records</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, filter, date range, sort, and manage invoices.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="h-10 rounded-xl"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.75fr_0.75fr_0.75fr_0.75fr]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search invoice number, customer, email..."
                  className="h-10 rounded-xl pl-9"
                />
              </div>

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
                  {invoiceStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
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
                    initialFocus
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
                  <SelectItem value="amount-desc">
                    Amount: High to Low
                  </SelectItem>
                  <SelectItem value="date-asc">Date: Old to New</SelectItem>
                  <SelectItem value="date-desc">Date: New to Old</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 hover:bg-muted/60">
                    <TableHead>Invoice</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Invoice Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[70px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div 
                            className="cursor-pointer group/link"
                            onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                          >
                            <p className="font-bold text-blue-600 dark:text-blue-400 group-hover/link:underline">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              ID: {invoice.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {invoice.customerEmail}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.invoiceDate)}
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </TableCell>

                      <TableCell>{formatCurrency(invoice.subtotal)}</TableCell>

                      <TableCell>{formatCurrency(invoice.tax)}</TableCell>

                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.total)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={invoice.status} />
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

                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => setPreviewInvoice(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/invoices/${invoice.id}`)}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Full Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => openEditInvoiceForm(invoice)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              onClick={() => setDeleteInvoiceItem(invoice)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedInvoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <FileText className="h-6 w-6" />
                          </div>
                          <p className="font-medium">No invoices found</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try changing your filters or create a new invoice.
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
                  {paginatedInvoices.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredInvoices.length}
                </span>{" "}
                invoices
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
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "Add Invoice"}
            </DialogTitle>
            <DialogDescription>
              Create invoice, add multiple items, and calculate tax/total
              automatically.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Invoice Number"
                error={errors.invoiceNumber?.message}
              >
                <Input
                  placeholder="INV-1001"
                  className="h-10 rounded-xl"
                  {...register("invoiceNumber")}
                />
              </FormField>

              <FormField
                label="Customer Name"
                error={errors.customerName?.message}
              >
                <Input
                  placeholder="Enter customer name"
                  className="h-10 rounded-xl"
                  {...register("customerName")}
                />
              </FormField>

              <FormField
                label="Customer Email"
                error={errors.customerEmail?.message}
              >
                <Input
                  type="email"
                  placeholder="customer@example.com"
                  className="h-10 rounded-xl"
                  {...register("customerEmail")}
                />
              </FormField>

              <FormField
                label="Invoice Status"
                error={errors.status?.message}
              >
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {invoiceStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Invoice Date"
                error={errors.invoiceDate?.message}
              >
                <Controller
                  control={control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start rounded-xl text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </FormField>

              <FormField label="Due Date" error={errors.dueDate?.message}>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-start rounded-xl text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(new Date(field.value), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString())
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
              </FormField>

              <FormField label="Tax Rate (%)" error={errors.taxRate?.message}>
                <Input
                  type="number"
                  className="h-10 rounded-xl"
                  {...register("taxRate")}
                />
              </FormField>
            </div>

            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold">Invoice Items</h3>
                  <p className="text-sm text-muted-foreground">
                    Add one or more invoice items.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({
                      itemName: "",
                      quantity: 1,
                      price: 0,
                    })
                  }
                  className="rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const quantity = Number(watchedItems[index]?.quantity || 0);
                  const price = Number(watchedItems[index]?.price || 0);
                  const itemTotal = quantity * price;

                  return (
                    <div
                      key={field.id}
                      className="grid gap-3 rounded-2xl border border-border bg-card p-3 md:grid-cols-[1.4fr_0.6fr_0.6fr_0.7fr_auto]"
                    >
                      <FormField
                        label="Item Name"
                        error={errors.items?.[index]?.itemName?.message}
                      >
                        <Input
                          placeholder="Item name"
                          className="h-10 rounded-xl"
                          {...register(`items.${index}.itemName`)}
                        />
                      </FormField>

                      <FormField
                        label="Qty"
                        error={errors.items?.[index]?.quantity?.message}
                      >
                        <Input
                          type="number"
                          className="h-10 rounded-xl"
                          {...register(`items.${index}.quantity`)}
                        />
                      </FormField>

                      <FormField
                        label="Price"
                        error={errors.items?.[index]?.price?.message}
                      >
                        <Input
                          type="number"
                          className="h-10 rounded-xl"
                          {...register(`items.${index}.price`)}
                        />
                      </FormField>

                      <div className="space-y-2">
                        <Label>Total</Label>
                        <div className="flex h-10 items-center rounded-xl border border-border bg-muted/40 px-3 text-sm font-medium">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                          className="h-10 w-10 rounded-xl text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TotalBox title="Subtotal" value={formatCurrency(formSubtotal)} />
              <TotalBox
                title={`Tax (${watchedTaxRate || 0}%)`}
                value={formatCurrency(formTax)}
              />
              <TotalBox title="Final Total" value={formatCurrency(formTotal)} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingInvoice
                  ? "Update Invoice"
                  : "Create Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(previewInvoice)}
        onOpenChange={() => setPreviewInvoice(null)}
      >
        <DialogContent className="max-w-3xl rounded-3xl">
          {previewInvoice && (
            <>
              <DialogHeader>
                <DialogTitle>Invoice Preview</DialogTitle>
                <DialogDescription>
                  Clean invoice details preview for {previewInvoice.invoiceNumber}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="grid gap-4 rounded-2xl border border-border bg-muted/30 p-4 md:grid-cols-2">
                  <InfoRow
                    icon={FileText}
                    label="Invoice Number"
                    value={previewInvoice.invoiceNumber}
                  />
                  <InfoRow
                    icon={UserRound}
                    label="Customer"
                    value={previewInvoice.customerName}
                  />
                  <InfoRow
                    icon={Mail}
                    label="Email"
                    value={previewInvoice.customerEmail}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Invoice Date"
                    value={formatDate(previewInvoice.invoiceDate)}
                  />
                  <InfoRow
                    icon={CalendarDays}
                    label="Due Date"
                    value={formatDate(previewInvoice.dueDate)}
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <div className="mt-1">
                      <StatusBadge status={previewInvoice.status} />
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60 hover:bg-muted/60">
                        <TableHead>Item</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {previewInvoice.items.map((item, index) => (
                        <TableRow key={`${item.itemName}-${index}`}>
                          <TableCell>{item.itemName}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.total)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="ml-auto w-full max-w-sm space-y-2 rounded-2xl border border-border bg-card p-4">
                  <AmountRow
                    label="Subtotal"
                    value={formatCurrency(previewInvoice.subtotal)}
                  />
                  <AmountRow
                    label={`Tax (${previewInvoice.taxRate}%)`}
                    value={formatCurrency(previewInvoice.tax)}
                  />
                  <div className="border-t border-border pt-2">
                    <AmountRow
                      label="Total"
                      value={formatCurrency(previewInvoice.total)}
                      strong
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteInvoiceItem)}
        onOpenChange={() => setDeleteInvoiceItem(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove{" "}
              <span className="font-medium text-foreground">
                {deleteInvoiceItem?.invoiceNumber}
              </span>{" "}
              from your invoice list. This cannot be undone.
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
                "Delete Invoice"
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
  children: ReactNode;
};

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
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

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const classes: Record<InvoiceStatus, string> = {
    Paid: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400",
    Pending:
      "bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400",
    Overdue:
      "bg-red-500/10 text-red-700 hover:bg-red-500/10 dark:text-red-400",
    Cancelled:
      "bg-slate-500/10 text-slate-700 hover:bg-slate-500/10 dark:text-slate-300",
  };

  return <Badge className={`rounded-full ${classes[status]}`}>{status}</Badge>;
}

function TotalBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function AmountRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={strong ? "font-semibold" : "text-muted-foreground"}>
        {label}
      </span>
      <span className={strong ? "text-lg font-semibold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}

function generateInvoiceNumber() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${random}`;
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