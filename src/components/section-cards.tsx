import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

interface ListingTrend {
  current_count: number
  previous_count: number
  percentage_change: number
  trend_direction: "up" | "down" | "flat"
}


interface SectionCardProps {
  title: string
  total: number
  children: Record<string, unknown>
  trend?: ListingTrend
}

function SectionCard({ data }: { data: SectionCardProps }) {

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription className="capitalize">{data.title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {data.total}
        </CardTitle>
        <div className="absolute right-4 top-4">
          {data.trend && (
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {
                data.trend.trend_direction == 'up'
                  ? <TrendingUpIcon className="size-3" />
                  : <TrendingDownIcon className="size-3" />
              }
              {data.trend.percentage_change !== null ? data.trend.percentage_change : "New"}%
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <Collapsible className="w-full">
          <CollapsibleTrigger className="text-muted-foreground text-sm hover:cursor-pointer hover:text-primary">View More</CollapsibleTrigger>
          <CollapsibleContent >
            {Object.entries(data.children).map(([key, value]) => (
              <div key={key} >
                <div className="text-sm font-medium capitalize">{key}</div>
                {Array.isArray(value) ? (
                  <ul className="ml-3 list-disc text-muted-foreground">
                    {value.map((item, index) =>
                      typeof item === "object" && item !== null ? (
                        <li key={index} className="flex justify-between">
                          <span>{(item as any).name}</span>
                          <span className="font-semibold tabular-nums">
                            {(item as any).value}
                          </span>
                        </li>
                      ) : (
                        <li key={index}>{String(item)}</li>
                      )
                    )}
                  </ul>
                ) : (
                  <div className="text-muted-foreground ml-2 font-bold">
                    {String(value)}
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardFooter>
    </Card>
  )
}

interface CardProps {
  data: Record<string, unknown>
}


export function SectionCards({ data }: { data: CardProps }) {
  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      {Object.entries(data).map(([key, value]) => (
        <SectionCard
          key={key}
          data={{
            title: key,
            total: value.total,
            trend: value.trend,
            children: value.children,
          }}
        />
      )
      )}
    </div>
  )
}

