"use client"

import * as React from "react"
import {
  SettingsIcon,
  BellIcon,
  MailIcon,
  SmartphoneIcon,
  GlobeIcon,
  MoonIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Notification Preferences</CardTitle>
          </div>
          <CardDescription>Choose how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MailIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Email Notifications</h3>
            </div>
            <div className="ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Leave requests</Label>
                  <p className="text-xs text-muted-foreground">When an employee requests leave</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Attendance alerts</Label>
                  <p className="text-xs text-muted-foreground">Daily attendance summary and alerts</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Employee updates</Label>
                  <p className="text-xs text-muted-foreground">New hires, terminations, and changes</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SmartphoneIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Push Notifications</h3>
            </div>
            <div className="ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Real-time alerts</Label>
                  <p className="text-xs text-muted-foreground">Instant notifications in browser</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Overtime approvals</Label>
                  <p className="text-xs text-muted-foreground">When overtime is approved or rejected</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">System updates</Label>
                  <p className="text-xs text-muted-foreground">Maintenance and feature updates</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">In-App Notifications</h3>
            </div>
            <div className="ml-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Show in notification center</Label>
                  <p className="text-xs text-muted-foreground">Display notifications in the app</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Sound alerts</Label>
                  <p className="text-xs text-muted-foreground">Play sound for new notifications</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-normal">Desktop notifications</Label>
                  <p className="text-xs text-muted-foreground">Show native OS notifications</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MoonIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Dark Mode</Label>
              <p className="text-sm text-muted-foreground">Use dark theme across the app</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Privacy & Security</CardTitle>
          </div>
          <CardDescription>Manage your security preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Two-factor authentication</Label>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Login notifications</Label>
              <p className="text-sm text-muted-foreground">Alert on new device login</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
