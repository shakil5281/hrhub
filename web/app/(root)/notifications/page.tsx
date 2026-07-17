"use client"

import * as React from "react"
import { BellIcon, CheckCheckIcon, InfoIcon, AlertTriangleIcon, AlertCircleIcon, XIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  title: string
  description: string
  time: string
  type: "info" | "warning" | "error" | "success"
  read: boolean
}

const initialNotifications: Notification[] = [
  { id: "1", title: "New employee added", description: "John Doe has been added to Engineering department", time: "5 min ago", type: "info", read: false },
  { id: "2", title: "Leave request pending", description: "Sarah Chen requested 3 days annual leave", time: "1 hour ago", type: "warning", read: false },
  { id: "3", title: "Attendance alert", description: "5 employees missed punch today", time: "3 hours ago", type: "error", read: false },
  { id: "4", title: "Salary processed", description: "April salary has been processed successfully", time: "1 day ago", type: "success", read: true },
  { id: "5", title: "Shift updated", description: "Night shift timing has been changed", time: "2 days ago", type: "info", read: true },
  { id: "6", title: "Overtime approved", description: "Your overtime request for last week has been approved", time: "3 days ago", type: "success", read: true },
]

const typeConfig = {
  info: { icon: InfoIcon, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30" },
  warning: { icon: AlertTriangleIcon, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30" },
  error: { icon: AlertCircleIcon, color: "text-red-500 bg-red-50 dark:bg-red-950/30" },
  success: { icon: CheckCheckIcon, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" },
}

type FilterTab = "all" | "unread" | "read"

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState(initialNotifications)
  const [filter, setFilter] = React.useState<FilterTab>("all")

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    if (filter === "read") return n.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BellIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with the latest activities
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCheckIcon className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterTab)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-1.5 text-[10px] px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="mt-4">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12">
                <BellIcon className="h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {filter === "all"
                    ? "No notifications yet"
                    : filter === "unread"
                      ? "All caught up! No unread notifications"
                      : "No read notifications"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((n) => {
                const config = typeConfig[n.type]
                const Icon = config.icon
                return (
                  <Card
                    key={n.id}
                    className={cn(
                      "transition-colors",
                      !n.read && "border-l-2 border-l-primary bg-muted/30"
                    )}
                  >
                    <CardContent className="flex items-start gap-3 p-4">
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          config.color
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                          <Badge
                            variant={
                              n.type === "error"
                                ? "destructive"
                                : n.type === "warning"
                                  ? "secondary"
                                  : n.type === "success"
                                    ? "default"
                                    : "outline"
                            }
                            className="text-[10px] capitalize ml-auto"
                          >
                            {n.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {n.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {n.time}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => markAsRead(n.id)}
                          >
                            <CheckCheckIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => dismiss(n.id)}
                        >
                          <XIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
