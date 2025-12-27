import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface PageLoadingProps {
  /** Message to show while loading */
  message?: string;
  /** Loading variant - 'spinner' shows a centered spinner, 'skeleton' shows skeleton cards */
  variant?: "spinner" | "skeleton";
  /** Number of skeleton cards to show when variant is 'skeleton' */
  skeletonCount?: number;
}

/**
 * Consistent page loading component used across all pages
 * Use this component to display loading state with consistent design
 */
const PageLoading = ({ 
  message = "Memuat data...", 
  variant = "skeleton",
  skeletonCount = 3
}: PageLoadingProps) => {
  if (variant === "spinner") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Content skeleton cards */}
      <div className="space-y-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PageLoading;
