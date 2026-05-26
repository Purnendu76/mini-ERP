import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ImportExportActions } from "@/components/ImportExportActions";
import {
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Calendar as CalendarIcon,
  Boxes,
  ImageIcon,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Download,
  Upload,
  Loader2,
} from "lucide-react";

import { useProductStore } from "@/store/productStore";
import { useAuthStore } from "@/store/authStore";
import { canPerformAction } from "@/config/permissions";
import type { Product, ProductStatus } from "@/types/product.types";
import { ImageUpload } from "@/components/ImageUpload";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  stock: z.coerce.number().min(0, "Stock must be zero or more"),
  status: z.enum(["In Stock", "Low Stock", "Out of Stock"], {
    message: "Status is required",
  }),
  image: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const categories = [
  "Electronics",
  "Office Supplies",
  "Software",
  "Hardware",
  "Utilities",
  "Marketing",
];

const defaultFormValues: ProductFormValues = {
  name: "",
  sku: "",
  category: "",
  price: 0,
  stock: 0,
  status: "In Stock",
  image: "",
};

export default function Products() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const rolePrefix = currentUser?.role.toLowerCase() || "admin";
  const canCreate = currentUser
    ? canPerformAction(currentUser.role, "create", "products")
    : false;
  const canEdit = currentUser
    ? canPerformAction(currentUser.role, "edit", "products")
    : false;
  const canDelete = currentUser
    ? canPerformAction(currentUser.role, "delete", "products")
    : false;

  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } =
    useProductStore();

  useEffect(() => {
    fetchProducts(true);
  }, []);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const pageSize = 5;

  const { register, control, handleSubmit, reset, setValue, watch, formState } =
    useForm<any>({
      resolver: zodResolver(productSchema),
      defaultValues: defaultFormValues,
    });
  const errors = formState.errors as any;
  const { isSubmitting } = formState;

  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (search.trim()) {
      const value = search.toLowerCase();

      data = data.filter(
        (product) =>
          product.name.toLowerCase().includes(value) ||
          product.sku.toLowerCase().includes(value),
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((product) => product.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((product) => product.status === statusFilter);
    }

    if (dateRange?.from) {
      data = data.filter((product) => {
        const prodDate = parseISO(product.createdAt);
        const start = startOfDay(dateRange.from!);
        const end = dateRange.to
          ? endOfDay(dateRange.to)
          : endOfDay(dateRange.from!);
        return isWithinInterval(prodDate, { start, end });
      });
    }

    if (sortBy === "price-asc") {
      data.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-desc") {
      data.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "stock-asc") {
      data.sort((a, b) => a.stock - b.stock);
    }

    if (sortBy === "stock-desc") {
      data.sort((a, b) => b.stock - a.stock);
    }

    if (sortBy === "newest") {
      data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    if (sortBy === "oldest") {
      data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return data;
  }, [products, search, categoryFilter, statusFilter, dateRange, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page]);

  const openAddProductForm = () => {
    setEditingProduct(null);
    reset(defaultFormValues);
    setIsFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image || "",
    });
    setIsFormOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    // Artificial delay for loading feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editingProduct) {
      updateProduct(editingProduct.id, values);
      toast.success("Product updated successfully");
    } else {
      addProduct(values);
      toast.success("Product created successfully");
    }

    setIsFormOpen(false);
    setEditingProduct(null);
    reset(defaultFormValues);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    // Artificial delay for loading feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    deleteProduct(productToDelete.id);

    setIsDeleting(false);
    toast.success("Product deleted successfully");
    setProductToDelete(null);
  };

  const getProductsExportData = () => {
    return products.length > 0
      ? products.map((p) => ({
          Name: p.name,
          SKU: p.sku,
          Category: p.category,
          Price: p.price,
          Stock: p.stock,
          Status: p.status,
        }))
      : [
          {
            Name: "",
            SKU: "",
            Category: "",
            Price: 0,
            Stock: 0,
            Status: "In Stock",
          },
        ];
  };

  const handleImportProducts = async (json: any[]) => {
    const importPromises: Promise<boolean>[] = [];
    json.forEach((item) => {
      const name = item.name || item.Name;
      const sku = item.sku || item.SKU;
      const category = item.category || item.Category;
      const priceRaw = item.price !== undefined ? item.price : item.Price;
      const stockRaw = item.stock !== undefined ? item.stock : item.Stock;
      const status = item.status || item.Status;

      if (name && sku && category && priceRaw !== undefined) {
        importPromises.push(
          addProduct({
            name: String(name),
            sku: String(sku),
            category: String(category),
            price: Number(priceRaw),
            stock: Number(stockRaw || 0),
            status: (status as any) || "In Stock",
          })
        );
      }
    });

    const results = await Promise.all(importPromises);
    const importedCount = results.filter(Boolean).length;

    if (importedCount > 0) {
      toast.success(`Successfully imported ${importedCount} products`);
    } else {
      toast.error("No products were successfully imported. Please verify data format.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-5 lg:p-6">
        <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500/15 border-none">
                  Inventory
                </Badge>
                <span className="text-xs font-medium text-muted-foreground/70">
                  Products Management
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Products
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage product inventory, stock status, price, SKU, and
                category.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ImportExportActions
                exportData={getProductsExportData}
                exportFileName="products_inventory.xlsx"
                sheetName="Products"
                onImport={handleImportProducts}
                showImport={canCreate}
              />

              {canCreate && (
                <Button
                  type="button"
                  onClick={openAddProductForm}
                  className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Products"
            value={products.length}
            description="All inventory items"
            icon={Boxes}
          />
          <SummaryCard
            title="Low Stock"
            value={
              products.filter((item) => item.status === "Low Stock").length
            }
            description="Needs attention"
            icon={Package}
          />
          <SummaryCard
            title="Out of Stock"
            value={
              products.filter((item) => item.status === "Out of Stock").length
            }
            description="Unavailable products"
            icon={ImageIcon}
          />
        </section>

        <Card className="rounded-3xl border-border shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <CardTitle className="text-xl">Product Inventory</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search, filter, sort, and manage products.
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

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search by product name or SKU..."
                  className="h-10 rounded-xl pl-9"
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-10 justify-start text-left font-normal rounded-xl border-border bg-card",
                      !dateRange && "text-muted-foreground",
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
                  {categories.map((category) => (
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
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="In Stock">In Stock</SelectItem>
                  <SelectItem value="Low Stock">Low Stock</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

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
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="stock-asc">Stock: Low to High</SelectItem>
                  <SelectItem value="stock-desc">Stock: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-2xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="w-[70px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full rounded-xl object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5" />
                            )}
                          </div>

                          <div
                            className="cursor-pointer group/link"
                            onClick={() =>
                              navigate(`/${rolePrefix}/products/${product.id}`)
                            }
                          >
                            <p className="font-bold text-blue-600 dark:text-blue-400 group-hover/link:underline">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">
                              ID: {product.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-muted-foreground">
                        {product.sku}
                      </TableCell>

                      <TableCell>{product.category}</TableCell>

                      <TableCell>{formatCurrency(product.price)}</TableCell>

                      <TableCell>{product.stock}</TableCell>

                      <TableCell>
                        <StatusBadge status={product.status} />
                      </TableCell>

                      <TableCell className="text-muted-foreground">
                        {product.createdAt}
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
                              onClick={() =>
                                navigate(
                                  `/${rolePrefix}/products/${product.id}`,
                                )
                              }
                            >
                              <Boxes className="mr-2 h-4 w-4" />
                              Full Details
                            </DropdownMenuItem>

                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => openEditProductForm(product)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}

                            {canDelete && (
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setProductToDelete(product)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                          <p className="font-medium text-foreground">
                            No products found
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Try changing your filters or create a new product.
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
                  {paginatedProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                products
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
        <DialogContent className="max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add Product"}
            </DialogTitle>
            <DialogDescription>
              Fill the product details according to your inventory data.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Product Name" error={errors.name?.message}>
                <Input
                  placeholder="Enter product name"
                  className="h-10 rounded-xl"
                  {...register("name")}
                />
              </FormField>

              <FormField label="SKU" error={errors.sku?.message}>
                <Input
                  placeholder="Enter SKU"
                  className="h-10 rounded-xl"
                  {...register("sku")}
                />
              </FormField>

              <FormField label="Category" error={errors.category?.message}>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Status" error={errors.status?.message}>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-10 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">
                          Out of Stock
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField label="Price" error={errors.price?.message}>
                <Input
                  type="number"
                  placeholder="Enter price"
                  className="h-10 rounded-xl"
                  {...register("price")}
                />
              </FormField>

              <FormField label="Stock Quantity" error={errors.stock?.message}>
                <Input
                  type="number"
                  placeholder="Enter stock quantity"
                  className="h-10 rounded-xl"
                  {...register("stock")}
                />
              </FormField>
            </div>

            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload
                  value={field.value || ""}
                  onChange={field.onChange}
                  folder="products"
                  label="Upload Product Image"
                  description="Click here to select a file from your computer (JPG, PNG)."
                  variant="square"
                />
              )}
            />

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
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={() => setProductToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove{" "}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>{" "}
              from your product list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
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
                "Delete Product"
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
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
};

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <Card className="rounded-3xl border-border shadow-sm">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-foreground">
            {value}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ProductStatus }) {
  const classes: Record<ProductStatus, string> = {
    "In Stock":
      "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/15 border-none",
    "Low Stock":
      "bg-amber-500/10 text-amber-500 hover:bg-amber-500/15 border-none",
    "Out of Stock":
      "bg-red-500/10 text-red-500 hover:bg-red-500/15 border-none",
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
