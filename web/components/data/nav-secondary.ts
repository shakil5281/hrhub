import type { LucideIcon } from "lucide-react"
import { Settings2Icon, CircleHelpIcon, SearchIcon } from "lucide-react"

export const navSecondary = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings2Icon,
  },
  {
    title: "Get Help",
    url: "/help",
    icon: CircleHelpIcon,
  },
  {
    title: "Search",
    url: "/search",
    icon: SearchIcon,
  },
] as const satisfies {
  title: string
  url: string
  icon: LucideIcon
}[]