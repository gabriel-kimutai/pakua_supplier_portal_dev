import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_billing/subscriptions')({
  component: PricingPage,
})


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

type Feature = {
  text: string;
  included?: boolean;
};

type Plan = {
  title: string;
  price: number;
  description: string;
  features: Feature[];
  recommended?: boolean;
  cta: string;
};

const plans: Plan[] = [
  {
    title: "Pakua Lite",
    price: 2500,
    description: "For new sellers testing the waters.",
    features: [
      { text: "Up to 5 listings", included: true },
      { text: "Featured Listings", included: false },
      { text: "Basic visibility in search", included: true },
      { text: "Dedicated Account Manager", included: false },
      { text: "Dedicated Brand Catalogue Page", included: false },
      { text: "Brand Logo Display on Listings", included: false },
      { text: "Bulk Upload Support", included: false },
      { text: "Featured Placement", included: false },
      { text: "Verified Seller Badge", included: false },
      { text: "Social Media Promotions", included: false },
      { text: "Promoted in Pakua PR/Events", included: false },
      { text: "Discounted Ads & Sponsored Posts", included: false },
    ],
    cta: "Choose Lite",
  },
  {
    title: "Pakua Basic",
    price: 5000,
    description: "For growing businesses needing more visibility.",
    features: [
      { text: "Up to 15 listings", included: true },
      { text: "1 featured listing per month", included: true },
      { text: "Priority visibility in search", included: true },
      { text: "Dedicated Account Manager", included: false },
      { text: "Dedicated Brand Catalogue Page", included: false },
      { text: "Brand Logo Display on Listings", included: false },
      { text: "Bulk Upload Support", included: false },
      { text: "Featured Placement", included: false },
      { text: "Verified Seller Badge", included: false },
      { text: "Social Media Promotions", included: false },
      { text: "Promoted in Pakua PR/Events", included: false },
      { text: "Discounted Ads & Sponsored Posts", included: false },
    ],
    cta: "Choose Basic",
  },
  {
    title: "Pakua Pro",
    price: 10000,
    description: "For established businesses ready to scale.",
    recommended: true,
    features: [
      { text: "Up to 50 listings", included: true },
      { text: "3 featured listings per month", included: true },
      { text: "Featured visibility in search", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Dedicated Brand Catalogue Page", included: false },
      { text: "Brand Logo Display on Listings", included: true },
      { text: "Bulk Upload Support", included: true },
      { text: "Featured Placement (Homepage/Category)", included: true },
      { text: "Verified Seller Badge", included: true },
      { text: "Social Media Promotions", included: true },
      { text: "Promoted in Pakua PR/Events", included: false },
      { text: "10% discount on Ads & Sponsored Posts", included: true },
    ],
    cta: "Choose Pro",
  },
  {
    title: "Pakua X",
    price: 50000,
    description: "For enterprises seeking maximum exposure.",
    features: [
      { text: "Unlimited listings", included: true },
      { text: "Unlimited featured listings", included: true },
      { text: "Top-tier + Branded visibility", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Dedicated Brand Catalogue Page", included: true },
      { text: "Brand Logo Display on Listings", included: true },
      { text: "Bulk Upload Support", included: true },
      { text: "Featured Placement (Homepage/Category)", included: true },
      { text: "Verified Seller Badge", included: true },
      { text: "Social Media Promotions", included: true },
      { text: "Promoted in Pakua PR/Events", included: true },
      { text: "20% discount on Ads & Sponsored Posts", included: true },
    ],
    cta: "Contact Sales",
  },
];

const allFeatures: string[] = Array.from(new Set(plans.flatMap(plan => plan.features.map(feature => feature.text))));

export default function PricingPage() {
  return (
    <div className="w-full py-12">
      <div className="hidden lg:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]"></TableHead>
                {plans.map((plan) => (
                  <TableHead key={plan.title} className={cn("p-4", { 'border-x-2 border-accent': plan.recommended })}>
                    <div className={cn("p-4 rounded-lg", { 'bg-accent/10': plan.recommended })}>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-headline">{plan.title}</CardTitle>
                        {plan.recommended && (
                          <Badge variant="default" className="bg-accent text-accent-foreground border-accent hover:bg-accent">
                            Most Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mt-2">
                        <span className="text-3xl font-bold tracking-tight">KES {plan.price.toLocaleString()}</span>
                        <span className="text-lg font-semibold text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="mt-2 min-h-[40px]">{plan.description}</CardDescription>
                      <Button size="lg" className="w-full mt-4" variant={plan.recommended ? 'default' : 'outline'}>
                        {plan.cta}
                      </Button>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allFeatures.map((featureText) => (
                <TableRow key={featureText}>
                  <TableCell className="font-medium">{featureText}</TableCell>
                  {plans.map((plan) => (
                    <TableCell key={plan.title} className={cn("text-center", { 'border-x-2 border-accent': plan.recommended })}>
                      <div className={cn("p-4 rounded-lg flex justify-center", { 'bg-accent/10': plan.recommended })}>
                        {plan.features.find(f => f.text === featureText)?.included ? (
                          <Check className="h-6 w-6 text-primary" />
                        ) : (
                          <X className="h-6 w-6 text-secondary" />
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:hidden max-w-7xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.title} className={cn('flex flex-col h-full rounded-xl shadow-md transition-all', { 'border-2 border-accent shadow-accent/20 shadow-lg relative -translate-y-2': plan.recommended })}>
            {plan.recommended && (
              <Badge variant="default" className="absolute -top-4 right-6 bg-accent text-accent-foreground border-accent hover:bg-accent">
                Most Popular
              </Badge>
            )}
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-headline">{plan.title}</CardTitle>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-bold tracking-tight">KES {plan.price.toLocaleString()}</span>
                <span className="text-xl font-semibold text-muted-foreground">/month</span>
              </div>
              <CardDescription className="mt-1 min-h-[40px]">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex-grow">
              <ul className="space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3">
                    <div className="w-5 h-5 mt-1">
                      {feature.included ? (
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                      ) : (
                        <X className="h-5 w-5 shrink-0 text-green" />
                      )}
                    </div>
                    <span className={cn('text-sm', { 'text-muted-foreground': !feature.included })}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0 mt-auto">
              <Button size="lg" className="w-full" variant={plan.recommended ? 'default' : 'outline'}>
                {plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

