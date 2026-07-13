"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ClipboardListIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  requirementSchema, RequirementFormData, getRequirement,
  departmentOptions, statusOptions, priorityOptions, positionOptions,
} from "./requirement-data"

interface RequirementFormProps {
  initialData?: Partial<RequirementFormData>
  onSuccess: (data: RequirementFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  requirementId?: number
}

export function RequirementForm({ initialData, onSuccess, onCancel, isEditing = false, requirementId }: RequirementFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RequirementFormData>({
    resolver: zodResolver(requirementSchema),
    defaultValues: {
      position: "",
      department: "",
      vacancies: 1,
      applicants: 0,
      status: "Open",
      priority: "Medium",
      description: "",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (requirementId && isEditing) {
      setIsLoading(true)
      const req = getRequirement(requirementId)
      if (req) {
        reset({
          position: req.position,
          department: req.department,
          vacancies: req.vacancies,
          applicants: req.applicants,
          status: req.status,
          priority: req.priority,
          description: req.description,
        })
      }
      setIsLoading(false)
    }
  }, [requirementId, isEditing, reset])

  const onSubmit = async (data: RequirementFormData) => {
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
        <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardListIcon className="h-5 w-5" /> Requirement Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="position">Position *</Label>
              <select id="position" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("position")}>
                <option value="">Select position</option>
                {positionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("department")}>
                <option value="">Select department</option>
                {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="vacancies">Vacancies *</Label>
              <Input id="vacancies" type="number" min={1} {...register("vacancies", { valueAsNumber: true })} aria-invalid={!!errors.vacancies} />
              {errors.vacancies && <p className="text-sm text-destructive">{errors.vacancies.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicants">Applicants</Label>
              <Input id="applicants" type="number" min={0} {...register("applicants", { valueAsNumber: true })} aria-invalid={!!errors.applicants} />
              {errors.applicants && <p className="text-sm text-destructive">{errors.applicants.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <select id="priority" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("priority")}>
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("status")}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register("description")} />
            </div>
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
