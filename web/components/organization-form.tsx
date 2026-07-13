"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, BuildingIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  organizationSchema, OrganizationFormData, getOrganization,
  departmentOptions, sectionOptions, designationOptions, lineOptions,
} from "./organization-data"

interface OrganizationFormProps {
  initialData?: Partial<OrganizationFormData>
  onSuccess: (data: OrganizationFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  orgId?: number
}

export function OrganizationForm({ initialData, onSuccess, onCancel, isEditing = false, orgId }: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: { department: "", section: "", designation: "", line: "", ...initialData },
  })

  React.useEffect(() => {
    if (orgId && isEditing) {
      setIsLoading(true)
      const item = getOrganization(orgId)
      if (item) reset({ department: item.department, section: item.section, designation: item.designation, line: item.line })
      setIsLoading(false)
    }
  }, [orgId, isEditing, reset])

  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 300))
    onSuccess(data)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BuildingIcon className="h-5 w-5" /> Organization Structure</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("department")}>
              <option value="">Select department</option>
              {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="section">Section *</Label>
            <select id="section" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("section")}>
              <option value="">Select section</option>
              {sectionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.section && <p className="text-sm text-destructive">{errors.section.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation *</Label>
            <select id="designation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("designation")}>
              <option value="">Select designation</option>
              {designationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="line">Line *</Label>
            <select id="line" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("line")}>
              <option value="">Select line</option>
              {lineOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.line && <p className="text-sm text-destructive">{errors.line.message}</p>}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
