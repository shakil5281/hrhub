"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UsersIcon, BuildingIcon, ClockIcon, UserPlusIcon, TrendingUpIcon, CalendarCheckIcon } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { dashboardApi } from "@/lib/api"
import { toast } from "sonner"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#8884D8", "#FF6384", "#36A2EB"]

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
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    dashboardApi.stats()
      .then((res) => setData(res.data))
      .catch(() => toast.error("Failed to load analytics data"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalEmployees = data?.total_employees ?? 0
  const activeEmployees = data?.active_employees ?? 0
  const departments = data?.total_departments ?? 0
  const sections = data?.total_sections ?? 0

  const genderPieData = (data?.gender_distribution ?? []).map(g => ({
    name: g.gender,
    value: g.count,
  }))

  const deptBarData = (data?.department_counts ?? []).map(d => ({
    name: d.name,
    employees: d.count,
  }))

  const attendanceTrendData = (data?.monthly_attendance ?? []).map(m => ({
    month: m.month.slice(-2),
    present: m.present,
    absent: m.absent,
    late: m.late,
  }))

  const kpiCards = [
    { title: "Total Employees", value: totalEmployees, icon: UsersIcon, color: "text-blue-600 bg-blue-100" },
    { title: "Active Employees", value: activeEmployees, icon: TrendingUpIcon, color: "text-green-600 bg-green-100" },
    { title: "Departments", value: departments, icon: BuildingIcon, color: "text-purple-600 bg-purple-100" },
    { title: "Sections", value: sections, icon: BuildingIcon, color: "text-cyan-600 bg-cyan-100" },
    { title: "Today Attendance", value: data?.today_attendance ?? 0, icon: ClockIcon, color: "text-orange-600 bg-orange-100" },
    { title: "Pending Leaves", value: data?.pending_leaves ?? 0, icon: CalendarCheckIcon, color: "text-rose-600 bg-rose-100" },
  ]

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">HR analytics and workforce metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 px-4 lg:px-6">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-md ${kpi.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceTrendData.length > 0 ? (
              <ChartContainer config={{
                present: { label: "Present", color: "#00C49F" },
                absent: { label: "Absent", color: "#FF8042" },
                late: { label: "Late", color: "#FFBB28" },
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={attendanceTrendData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF8042" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF8042" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="present" stroke="#00C49F" fillOpacity={1} fill="url(#colorPresent)" strokeWidth={2} />
                    <Area type="monotone" dataKey="absent" stroke="#FF8042" fillOpacity={1} fill="url(#colorAbsent)" strokeWidth={2} />
                    <Area type="monotone" dataKey="late" stroke="#FFBB28" fillOpacity={0.3} fill="#FFBB28" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
                <ChartLegend>
                  <ChartLegendContent />
                </ChartLegend>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No attendance data</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {genderPieData.length > 0 ? (
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={genderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884D8"
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {genderPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "employees"]} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No gender data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-7">
          <CardHeader>
            <CardTitle>Employees by Department</CardTitle>
          </CardHeader>
          <CardContent>
            {deptBarData.length > 0 ? (
              <ChartContainer config={{
                employees: { label: "Employees", color: "#0088FE" },
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deptBarData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="employees" fill="#0088FE" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No department data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
