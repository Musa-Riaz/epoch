import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-5 w-[350px]" />
      </div>

      {/* Profile Overview Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <Skeleton className="w-24 h-24 rounded-full" />

            {/* User Info */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>

            {/* Logout Button */}
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-[600px]" />
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
            <Skeleton className="h-4 w-[300px]" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-px w-full" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-10 w-[100px]" />
              <Skeleton className="h-10 w-[140px]" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
