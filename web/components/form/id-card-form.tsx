"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, IdCardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  idCardSchema, IdCardFormData, getIdCard,
  departmentOptions, designationOptions, idCardStatusOptions,
} from "../data/id-card-data"

interface IdCardFormProps {
  initialData?: Partial<IdCardFormData>
  onSuccess: (data: IdCardFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  cardId?: number
}

export function IdCardForm({ initialData, onSuccess, onCancel, isEditing = false, cardId }: IdCardFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IdCardFormData>({
    resolver: zodResolver(idCardSchema),
    defaultValues: {
      employee: "", employeeCode: "", designation: "", department: "",
      cardNo: "", issued: "", expiry: "", status: "Active",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (cardId && isEditing) {
      setIsLoading(true)
      const c = getIdCard(cardId)
      if (c) reset({ employee: c.employee, employeeCode: c.employeeCode, designation: c.designation, department: c.department, cardNo: c.cardNo, issued: c.issued, expiry: c.expiry, status: c.status })
      setIsLoading(false)
    }
  }, [cardId, isEditing, reset])

  const onSubmit = async (data: IdCardFormData) => {
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
        <CardHeader><CardTitle className="flex items-center gap-2"><IdCardIcon className="h-5 w-5" /> ID Card Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee Name *</Label>
              <Input id="employee" {...register("employee")} aria-invalid={!!errors.employee} />
              {errors.employee && <p className="text-sm text-destructive">{errors.employee.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code *</Label>
              <Input id="employeeCode" {...register("employeeCode")} aria-invalid={!!errors.employeeCode} />
              {errors.employeeCode && <p className="text-sm text-destructive">{errors.employeeCode.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <select id="designation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("designation")}>
                <option value="">Select designation</option>
                {designationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.designation && <p className="text-sm text-destructive">{errors.designation.message}</p>}
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
              <Label htmlFor="cardNo">Card Number *</Label>
              <Input id="cardNo" {...register("cardNo")} aria-invalid={!!errors.cardNo} />
              {errors.cardNo && <p className="text-sm text-destructive">{errors.cardNo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="issued">Issue Date *</Label>
              <Input id="issued" type="date" {...register("issued")} aria-invalid={!!errors.issued} />
              {errors.issued && <p className="text-sm text-destructive">{errors.issued.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input id="expiry" type="date" {...register("expiry")} aria-invalid={!!errors.expiry} />
              {errors.expiry && <p className="text-sm text-destructive">{errors.expiry.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("status")}>
              {idCardStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
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
