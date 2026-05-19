import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  Download,
  FileText,
  IndianRupee,
  PackageSearch,
  ReceiptText,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

import { useInvoiceStore } from "@/store/invoiceStore";
import { useExpenseStore } from "@/store/expenseStore";
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";
import { useAuditStore } from "@/store/auditStore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dynamic data will be generated inside the component using useMemo

// Activity data will be generated inside the component from Audit logs

// KPI data generated inside component

const revenueChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#2563eb",
  },
  expense: {
    label: "Expenses",
    color: "#f59e0b",
  },
} satisfies ChartConfig;

const productChartConfig = {
  stock: {
    label: "Stock",
    color: "#2563eb",
  },
} satisfies ChartConfig;

const invoiceChartConfig = {
  value: {
    label: "Invoice Status",
  },
} satisfies ChartConfig;

export default function AdminDashboard() {
  const { invoices } = useInvoiceStore();
  const { expenses } = useExpenseStore();
  const { products } = useProductStore();
  const { users } = useUserStore();
  const { logs } = useAuditStore();

  const [period, setPeriod] = useState("monthly");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [invoiceStatus, setInvoiceStatus] = useState("all");

  const revenueData = useMemo(() => {
    const months = Array.from({ length: 7 }, (_, i) => {
      const date = subMonths(new Date(), 6 - i);
      return {
        month: format(date, "MMM"),
        date,
        revenue: 0,
        expense: 0,
      };
    });

    months.forEach((m) => {
      const start = startOfMonth(m.date);
      const end = endOfMonth(m.date);

      invoices.forEach((inv) => {
        const invDate = new Date(inv.invoiceDate);
        if (isWithinInterval(invDate, { start, end })) {
          m.revenue += inv.total;
        }
      });

      expenses.forEach((exp) => {
        const expDate = new Date(exp.expenseDate);
        if (isWithinInterval(expDate, { start, end })) {
          m.expense += exp.amount;
        }
      });
    });

    return months;
  }, [invoices, expenses]);

  const productStockData = useMemo(() => {
    const categories: Record<string, number> = {};
    products.forEach((p) => {
      categories[p.category] = (categories[p.category] || 0) + p.stock;
    });

    return Object.entries(categories)
      .map(([category, stock]) => ({ category, stock }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 5);
  }, [products]);

  const invoiceStatusData = useMemo(() => {
    const total = invoices.length;
    if (total === 0) return [
      { name: "Paid", value: 0, fill: "#2563eb" },
      { name: "Pending", value: 0, fill: "#f59e0b" },
      { name: "Overdue", value: 0, fill: "#ef4444" },
      { name: "Cancelled", value: 0, fill: "#64748b" },
    ];

    const counts = {
      Paid: invoices.filter((i) => i.status === "Paid").length,
      Pending: invoices.filter((i) => i.status === "Pending").length,
      Overdue: invoices.filter((i) => i.status === "Overdue").length,
      Cancelled: invoices.filter((i) => i.status === "Cancelled").length,
    };

    return [
      { name: "Paid", value: Math.round((counts.Paid / total) * 100), fill: "#2563eb" },
      { name: "Pending", value: Math.round((counts.Pending / total) * 100), fill: "#f59e0b" },
      { name: "Overdue", value: Math.round((counts.Overdue / total) * 100), fill: "#ef4444" },
      { name: "Cancelled", value: Math.round((counts.Cancelled / total) * 100), fill: "#64748b" },
    ];
  }, [invoices]);

  const recentInvoicesData = useMemo(() => {
    const data = invoices.slice(0, 5).map(inv => ({
      invoice: inv.invoiceNumber,
      customer: inv.customerName,
      amount: `₹${inv.total.toLocaleString()}`,
      status: inv.status,
      date: format(new Date(inv.invoiceDate), "dd MMM yyyy"),
    }));

    if (invoiceStatus === "all") return data;
    return data.filter(inv => inv.status.toLowerCase() === invoiceStatus);
  }, [invoices, invoiceStatus]);

  const kpiCards = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    const formatValue = (val: number) => {
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
      return `₹${val}`;
    };

    return [
      {
        title: "Total Users",
        value: users.length.toString(),
        change: "+0%",
        trend: "up",
        description: "Active system users",
        icon: Users,
        gradient: "from-blue-600 to-indigo-600",
      },
      {
        title: "Total Products",
        value: products.length.toString(),
        change: "+0%",
        trend: "up",
        description: "Inventory items",
        icon: Boxes,
        gradient: "from-emerald-600 to-teal-600",
      },
      {
        title: "Total Revenue",
        value: formatValue(totalRevenue),
        change: "+0%",
        trend: "up",
        description: "All-time revenue",
        icon: IndianRupee,
        gradient: "from-violet-600 to-purple-600",
      },
      {
        title: "Total Expenses",
        value: formatValue(totalExpenses),
        change: "+0%",
        trend: "down",
        description: "All-time expenses",
        icon: ReceiptText,
        gradient: "from-orange-500 to-amber-500",
      },
    ];
  }, [users, products, invoices, expenses]);

  const healthMetrics = useMemo(() => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const revenueTarget = 1000000; // 10L Target
    const revenueProgress = Math.min(Math.round((totalRevenue / revenueTarget) * 100), 100);

    const inStockProducts = products.filter(p => p.status === "In Stock").length;
    const stockProgress = products.length > 0 ? Math.round((inStockProducts / products.length) * 100) : 0;

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const budget = 500000; // 5L Budget
    const expenseProgress = Math.min(Math.round((totalExpenses / budget) * 100), 100);

    return [
      {
        icon: TrendingUp,
        title: "Revenue Target",
        value: `${revenueProgress}%`,
        progress: revenueProgress,
        description: "Yearly target achieved",
      },
      {
        icon: PackageSearch,
        title: "Stock Health",
        value: `${stockProgress}%`,
        progress: stockProgress,
        description: "Healthy inventory level",
      },
      {
        icon: WalletCards,
        title: "Expense Control",
        value: `${expenseProgress}%`,
        progress: expenseProgress,
        description: "Budget usage tracker",
      },
    ];
  }, [invoices, products, expenses]);

  const activitiesData = useMemo(() => {
    return logs.slice(0, 4).map(log => ({
      title: log.action.charAt(0) + log.action.slice(1).toLowerCase() + " " + log.entity.toLowerCase(),
      description: log.details,
      time: log.timestamp,
    }));
  }, [logs]);

  const filterLabel = useMemo(() => {
    const unit =
      businessUnit === "all" ? "All Business Units" : businessUnit.toUpperCase();

    const status =
      invoiceStatus === "all" ? "All Invoice Status" : invoiceStatus;

    return `${unit} • ${status} • ${period}`;
  }, [businessUnit, invoiceStatus, period]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 py-2 md:py-4">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm"
      >
        <div className="relative p-5 md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-[5rem] bg-blue-50 dark:bg-blue-900/10 hidden sm:block" />
          <div className="absolute right-20 top-12 h-24 w-24 rounded-full bg-indigo-50 dark:bg-indigo-900/10 hidden sm:block" />

          <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40">
                  ERP Overview
                </Badge>
                <span className="text-sm text-slate-500 dark:text-slate-400">{filterLabel}</span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                Monitor users, products, invoices, expenses, revenue, and
                business health from one clean dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={businessUnit} onValueChange={setBusinessUnit}>
                <SelectTrigger className="h-11 w-full rounded-xl sm:w-[180px]">
                  <SelectValue placeholder="Business Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                </SelectContent>
              </Select>

              <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                <SelectTrigger className="h-11 w-full rounded-xl sm:w-[180px]">
                  <SelectValue placeholder="Invoice Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>

              <Button className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <KpiCard {...card} />
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr] min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="min-w-0"
          >
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Revenue vs Expenses</CardTitle>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Monthly financial performance overview.
                  </p>
                </div>

                <Tabs value={period} onValueChange={setPeriod}>
                  <TabsList className="rounded-xl bg-slate-100 dark:bg-slate-800">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                    <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                <ChartContainer
                  config={revenueChartConfig}
                  className="h-[330px] w-full"
                >
                  <AreaChart data={revenueData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient
                        id="fillRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>

                      <linearGradient
                        id="fillExpense"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-expense)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-expense)"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid vertical={false} strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      dataKey="revenue"
                      type="monotone"
                      fill="url(#fillRevenue)"
                      stroke="var(--color-revenue)"
                      strokeWidth={3}
                    />
                    <Area
                      dataKey="expense"
                      type="monotone"
                      fill="url(#fillExpense)"
                      stroke="var(--color-expense)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            className="min-w-0"
          >
            <Card className="h-full rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Invoice Status</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Payment distribution by status.
                </p>
              </CardHeader>

              <CardContent>
                <ChartContainer
                  config={invoiceChartConfig}
                  className="mx-auto h-[260px] w-full"
                >
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={invoiceStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={65}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {invoiceStatusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {invoiceStatusData.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.fill }}
                        />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {item.name}
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                        {item.value}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr] min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="min-w-0"
          >
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Product Stock</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Inventory quantity by category.
                </p>
              </CardHeader>

              <CardContent>
                <ChartContainer
                  config={productChartConfig}
                  className="h-[280px] w-full"
                >
                  <BarChart data={productStockData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="4 4" />
                    <XAxis
                      dataKey="category"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="stock"
                      fill="var(--color-stock)"
                      radius={[10, 10, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="min-w-0"
          >
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Recent Invoices</CardTitle>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Latest customer invoice records.
                  </p>
                </div>

                <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800">
                  View All
                </Button>
              </CardHeader>

              <CardContent>
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                        <TableHead className="text-slate-500 dark:text-slate-400">Invoice</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400">Customer</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-500 dark:text-slate-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {recentInvoicesData.map((invoice) => (
                        <TableRow key={invoice.invoice} className="border-slate-200 dark:border-slate-800">
                          <TableCell className="font-medium text-slate-950 dark:text-slate-50">
                            {invoice.invoice}
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{invoice.customer}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{invoice.amount}</TableCell>
                          <TableCell>
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                          <TableCell className="text-slate-500 dark:text-slate-400">
                            {invoice.date}
                          </TableCell>
                        </TableRow>
                      ))}

                      {recentInvoicesData.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-28 text-center text-slate-500"
                          >
                            No invoices found for selected filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View Card List */}
                <div className="block md:hidden space-y-3">
                  {recentInvoicesData.map((invoice) => (
                    <div
                      key={invoice.invoice}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-950 dark:text-slate-50">
                          {invoice.invoice}
                        </span>
                        <StatusBadge status={invoice.status} />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Customer:</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {invoice.customer}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Amount:</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {invoice.amount}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                        <span>Date:</span>
                        <span>{invoice.date}</span>
                      </div>
                    </div>
                  ))}

                  {recentInvoicesData.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
                      No invoices found for selected filter.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3 min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35 }}
            className="xl:col-span-2 min-w-0"
          >
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Business Health</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick operational progress indicators.
                </p>
              </CardHeader>

              <CardContent className="grid gap-5 md:grid-cols-3">
                {healthMetrics.map((metric, index) => (
                  <HealthMetric
                    key={index}
                    icon={metric.icon}
                    title={metric.title}
                    value={metric.value}
                    progress={metric.progress}
                    description={metric.description}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="min-w-0"
          >
            <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Recent Activity</CardTitle>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Latest system updates.
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {activitiesData.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <CalendarDays className="h-4 w-4" />
                      </div>

                      {index !== activitiesData.length - 1 && (
                        <div className="mt-2 h-full w-px bg-slate-200 dark:bg-slate-800" />
                      )}
                    </div>

                    <div className="pb-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                        {activity.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
                {activitiesData.length === 0 && (
                  <p className="text-center text-sm text-slate-500 py-8">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>
  );
}

type KpiCardProps = {
  title: string;
  value: string;
  change: string;
  trend: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
};

function KpiCard({
  title,
  value,
  change,
  trend,
  description,
  icon: Icon,
  gradient,
}: KpiCardProps) {
  const isUp = trend === "up";

  return (
    <Card className="relative overflow-hidden rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 dark:hover:shadow-slate-950/80">
      <div
        className={`absolute right-0 top-0 h-28 w-28 rounded-bl-[4rem] bg-gradient-to-br ${gradient} opacity-10`}
      />

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={`rounded-2xl bg-gradient-to-br ${gradient} p-3 text-white`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <Badge
            className={
              isUp
                ? "rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                : "rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40"
            }
          >
            {isUp ? (
              <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
            )}
            {change}
          </Badge>
        </div>

        <div className="mt-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {value}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type StatusBadgeProps = {
  status: string;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const classes: Record<string, string> = {
    Paid: "bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
    Pending: "bg-amber-50 text-amber-700 hover:bg-amber-50",
    Overdue: "bg-red-50 text-red-700 hover:bg-red-50",
    Cancelled: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };

  return (
    <Badge className={`rounded-full ${classes[status] || classes.Cancelled}`}>
      {status}
    </Badge>
  );
}

type HealthMetricProps = {
  icon: React.ElementType;
  title: string;
  value: string;
  progress: number;
  description: string;
};

function HealthMetric({
  icon: Icon,
  title,
  value,
  progress,
  description,
}: HealthMetricProps) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-5">
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-white dark:bg-card p-3 text-blue-600 dark:text-blue-400 shadow-sm border dark:border-slate-800">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{value}</span>
      </div>

      <div className="mt-5">
        <p className="font-medium text-slate-950 dark:text-slate-100">{title}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </div>

      <Progress value={progress} className="mt-5 h-2 bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}