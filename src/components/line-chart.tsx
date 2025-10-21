"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

interface ChartData {
  name: string,
  day: string,
  count: number
}

export const description = "A multiple line chart"

export interface ChartLineMultiProps {
  data?: ChartData[]
}

export function ChartLineMultiple({ data }: ChartLineMultiProps) {

  return (
    <div className="*:data-[slot=card]:shadow-xs gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Line Chart - Listings By Category</CardTitle>
        </CardHeader>
        <CardContent>
          {JSON.stringify(data)}
          {data?.length === 0
            ? <div className="text-muted-foreground">No data available</div>
            : <ResponsiveContainer width="100%" height="100%" >
              <PieChart width={100} height={100}>
                <Pie
                  data={data}
                  type="monotone"
                  dataKey="listings"
                  innerRadius={3}
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="name" />}
                  className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                />
              </PieChart>
            </ResponsiveContainer>
          }
        </CardContent>
      </Card>
    </div>
  )
}

