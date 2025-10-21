import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"

interface DataTableSkeletonProps<T> {
  columns: ColumnDef<T>[]
}

export function DataTableLoadingSkeleton({ columns }: DataTableSkeletonProps<any>) {
  return (
    <div className="w-full space-y-4">
      {/* Search and View Controls */}
      <div className="flex items-center py-4">
        <Skeleton className="h-9 w-full max-w-sm rounded-md" />
        <Skeleton className="ml-auto hidden h-8 w-8 rounded-md lg:flex" />
      </div>

      {/* Table Container */}
      <div className="rounded-md border">
        <div className="relative w-full overflow-x-auto">
          {/* Table Header */}
          <div className="border-b">
            <div className="grid grid-cols-8 p-2">
              {columns.map((header, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-[100px]" />
                  {header && <Skeleton className="h-4 w-4" />}
                </div>
              ))}
            </div>
          </div>

          {/* Table Rows */}
          {[...Array(3)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-8 border-b p-2">
              {/* ID */}
              <Skeleton className="h-6 w-6" />

              {/* Title */}
              <Skeleton className="h-6 w-[120px]" />

              {/* Price */}
              <Skeleton className="h-6 w-[60px]" />

              {/* Quantity */}
              <Skeleton className="h-6 w-[60px]" />

              {/* Location (with accordion) */}
              <div className="flex items-center">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="ml-1 h-4 w-4" />
              </div>

              {/* Attributes (with accordion) */}
              <div className="flex items-center">
                <Skeleton className="h-6 w-[80px]" />
                <Skeleton className="ml-1 h-4 w-4" />
              </div>

              {/* Seller Email */}
              <Skeleton className="h-6 w-[160px]" />

              {/* Actions */}
              <div className="flex justify-end">
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2 py-4">
        <Skeleton className="h-6 w-[120px]" />
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-[70px]" />
          </div>
          <Skeleton className="h-6 w-[100px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="hidden h-8 w-8 lg:flex" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="hidden h-8 w-8 lg:flex" />
          </div>
        </div>
      </div>
    </div>
  )
}
