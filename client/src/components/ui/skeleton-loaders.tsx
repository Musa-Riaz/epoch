import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Task Card Skeleton
export function TaskCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-5 w-[180px] mt-2" />
        <Skeleton className="h-4 w-full mt-1" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="w-6 h-6 rounded-full" />
              ))}
            </div>
            <Skeleton className="h-4 w-[80px]" />
          </div>
          <Skeleton className="h-4 w-[60px]" />
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-4 w-[100px]" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px]" />
      </CardContent>
    </Card>
  );
}

// Project Card Skeleton
export function ProjectCardSkeleton() {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-full" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[40px]" />
          </div>
          <Skeleton className="h-2 w-full" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Task Detail Skeleton
export function TaskDetailSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded" />
            <Skeleton className="h-6 w-[250px]" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-[150px] mt-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex items-center gap-2 pt-4 border-t">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[80px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Overview Skeleton
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-[200px]" />
        <Skeleton className="h-5 w-[300px]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Kanban Board Skeleton
export function KanbanBoardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["To Do", "In Progress", "Done"].map((status) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-5 w-8" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Table Header */}
      <div className="flex items-center gap-4 pb-3 border-b">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-5 flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3 border-b">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="h-6 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// List Item Skeleton
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <Skeleton className="h-8 w-[80px]" />
    </div>
  );
}
