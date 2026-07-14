"use client"

import * as React from "react"
import { format } from "date-fns"
import { DatabaseIcon, Loader2, RefreshCw, DownloadIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { dataLogApi } from "@/lib/api"

export default function LogCollectPage() {
  const [importing, setImporting] = React.useState(false)
  const [fetching, setFetching] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date | undefined>()
  const [endDate, setEndDate] = React.useState<Date | undefined>()
  const [todayCount, setTodayCount] = React.useState(0)

  const fetchStats = async () => {
    try {
      const { data } = await dataLogApi.stats()
      setTodayCount(data.today_logs || 0)
    } catch {
      // ignore
    }
  }

  React.useEffect(() => {
    fetchStats()
  }, [])

  const handleImport = async () => {
    setImporting(true)
    try {
      const body: Record<string, string> = {}
      if (startDate) body.start_date = format(startDate, "yyyy-MM-dd")
      if (endDate) body.end_date = format(endDate, "yyyy-MM-dd")
      const { data } = await dataLogApi.import(body)
      toast.success(`Imported ${data.imported || 0} records`)
      fetchStats()
    } catch {
      toast.error("Failed to import data logs")
    } finally {
      setImporting(false)
    }
  }

  const handleFetch = async () => {
    setFetching(true)
    try {
      const params: Record<string, string> = {}
      if (startDate) params.start = format(startDate, "yyyy-MM-dd")
      if (endDate) params.end = format(endDate, "yyyy-MM-dd")
      const { data } = await dataLogApi.list(params)
      const count = Array.isArray(data) ? data.length : 0
      toast.success(`Found ${count} log records`)
    } catch {
      toast.error("Failed to fetch data logs")
    } finally {
      setFetching(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    try {
      await dataLogApi.deleteAll()
      toast.success("All data logs deleted permanently")
      setTodayCount(0)
    } catch {
      toast.error("Failed to delete data logs")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DatabaseIcon className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Log Collect</h1>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today&apos;s Collected Logs</p>
                <p className="text-3xl font-bold">{todayCount}</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2Icon className="mr-2 h-4 w-4" />
                    Delete All
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all data logs from the database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll} disabled={deleting}>
                      {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">Start Date</label>
                <DatePicker value={startDate} onChange={setStartDate} placeholder="Start date" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">End Date</label>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="End date" />
              </div>
              <Button onClick={handleImport} disabled={importing}>
                {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DownloadIcon className="mr-2 h-4 w-4" />}
                Import from MDB
              </Button>
              <Button variant="outline" onClick={handleFetch} disabled={fetching}>
                {fetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Fetch Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
