import {
  createFileRoute,
  Outlet,
  useLocation
} from '@tanstack/react-router'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/billing-sidebar"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"


export const Route = createFileRoute('/_billing')({
  component: RouteComponent,
})
function RouteComponent() {

  const { pathname } = useLocation()
  const crumbs = pathname.split('/').filter(Boolean)

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/">
                  App
                </BreadcrumbLink>
              </BreadcrumbItem>
              {crumbs.map((crumb, idx) => {
                return (
                  <div key={idx} className='flex items-center justify-center p-0 m-0'>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className='capitalize'>{crumb}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </div>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 p-4">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}



