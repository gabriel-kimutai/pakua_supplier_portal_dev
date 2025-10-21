import * as React from "react"
import {
  ImportIcon,
  LayoutDashboardIcon,
  MessageSquare,
  PackageIcon,
  SettingsIcon,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { useRouteContext } from "@tanstack/react-router"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Import Products",
      url: "/import",
      icon: ImportIcon,
    },
    {
      title: "Manage Products",
      url: "/manage",
      icon: PackageIcon,
    },
    {
      title: "Messages",
      url: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { session } = useRouteContext({ from: '__root__' })
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex justify-center gap-2 md:justify-start">
              <a href="#" className="flex items-center gap-2 font-medium">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <img className='rounded-sm' src='/pakua_logo.jpg' width={512} height={512} />
                </div>
                <div>
                  <h3 className='scroll-m-20 text-2xl font-semibold tracking-tight'>Pakua.</h3>
                  <p className="text-xs text-muted-foreground">Supplier Portal</p>
                </div>
              </a>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={session?.user} />
      </SidebarFooter>
    </Sidebar>
  )
}



