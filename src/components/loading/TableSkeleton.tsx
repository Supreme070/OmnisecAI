import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showPagination?: boolean;
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 5, 
  showHeader = true,
  showPagination = true 
}: TableSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between space-x-4">
            <Skeleton className="h-10 w-80" />
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="border-b">
          <div className="grid grid-cols-5 gap-4 p-4">
            {[...Array(columns)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4">
              {[...Array(columns)].map((_, j) => (
                <div key={j} className="flex items-center">
                  {j === 0 ? (
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ) : j === columns - 1 ? (
                    <div className="flex space-x-1">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DataTableSkeleton() {
  return <TableSkeleton rows={8} columns={6} showHeader={true} showPagination={true} />;
}

export function SimpleTableSkeleton() {
  return <TableSkeleton rows={5} columns={4} showHeader={false} showPagination={false} />;
}