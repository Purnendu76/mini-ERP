import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Home,
  SearchX,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-svh overflow-hidden bg-[#f6f8fc]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.12),transparent_30%)]" />

      <div className="relative z-10 flex min-h-svh items-center justify-center px-5 py-10">
        <div className="w-full max-w-[780px] text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-200">
            <Building2 className="h-8 w-8" />
          </div>

          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            Mini ERP Dashboard
          </div>

          <div className="relative mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
            <SearchX className="h-16 w-16 text-blue-600" />
            <div className="absolute -right-3 -top-3 rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
              404
            </div>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Page not found
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            The page you are looking for does not exist, may have been moved,
            or you may not have access to this section.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="outline"
              className="h-11 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>

            <Button asChild className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700">
              <Link to="/login">
                <Home className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-3">
            <InfoCard title="Dashboard" description="Business overview" />
            <InfoCard title="Invoices" description="Track billing data" />
            <InfoCard title="Expenses" description="Manage spending" />
          </div>
        </div>
      </div>
    </main>
  );
}

type InfoCardProps = {
  title: string;
  description: string;
};

function InfoCard({ title, description }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}