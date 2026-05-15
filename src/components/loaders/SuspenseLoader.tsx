import { Skeleton } from "@/components/ui/skeleton";

export function SuspenseLoader() {
  return (
    <div className="relative w-full h-full animate-in fade-in duration-500 overflow-hidden">
      {/* Centered Loading Dots (Simplified) */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white/20 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="size-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="size-3 bg-blue-600 rounded-full animate-bounce"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">System Loading</span>
        </div>
      </div>

      {/* Skeleton Background (Blurred slightly to focus on animation) */}
      <div className="space-y-6 opacity-40 blur-[2px] transition-all duration-300">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-4 w-24 bg-slate-100 dark:bg-slate-800" />
                <Skeleton className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20" />
              </div>
              <Skeleton className="h-8 w-28 bg-slate-100 dark:bg-slate-800" />
              <Skeleton className="h-3 w-36 bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-48 bg-slate-100 dark:bg-slate-800" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-24 rounded-xl bg-slate-50 dark:bg-slate-900/50" />
                <Skeleton className="h-9 w-24 rounded-xl bg-slate-50 dark:bg-slate-900/50" />
              </div>
            </div>
            <Skeleton className="h-72 w-full rounded-2xl bg-slate-50/50 dark:bg-slate-900/30" />
          </div>

          <div className="p-6 bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            <Skeleton className="h-6 w-36 bg-slate-100 dark:bg-slate-800" />
            <div className="space-y-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-11 rounded-full bg-slate-100 dark:bg-slate-800" />
                  <div className="space-y-2.5 flex-1">
                    <Skeleton className="h-3.5 w-full bg-slate-100 dark:bg-slate-800" />
                    <Skeleton className="h-2.5 w-2/3 bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Area Skeleton */}
        <div className="p-6 bg-white dark:bg-card rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-6 w-56 bg-slate-100 dark:bg-slate-800" />
            <Skeleton className="h-10 w-36 rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="space-y-4">
            <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 flex-1 bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-6 py-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <Skeleton key={j} className="h-4 flex-1 bg-slate-50 dark:bg-slate-900/50" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
