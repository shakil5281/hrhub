"use client"

import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ListIcon, 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  ChevronDownIcon,
  MoreHorizontalIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  ClockIcon,
  ArrowUpDownIcon,
  KanbanIcon
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const lifecycleStages = [
  { id: "ideation", title: "Ideation", color: "bg-gray-100 text-gray-700", count: 12, icon: ListIcon },
  { id: "planning", title: "Planning", color: "bg-blue-100 text-blue-700", count: 8, icon: ArrowUpDownIcon },
  { id: "development", title: "Development", color: "bg-yellow-100 text-yellow-700", count: 15, icon: ClockIcon },
  { id: "review", title: "Review", color: "bg-purple-100 text-purple-700", count: 5, icon: AlertCircleIcon },
  { id: "testing", title: "Testing", color: "bg-orange-100 text-orange-700", count: 7, icon: CheckCircle2Icon },
  { id: "deployment", title: "Deployment", color: "bg-green-100 text-green-700", count: 3, icon: CheckCircle2Icon },
]

const projects = [
  { id: 1, name: "E-commerce Redesign", stage: "development", progress: 65, team: "Frontend Team", deadline: "2026-07-20", priority: "high", description: "Complete redesign of the e-commerce platform" },
  { id: 2, name: "Mobile App v2.0", stage: "review", progress: 90, team: "Mobile Team", deadline: "2026-07-18", priority: "high", description: "New version of mobile application" },
  { id: 3, name: "API Gateway Migration", stage: "testing", progress: 45, team: "Backend Team", deadline: "2026-08-01", priority: "medium", description: "Migration" },
  { id: 4, name: "Dashboard Analytics", stage: "planning", progress: 15, team: "Data Team", deadline: "2026-08-15", priority: "low", description: "New analytics dashboard" },
  { id: 5, name: "Security Audit", stage: "ideation", progress: 5, team: "Security Team", deadline: "2026-09-01", priority: "medium", description: "Comprehensive security audit" },
  { id: 6, name: "User Onboarding Flow", stage: "development", progress: 30, team: "UX Team", deadline: "2026-07-25", priority: "high", description: "Improve user onboarding" },
  { id: 7, name: "Performance Optimization", stage: "deployment", progress: 100, team: "DevOps", deadline: "2026-07-15", priority: "high", description: "System performance optimization" },
  { id: 8, name: "Documentation Update", stage: "testing", progress: 80, team: "Tech Writers", deadline: "2026-07-22", priority: "low", description: "Update technical documentation" },
]

const kanbanColumns = lifecycleStages.map(stage => ({
  ...stage,
  items: projects.filter(p => p.stage === stage.id)
}))

export default function LifecyclePage() {
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban")
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.team.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="destructive">High</Badge>
      case "medium": return <Badge variant="secondary">Medium</Badge>
      case "low": return <Badge variant="outline">Low</Badge>
    }
  }

  const getStageIcon = (stage: string) => {
    const stageData = lifecycleStages.find(s => s.id === stage)
    return stageData ? <stageData.icon className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lifecycle Management</h1>
          <p className="text-muted-foreground mt-1">Track projects through all lifecycle stages</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <FilterIcon className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm">
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0">
          {lifecycleStages.map((stage) => (
            <Badge key={stage.id} className={`${stage.color} whitespace-nowrap gap-1 flex items-center`}>
              <stage.icon className="h-3 w-3" />
              {stage.title}
              <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-medium">{stage.count}</span>
            </Badge>
          ))}
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "kanban" | "table")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="kanban">
              <KanbanIcon className="h-4 w-4 mr-2" />
              Kanban Board
            </TabsTrigger>
            <TabsTrigger value="table">
              <ListIcon className="h-4 w-4 mr-2" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="mt-4">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {kanbanColumns.map((column) => (
                <div key={column.id} className="min-w-[300px] max-w-[350px] flex flex-col">
                  <div className="flex items-center justify-between mb-3 p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${column.color}`}>
                        <column.icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{column.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{column.items.length}</Badge>
                  </div>
                  <div className="space-y-3 flex-1 min-h-[400px]">
                    {column.items.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{project.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 truncate">{project.description}</p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-300" 
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{project.team}</span>
                              <span className="text-muted-foreground">{project.deadline}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              {getPriorityBadge(project.priority)}
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontalIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {column.items.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        No projects in this stage
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Projects</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <SearchIcon className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ArrowUpDownIcon className="h-4 w-4 mr-1" />
                    Sort
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stage</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Progress</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Team</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Priority</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProjects.map((project) => (
                        <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {getStageIcon(project.stage)}
                              </div>
                              <div>
                                <p className="font-medium">{project.name}</p>
                                <p className="text-sm text-muted-foreground">ID: PRJ-{project.id.toString().padStart(4, '0')}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize">{project.stage}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="w-32">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-300" 
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{project.progress}%</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{project.team}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{project.deadline}</td>
                          <td className="px-4 py-3">{getPriorityBadge(project.priority)}</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}