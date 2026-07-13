"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  UsersIcon,
  DollarSignIcon,
  ClockIcon,
  TargetIcon,
  BarChart2Icon,
  FilterIcon
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#8884D8"]

const monthlyData = [
  { month: "Jan", projects: 12, completed: 8, revenue: 45000, teamSize: 45 },
  { month: "Feb", projects: 15, completed: 10, revenue: 52000, teamSize: 47 },
  { month: "Mar", projects: 18, completed: 12, revenue: 48000, teamSize: 48 },
  { month: "Apr", projects: 14, completed: 9, revenue: 55000, teamSize: 50 },
  { month: "May", projects: 20, completed: 15, revenue: 62000, teamSize: 52 },
  { month: "Jun", projects: 16, completed: 11, revenue: 58000, teamSize: 54 },
  { month: "Jul", projects: 22, completed: 14, revenue: 65000, teamSize: 55 },
]

const stageDistribution = [
  { name: "Ideation", value: 12, color: "#8884D8" },
  { name: "Planning", value: 8, color: "#0088FE" },
  { name: "Development", value: 15, color: "#FFBB28" },
  { name: "Review", value: 5, color: "#AF19FF" },
  { name: "Testing", value: 7, color: "#FF8042" },
  { name: "Deployment", value: 3, color: "#00C49F" },
]

const teamPerformance = [
  { team: "Frontend", completed: 45, inProgress: 12, efficiency: 85 },
  { team: "Backend", completed: 38, inProgress: 15, efficiency: 78 },
  { team: "Mobile", completed: 22, inProgress: 8, efficiency: 92 },
  { team: "DevOps", completed: 18, inProgress: 5, efficiency: 88 },
  { team: "QA", completed: 30, inProgress: 10, efficiency: 82 },
  { team: "Design", completed: 15, inProgress: 6, efficiency: 90 },
]

const kpiData = [
  { title: "Total Projects", value: "72", change: "+12%", trend: "up", icon: ChartBarIcon, color: "text-blue-600 bg-blue-100" },
  { title: "Completed This Month", value: "14", change: "+3", trend: "up", icon: TrendingUpIcon, color: "text-green-600 bg-green-100" },
  { title: "Revenue", value: "$65K", change: "+8.2%", trend: "up", icon: DollarSignIcon, color: "text-purple-600 bg-purple-100" },
  { title: "Team Utilization", value: "87%", change: "-2%", trend: "down", icon: UsersIcon, color: "text-orange-600 bg-orange-100" },
  { title: "Avg. Delivery Time", value: "12 days", change: "-1.5 days", trend: "up", icon: ClockIcon, color: "text-cyan-600 bg-cyan-100" },
  { title: "Success Rate", value: "94%", change: "+1.2%", trend: "up", icon: TargetIcon, color: "text-emerald-600 bg-emerald-100" },
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = React.useState("monthly")

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track project performance and team metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 px-4 lg:px-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color} p-2 rounded-md`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {kpi.trend === "up" ? <TrendingUpIcon className="h-3 w-3 text-green-600" /> : <TrendingDownIcon className="h-3 w-3 text-red-600" />}
                  <span className={kpi.trend === "up" ? "text-green-600" : "text-red-600"}>
                    {kpi.change}
                  </span>
                  <span>vs last period</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Overview</CardTitle>
              <Badge variant="outline" className="capitalize">{timeRange} view</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              projects: { label: "Total Projects", color: "#0088FE" },
              completed: { label: "Completed", color: "#00C49F" },
              revenue: { label: "Revenue ($K)", color: "#FFBB28" },
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0088FE" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0088FE" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C49F" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="projects" 
                    stroke="#0088FE" 
                    fillOpacity={1} 
                    fill="url(#colorProjects)" 
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#00C49F" 
                    fillOpacity={1} 
                    fill="url(#colorCompleted)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <ChartLegend>
                <ChartLegendContent />
              </ChartLegend>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              distribution: { label: "Projects", color: "#8884D8" },
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stageDistribution}
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
                    {stageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "projects"]} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7 px-4 lg:px-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              revenue: { label: "Revenue ($K)", color: "#FFBB28" },
            }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${(value/1000).toFixed(0)}K`} />
                  <Tooltip content={<ChartTooltipContent />} formatter={(value: unknown) => typeof value === "number" ? [`$${value.toLocaleString()}`, "Revenue"] : ["", "Revenue"]} />
                  <Bar dataKey="revenue" fill="#FFBB28" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {teamPerformance.map((team) => (
                <div key={team.team} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{team.team}</span>
                    </div>
                    <Badge variant="outline">{team.efficiency}% efficiency</Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500" 
                      style={{ width: `${team.efficiency}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Completed: {team.completed}</span>
                    <span>In Progress: {team.inProgress}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}