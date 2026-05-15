import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  BarChart3,
  Building2,
  Eye,
  EyeOff,
  FileText,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    role: "Admin",
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@example.com",
    password: "manager123",
    role: "Manager",
  },
  {
    id: "3",
    name: "Staff User",
    email: "staff@example.com",
    password: "staff123",
    role: "Staff",
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const remember = watch("remember");

  const onSubmit = async (values: LoginFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const user = mockUsers.find(
      (item) =>
        item.email === values.email.trim().toLowerCase() &&
        item.password === values.password,
    );

    if (!user) {
      toast.error("Invalid email or password");
      return;
    }

    localStorage.setItem("erp_token", "mock-auth-token");
    localStorage.setItem(
      "erp_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      }),
    );

    toast.success(`Welcome back, ${user.name}`);

    // Role-based redirection
    const rolePath = user.role.toLowerCase();
    navigate(`/${rolePath}/dashboard`);
  };

  return (
    <main className="min-h-svh bg-slate-50 dark:bg-slate-950 lg:h-svh lg:overflow-hidden">
      <div className="grid min-h-svh lg:h-svh lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden h-svh overflow-hidden bg-[#07113d] px-10 py-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.38),transparent_34%),radial-gradient(circle_at_10%_85%,rgba(99,102,241,0.34),transparent_34%)]" />
          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="absolute -bottom-44 left-10 h-[460px] w-[460px] rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 shadow-lg shadow-blue-500/30">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Mini <span className="text-blue-400">ERP</span>
                </h1>
                <p className="text-xs text-slate-300">
                  Business Management Simplified
                </p>
              </div>
            </div>

            <div className="mt-14 max-w-xl">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-[44px]">
                Manage your business{" "}
                <span className="text-blue-400">smarter, faster, better</span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                A clean ERP dashboard to manage users, products, invoices,
                expenses, and business operations from one secure workspace.
              </p>

              <div className="mt-8 space-y-4">
                <FeatureItem
                  icon={<BarChart3 className="h-4 w-4" />}
                  title="Dashboard Overview"
                  description="Real-time insights and business analytics"
                  color="bg-blue-500"
                />

                <FeatureItem
                  icon={<Users className="h-4 w-4" />}
                  title="User Management"
                  description="Manage admins, managers, and staff"
                  color="bg-emerald-500"
                />

                <FeatureItem
                  icon={<FileText className="h-4 w-4" />}
                  title="Invoices & Expenses"
                  description="Create, track, and manage business records"
                  color="bg-violet-500"
                />

                <FeatureItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Role-based Access"
                  description="Protected routes and permission-based UI"
                  color="bg-amber-500"
                />
              </div>
            </div>

            <div className="relative mt-auto">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat title="Revenue" value="₹2.45L" />
                  <MiniStat title="Invoices" value="128" />
                  <MiniStat title="Expenses" value="74" />
                </div>

                <div className="mt-4 h-20 rounded-2xl border border-white/10 bg-white/10 p-3">
                  <div className="flex h-full items-end gap-3">
                    <div className="h-7 w-7 rounded-t-lg bg-blue-400/70" />
                    <div className="h-10 w-7 rounded-t-lg bg-blue-400/80" />
                    <div className="h-14 w-7 rounded-t-lg bg-blue-400" />
                    <div className="h-9 w-7 rounded-t-lg bg-blue-400/70" />
                    <div className="h-16 w-7 rounded-t-lg bg-blue-400" />
                    <div className="h-12 w-7 rounded-t-lg bg-blue-400/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-svh items-center justify-center px-5 py-8 lg:h-svh lg:min-h-0">
          <div className="w-full max-w-[460px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                  Mini ERP
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Business Management Simplified
                </p>
              </div>
            </div>

            <Card className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card shadow-2xl shadow-slate-200/80 dark:shadow-none">
              <CardHeader className="items-center space-y-3 pb-5 pt-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <LockKeyhole className="h-8 w-8" />
                </div>

                <div>
                  <CardTitle className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
                    Welcome back
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Sign in to continue to Mini ERP Dashboard
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="h-11 rounded-xl pl-12 text-base"
                        {...register("email")}
                      />
                    </div>

                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="h-11 rounded-xl pl-12 pr-12 text-base"
                        {...register("password")}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Checkbox
                        checked={remember}
                        onCheckedChange={(checked) =>
                          setValue("remember", checked === true)
                        }
                      />
                      Remember me
                    </label>

                    <button
                      type="button"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium hover:bg-blue-700"
                  >
                    {isSubmitting ? "Signing in..." : "Sign in"}
                  </Button>
                </form>

                <div className="mt-7 flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-4 w-4" />
                    Secure login
                  </div>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              © 2026 Mini ERP. All rights reserved.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

type FeatureItemProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
};

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white ${color}`}
      >
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <p className="mt-1 text-xs text-slate-300">{description}</p>
      </div>
    </div>
  );
}

type MiniStatProps = {
  title: string;
  value: string;
};

function MiniStat({ title, value }: MiniStatProps) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-xs text-slate-300">{title}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
