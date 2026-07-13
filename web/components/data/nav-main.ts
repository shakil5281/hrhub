import type { LucideIcon } from "lucide-react"
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, FolderIcon, UsersIcon } from "lucide-react"

export const navMain = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    title: "Lifecycle",
    url: "/lifecycle",
    icon: ListIcon,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: ChartBarIcon,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: FolderIcon,
  },
  {
    title: "Team",
    url: "/team",
    icon: UsersIcon,
  },
] as const satisfies {
  title: string
  url: string
  icon: LucideIcon
}[]