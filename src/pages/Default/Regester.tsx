import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  User,
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

const registerSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    terms: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const terms = watch("terms");

  const onSubmit = async (values: RegisterFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const existingUsers = JSON.parse(
      localStorage.getItem("erp_registered_users") || "[]"
    );

    const alreadyExists = existingUsers.some(
      (user: { email: string }) =>
        user.email === values.email.trim().toLowerCase()
    );

    if (alreadyExists) {
      toast.error("User already exists with this email");
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: values.name,
      email: values.email.trim().toLowerCase(),
      password: values.password,
      role: "Staff",
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "erp_registered_users",
      JSON.stringify([...existingUsers, newUser])
    );

    toast.success("Account created successfully");
    navigate("/login");
  };

  return (
    <main className="min-h-svh bg-[#f6f8fc] lg:h-svh lg:overflow-hidden">
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
                Create your account and start managing business{" "}
                <span className="text-blue-400">smarter</span>
              </h2>

              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
                Register a new workspace user and access a clean ERP dashboard
                for users, products, invoices, expenses, and business data.
              </p>

              <div className="mt-8 space-y-4">
                <FeatureItem
                  icon={<BarChart3 className="h-4 w-4" />}
                  title="Business Dashboard"
                  description="Track important business numbers"
                  color="bg-blue-500"
                />

                <FeatureItem
                  icon={<Users className="h-4 w-4" />}
                  title="Role-based Users"
                  description="Admin, manager, and staff access"
                  color="bg-emerald-500"
                />

                <FeatureItem
                  icon={<FileText className="h-4 w-4" />}
                  title="Invoices & Expenses"
                  description="Manage daily business transactions"
                  color="bg-violet-500"
                />

                <FeatureItem
                  icon={<ShieldCheck className="h-4 w-4" />}
                  title="Secure Access"
                  description="Protected dashboard and clean auth flow"
                  color="bg-amber-500"
                />
              </div>
            </div>

            <div className="relative mt-auto">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
                <div className="grid grid-cols-3 gap-3">
                  <MiniStat title="Users" value="124" />
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
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-950">
                  Mini ERP
                </h1>
                <p className="text-sm text-slate-500">
                  Business Management Simplified
                </p>
              </div>
            </div>

            <Card className="rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
              <CardHeader className="items-center space-y-3 pb-5 pt-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                  <User className="h-8 w-8" />
                </div>

                <div>
                  <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950">
                    Create account
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    Register to continue to Mini ERP Dashboard
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your name"
                        className="h-11 rounded-xl pl-12 text-base"
                        {...register("name")}
                      />
                    </div>

                    {errors.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

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
                        placeholder="Create password"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        className="h-11 rounded-xl pl-12 pr-12 text-base"
                        {...register("confirmPassword")}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((prev) => !prev)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-600">
                      <Checkbox
                        checked={Boolean(terms)}
                        onCheckedChange={(checked) =>
                          setValue("terms", checked === true, {
                            shouldValidate: true,
                          })
                        }
                        className="mt-0.5"
                      />
                      <span>
                        I agree to the terms, privacy policy, and secure account
                        usage.
                      </span>
                    </label>

                    {errors.terms && (
                      <p className="text-sm text-red-500">
                        {errors.terms.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 w-full rounded-xl bg-blue-600 text-base font-medium hover:bg-blue-700"
                  >
                    {isSubmitting ? "Creating account..." : "Create account"}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-slate-500">
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