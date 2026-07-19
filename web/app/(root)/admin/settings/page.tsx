"use client"

import * as React from "react"
import { SettingsIcon, Building2Icon, ShieldCheckIcon, BellIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { settingsApi } from "@/lib/api"

const defaultSettings: Record<string, string> = {
  company_name: "HRHub Technologies Ltd.",
  company_email: "info@hrhub.com",
  company_phone: "+880 1700-000000",
  company_address: "Dhaka, Bangladesh",
  min_password_length: "12",
  token_expiry_hours: "24",
  session_timeout_minutes: "60",
  leave_approval_method: "email",
  attendance_alert_method: "email + push",
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = React.useState<Record<string, string>>(defaultSettings)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    settingsApi.list()
      .then(({ data }) => {
        if (data?.data) setSettings({ ...defaultSettings, ...data.data })
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false))
  }, [])

  const update = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await settingsApi.update({ settings })
      toast.success("Settings saved")
    } catch {
      toast.error("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage system configuration</p>
        </div>
      </div>

      <div className="px-4 lg:px-6 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2Icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Company</CardTitle>
                <CardDescription>Basic company information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input id="company_name" value={settings.company_name || ""} onChange={(e) => update("company_name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_email">Email</Label>
                <Input id="company_email" type="email" value={settings.company_email || ""} onChange={(e) => update("company_email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_phone">Phone</Label>
                <Input id="company_phone" value={settings.company_phone || ""} onChange={(e) => update("company_phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_address">Address</Label>
                <Input id="company_address" value={settings.company_address || ""} onChange={(e) => update("company_address", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Security</CardTitle>
                <CardDescription>Authentication and password policies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="min_password_length">Min Password Length</Label>
                <Input id="min_password_length" type="number" value={settings.min_password_length || ""} onChange={(e) => update("min_password_length", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token_expiry_hours">Token Expiry (hours)</Label>
                <Input id="token_expiry_hours" type="number" value={settings.token_expiry_hours || ""} onChange={(e) => update("token_expiry_hours", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session_timeout_minutes">Session Timeout (min)</Label>
                <Input id="session_timeout_minutes" type="number" value={settings.session_timeout_minutes || ""} onChange={(e) => update("session_timeout_minutes", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BellIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="leave_approval_method">Leave Approval</Label>
                <Input id="leave_approval_method" value={settings.leave_approval_method || ""} onChange={(e) => update("leave_approval_method", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance_alert_method">Attendance Alerts</Label>
                <Input id="attendance_alert_method" value={settings.attendance_alert_method || ""} onChange={(e) => update("attendance_alert_method", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  )
}
