import { ChartLineMultiple } from '@/components/line-chart'
import { SectionCards } from '@/components/section-cards'
import { getOverviewStats } from '@/lib/functions/stats'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_base/dashboard')({
  component: RouteComponent,
  loader: ({ context }) => getOverviewStats({ data: context.session?.user.id! }),
  pendingComponent: () => {
    return <h1>Loading...</h1>
  }
})

function RouteComponent() {

  const data = Route.useLoaderData()


  return (
    <div className='flex flex-col gap-4'>
      <SectionCards data={data} />
      <ChartLineMultiple data={data.listings.charts.by_category} />
    </div>
  )
}
