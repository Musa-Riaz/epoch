import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-8">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header skeleton */}
        <div className="space-y-3">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border rounded-lg p-6 space-y-3">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-8 w-[80px]" />
            </div>
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-6 w-[150px]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-8 w-[60px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
