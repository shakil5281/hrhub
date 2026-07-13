"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Building2, MapPin, Mail, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { companySchema, CompanyFormData, statusOptions, getCompany } from "./company-data"

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>
  onSuccess: (data: CompanyFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  companyId?: string
}

export function CompanyForm({ initialData, onSuccess, onCancel, isEditing = false, companyId }: CompanyFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyNameEn: "",
      companyNameBn: "",
      addressEn: "",
      addressBn: "",
      phone: "",
      emailAddress: "",
      status: "active",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (companyId && isEditing) {
      setIsLoading(true)
      const company = getCompany(companyId)
      if (company) {
        reset({
          companyNameEn: company.companyNameEn,
          companyNameBn: company.companyNameBn,
          addressEn: company.addressEn,
          addressBn: company.addressBn,
          phone: company.phone,
          emailAddress: company.emailAddress,
          status: company.status,
        })
      }
      setIsLoading(false)
    }
  }, [companyId, isEditing, reset])

  const onSubmit = async (data: CompanyFormData) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    onSuccess(data)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyNameEn">Company Name (English) *</Label>
              <Input
                id="companyNameEn"
                placeholder="Acme Corporation"
                {...register("companyNameEn")}
                aria-invalid={!!errors.companyNameEn}
              />
              {errors.companyNameEn && <p className="text-sm text-destructive">{errors.companyNameEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyNameBn">Company Name (Bengali)</Label>
              <Input
                id="companyNameBn"
                placeholder="Company Name (Bengali)"
                className="bangla-input"
                {...register("companyNameBn")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="addressEn">Address (English) *</Label>
            <textarea
              id="addressEn"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="123 Business Avenue, Suite 400, San Francisco, CA 94105"
              {...register("addressEn")}
              aria-invalid={!!errors.addressEn}
            />
            {errors.addressEn && <p className="text-sm text-destructive">{errors.addressEn.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addressBn">Address (Bengali)</Label>
            <textarea
              id="addressBn"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bangla-input"
              placeholder="Address (Bengali)"
              {...register("addressBn")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emailAddress">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="emailAddress"
                  type="email"
                  placeholder="info@company.com"
                  className="pl-10"
                  {...register("emailAddress")}
                  aria-invalid={!!errors.emailAddress}
                />
              </div>
              {errors.emailAddress && <p className="text-sm text-destructive">{errors.emailAddress.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                  {...register("phone")}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <select
              id="status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("status")}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEditing ? "Update Company" : "Create Company"
          )}
        </Button>
      </div>
    </form>
  )
}