import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUpIcon } from "lucide-react";
import type { JSX } from "react";

type Primitive = string | number | boolean;

type DynamicStatsCardsProps = {
  data: Record<string, unknown>;
};

function isPrimitive(val: unknown): val is Primitive {
  return typeof val === "string" || typeof val === "number" || typeof val === "boolean";
}

export function DynamicStatsCards({ data }: DynamicStatsCardsProps) {
  console.log(data)
  const renderCard = (title: string, value: Primitive) => (
    <Card key={title} className="@container/card w-full max-w-sm">
      <CardHeader className="relative">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {typeof value === "number" ? value.toLocaleString() : String(value)}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            <TrendingUpIcon className="size-3" />
            +0%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="text-sm text-muted-foreground">
        Auto-generated from JSON
      </CardFooter>
    </Card>
  );

  const extractCards = (
    obj: Record<string, unknown>,
    parentKey = ""
  ): JSX.Element[] => {
    const cards: JSX.Element[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (isPrimitive(value)) {
        cards.push(renderCard(fullKey, value));
      } else if (Array.isArray(value)) {
        if (value.length && typeof value[0] === "object" && value[0] !== null) {
          const firstItem = value[0] as Record<string, unknown>;
          for (const [k, v] of Object.entries(firstItem)) {
            if (isPrimitive(v)) {
              cards.push(renderCard(`${fullKey}[0].${k}`, v));
            }
          }
        }
      } else if (typeof value === "object" && value !== null) {
        cards.push(...extractCards(value as Record<string, unknown>, fullKey));
      }
    }

    return cards;
  };

  const cards = extractCards(data);

  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{cards}</div>;
}

