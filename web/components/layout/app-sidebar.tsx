"use client"

import * as React from "react"

import { NavDocuments } from "@/components/layout/nav-documents"
import { NavMain } from "@/components/layout/nav-main"
import { NavSecondary } from "@/components/layout/nav-secondary"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { CommandIcon } from "lucide-react"
import { NavGroup } from "./nav-group"
import { navMain, navGroup, navSecondary, documents } from "../data"
import { useSearchDialog } from "@/contexts/search-context"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpen } = useSearchDialog()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">HR Hub</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain.map((item) => ({
            ...item,
            icon: React.createElement(item.icon),
          }))}
        />
        <NavGroup items={navGroup} />
        <NavSecondary
          items={navSecondary.map((item) => ({
            ...item,
            icon: React.createElement(item.icon),
          }))}
          className="mt-auto"
          onSearchClick={() => setOpen(true)}
        />
      </SidebarContent>
    </Sidebar>
  )
}