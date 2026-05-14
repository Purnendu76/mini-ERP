import { Skeleton } from "@/components/ui/skeleton";

export function SuspenseLoader() {
  return (
    <div className="relative w-full h-full animate-in fade-in duration-500">
      {/* Centered Loading Dots (Simplified) */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3 bg-white/50 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20">
          <div className="flex items-center gap-2">
            <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="size-3 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">System Loading</span>
        </div>
      </div>

      {/* Skeleton Background (Blurred slightly to focus on animation) */}
      <div className="space-y-6 opacity-40 blur-[1px]">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24 bg-slate-100" />
                <Skeleton className="size-8 rounded-lg bg-blue-50" />
              </div>
              <Skeleton className="h-7 w-20 bg-slate-100" />
              <Skeleton className="h-3 w-32 bg-slate-100" />
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-5 w-40 bg-slate-100" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-md bg-slate-50" />
                <Skeleton className="h-8 w-20 rounded-md bg-slate-50" />
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-lg bg-slate-50/50" />
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-6">
            <Skeleton className="h-5 w-32 bg-slate-100" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full bg-slate-100" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 bg-slate-100" />
                    <Skeleton className="h-2 w-16 bg-slate-50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Area Skeleton */}
        <div className="p-6 bg-white rounded-xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-5 w-48 bg-slate-100" />
            <Skeleton className="h-9 w-32 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-3">
            <div className="flex gap-4 border-b pb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 flex-1 bg-slate-100" />
              ))}
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4 py-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 flex-1 bg-slate-50" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
