"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UsersIcon,
  BuildingIcon,
  ClockIcon,
  CalendarCheckIcon,
  UserPlusIcon,
  UserXIcon,
  FileTextIcon,
  ActivityIcon,
  Loader2,
} from "lucide-react"
import { dashboardApi } from "@/lib/api"
import { toast } from "sonner"

interface DashboardStats {
  total_employees: number
  active_employees: number
  total_departments: number
  total_sections: number
  today_attendance: number
  today_logs: number
  pending_leaves: number
  new_hires_month: number
  separations_month: number
  gender_distribution: { gender: string; count: number }[]
  department_counts: { name: string; count: number }[]
  monthly_attendance: { month: string; present: number; absent: number; late: number }[]
  recent_activity: { type: string; description: string; date: string }[]
}

export default function DashboardPage() {
  const [data, setData] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    dashboardApi.stats()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const statCards = [
    { title: "Total Employees", value: data?.total_employees ?? 0, icon: UsersIcon, color: "text-blue-600 bg-blue-100" },
    { title: "Active Employees", value: data?.active_employees ?? 0, icon: UsersIcon, color: "text-green-600 bg-green-100" },
    { title: "Today Attendance", value: data?.today_attendance ?? 0, icon: ClockIcon, color: "text-purple-600 bg-purple-100" },
    { title: "Pending Leaves", value: data?.pending_leaves ?? 0, icon: CalendarCheckIcon, color: "text-orange-600 bg-orange-100" },
    { title: "Departments", value: data?.total_departments ?? 0, icon: BuildingIcon, color: "text-indigo-600 bg-indigo-100" },
    { title: "Sections", value: data?.total_sections ?? 0, icon: BuildingIcon, color: "text-teal-600 bg-teal-100" },
    { title: "New Hires (Month)", value: data?.new_hires_month ?? 0, icon: UserPlusIcon, color: "text-emerald-600 bg-emerald-100" },
    { title: "Separations (Month)", value: data?.separations_month ?? 0, icon: UserXIcon, color: "text-red-600 bg-red-100" },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">HR overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-md ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.department_counts && data.department_counts.length > 0 ? (
              <div className="space-y-3">
                {data.department_counts.map((dept) => (
                  <div key={dept.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-40 truncate">{dept.name}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (dept.count / Math.max(...data.department_counts.map(d => d.count))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{dept.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No department data</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.gender_distribution && data.gender_distribution.length > 0 ? (
              <div className="space-y-3">
                {data.gender_distribution.map((g) => (
                  <div key={g.gender} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20">{g.gender}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (g.count / Math.max(...data.gender_distribution.map(d => d.count))) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8 text-right">{g.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No gender data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.monthly_attendance && data.monthly_attendance.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium pb-1 border-b">
                  <span>Month</span>
                  <span className="text-right">Present</span>
                  <span className="text-right">Absent</span>
                  <span className="text-right">Late</span>
                </div>
                {data.monthly_attendance.map((m) => (
                  <div key={m.month} className="grid grid-cols-4 gap-2 text-sm py-1 border-b last:border-0">
                    <span className="font-medium">{m.month}</span>
                    <span className="text-right text-emerald-600">{m.present}</span>
                    <span className="text-right text-red-600">{m.absent}</span>
                    <span className="text-right text-amber-600">{m.late}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance data</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recent_activity && data.recent_activity.length > 0 ? (
              <div className="space-y-3">
                {data.recent_activity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-1.5 rounded-full ${
                      activity.type === "leave_request" ? "bg-orange-100 text-orange-600" :
                      activity.type === "new_employee" ? "bg-green-100 text-green-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {activity.type === "leave_request" ? <CalendarCheckIcon className="h-3.5 w-3.5" /> :
                       activity.type === "new_employee" ? <UserPlusIcon className="h-3.5 w-3.5" /> :
                       <ActivityIcon className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
