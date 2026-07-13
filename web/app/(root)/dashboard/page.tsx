"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LayoutDashboardIcon, 
  ListIcon, 
  ChartBarIcon, 
  FolderIcon, 
  UsersIcon,
  TrendingUpIcon,
  Users2Icon,
  FileTextIcon,
  ClockIcon
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { title: "Active Projects", value: "24", change: "+12%", icon: FolderIcon, color: "text-blue-600 bg-blue-100" },
    { title: "Team Members", value: "156", change: "+8%", icon: Users2Icon, color: "text-green-600 bg-green-100" },
    { title: "Completed Tasks", value: "1,234", change: "+23%", icon: FileTextIcon, color: "text-purple-600 bg-purple-100" },
    { title: "Avg. Completion", value: "3.2 days", change: "-5%", icon: ClockIcon, color: "text-orange-600 bg-orange-100" },
  ]

  const recentActivity = [
    { action: "Project created", item: "Q4 Marketing Campaign", time: "2 min ago", type: "create" },
    { action: "Task completed", item: "Design review #142", time: "15 min ago", type: "complete" },
    { action: "New member joined", item: "Sarah Chen - Designer", time: "1 hour ago", type: "join" },
    { action: "Milestone reached", item: "Phase 2 Delivery", time: "3 hours ago", type: "milestone" },
    { action: "Comment added", item: "API Integration specs", time: "5 hours ago", type: "comment" },
  ]

  const quickActions = [
    { title: "New Project", description: "Start a new project", icon: LayoutDashboardIcon, href: "/projects/new" },
    { title: "Create Task", description: "Add a new task", icon: FileTextIcon, href: "/tasks/new" },
    { title: "Invite Team", description: "Add team members", icon: UsersIcon, href: "/team/invite" },
    { title: "View Reports", description: "Check analytics", icon: ChartBarIcon, href: "/analytics" },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your projects and team activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color} p-2 rounded-md`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-full ${
                    activity.type === "create" ? "bg-blue-100 text-blue-600" :
                    activity.type === "complete" ? "bg-green-100 text-green-600" :
                    activity.type === "join" ? "bg-purple-100 text-purple-600" :
                    activity.type === "milestone" ? "bg-yellow-100 text-yellow-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {activity.type === "create" && <LayoutDashboardIcon className="h-4 w-4" />}
                    {activity.type === "complete" && <FileTextIcon className="h-4 w-4" />}
                    {activity.type === "join" && <Users2Icon className="h-4 w-4" />}
                    {activity.type === "milestone" && <TrendingUpIcon className="h-4 w-4" />}
                    {activity.type === "comment" && <ClockIcon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.item}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <a key={action.title} href={action.href} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}