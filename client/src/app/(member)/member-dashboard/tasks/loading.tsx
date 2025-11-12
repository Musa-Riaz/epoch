import { Skeleton } from "@/components/ui/skeleton";
import { StatsCardSkeleton, TaskDetailSkeleton } from "@/components/ui/skeleton-loaders";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-[180px]" />
        <Skeleton className="h-10 w-full sm:w-[200px]" />
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-[400px]" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <TaskDetailSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
