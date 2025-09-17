"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingProject() {
  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex flex-col h-full">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        
        {/* Title skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        
        {/* Description skeleton */}
        <div className="flex-1 mb-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        
        {/* Progress skeleton */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1.5 w-full" />
        </div>
        
        {/* Metadata skeleton */}
        <div className="flex items-center justify-between text-xs mt-auto">
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>
      </div>
    </Card>
  );
}
