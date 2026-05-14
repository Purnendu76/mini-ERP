import { Skeleton } from "@/components/ui/skeleton";

export function SuspenseLoader() {
  return (
    <div className="flex flex-col gap-4 p-8 w-full max-w-2xl mx-auto">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-full rounded-full" />
      <Skeleton className="h-4 w-[70%] rounded-full" />
    </div>
  );
}
