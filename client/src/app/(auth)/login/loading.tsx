import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-[200px] mx-auto" />
          <Skeleton className="h-4 w-[250px] mx-auto" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-6" />
          <div className="flex items-center gap-2 mt-4">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-4 w-[40px]" />
            <Skeleton className="h-px flex-1" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-[200px] mx-auto mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}
