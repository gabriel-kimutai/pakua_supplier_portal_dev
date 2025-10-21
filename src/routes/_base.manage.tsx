import { DataTable } from '@/components/data-table'
import { DataTableLoadingSkeleton } from '@/components/data-table-skeleton'
import { listingsColumns } from '@/lib/columns/manage-listings'
import { getListings } from '@/lib/functions/listings'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_base/manage')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, isFetching } = useQuery({
    queryKey: ['listings'],
    queryFn: getListings,
  })

  if (isFetching) return <DataTableLoadingSkeleton columns={listingsColumns} />
  return <DataTable data={data || []} columns={listingsColumns} />
}
