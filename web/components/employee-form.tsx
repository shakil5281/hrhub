"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, UserIcon, PhoneIcon, BriefcaseIcon, BanknoteIcon, BuildingIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  employeeSchema, EmployeeFormData, getEmployee,
  genderOptions, bloodGroupOptions, maritalStatusOptions,
  departmentOptions, designationOptions, shiftOptionsList,
  gradeOptions, sectionOptions, statusOptionsEmployee,
} from "./employee-data"

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>
  onSuccess: (data: EmployeeFormData) => void
  onCancel?: () => void
  isEditing?: boolean
  employeeId?: number
}

export function EmployeeForm({ initialData, onSuccess, onCancel, isEditing = false, employeeId }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nameEn: "", nameBn: "", fatherName: "", motherName: "", dob: "", gender: "Male",
      bloodGroup: "A+", maritalStatus: "Single", nationality: "Bangladeshi", nid: "",
      phone: "", email: "", presentAddress: "", permanentAddress: "",
      employeeCode: "", designation: "", department: "", joiningDate: "", shift: "General Shift",
      grade: "Grade-3", section: "Section-A",
      bankName: "", bankAccount: "", bankBranch: "",
      basicSalary: 0, houseRent: 0, medicalAllowance: 0, transportAllowance: 0,
      status: "Active",
      ...initialData,
    },
  })

  React.useEffect(() => {
    if (employeeId && isEditing) {
      setIsLoading(true)
      const emp = getEmployee(employeeId)
      if (emp) {
        reset({
          nameEn: emp.nameEn, nameBn: emp.nameBn, fatherName: emp.fatherName, motherName: emp.motherName,
          dob: emp.dob, gender: emp.gender, bloodGroup: emp.bloodGroup, maritalStatus: emp.maritalStatus,
          nationality: emp.nationality, nid: emp.nid,
          phone: emp.phone, email: emp.email, presentAddress: emp.presentAddress, permanentAddress: emp.permanentAddress,
          employeeCode: emp.employeeCode, designation: emp.designation, department: emp.department,
          joiningDate: emp.joiningDate, shift: emp.shift, grade: emp.grade, section: emp.section,
          bankName: emp.bankName, bankAccount: emp.bankAccount, bankBranch: emp.bankBranch,
          basicSalary: emp.basicSalary, houseRent: emp.houseRent, medicalAllowance: emp.medicalAllowance,
          transportAllowance: emp.transportAllowance, status: emp.status,
        })
      }
      setIsLoading(false)
    }
  }, [employeeId, isEditing, reset])

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 500))
    onSuccess(data)
    setIsSubmitting(false)
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon className="h-5 w-5" /> Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nameEn">Name (English) *</Label>
              <Input id="nameEn" {...register("nameEn")} aria-invalid={!!errors.nameEn} />
              {errors.nameEn && <p className="text-sm text-destructive">{errors.nameEn.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameBn">Name (Bengali)</Label>
              <Input id="nameBn" className="bangla-input" {...register("nameBn")} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fatherName">Father's Name *</Label>
              <Input id="fatherName" {...register("fatherName")} aria-invalid={!!errors.fatherName} />
              {errors.fatherName && <p className="text-sm text-destructive">{errors.fatherName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName">Mother's Name *</Label>
              <Input id="motherName" {...register("motherName")} aria-invalid={!!errors.motherName} />
              {errors.motherName && <p className="text-sm text-destructive">{errors.motherName.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input id="dob" type="date" {...register("dob")} aria-invalid={!!errors.dob} />
              {errors.dob && <p className="text-sm text-destructive">{errors.dob.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <select id="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("gender")}>
                {genderOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <select id="bloodGroup" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("bloodGroup")}>
                {bloodGroupOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status *</Label>
              <select id="maritalStatus" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("maritalStatus")}>
                {maritalStatusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality *</Label>
              <Input id="nationality" {...register("nationality")} aria-invalid={!!errors.nationality} />
              {errors.nationality && <p className="text-sm text-destructive">{errors.nationality.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="nid">NID / Passport *</Label>
              <Input id="nid" {...register("nid")} aria-invalid={!!errors.nid} />
              {errors.nid && <p className="text-sm text-destructive">{errors.nid.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><PhoneIcon className="h-5 w-5" /> Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" {...register("phone")} aria-invalid={!!errors.phone} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="presentAddress">Present Address *</Label>
            <textarea id="presentAddress" className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("presentAddress")} aria-invalid={!!errors.presentAddress} />
            {errors.presentAddress && <p className="text-sm text-destructive">{errors.presentAddress.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="permanentAddress">Permanent Address *</Label>
            <textarea id="permanentAddress" className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("permanentAddress")} aria-invalid={!!errors.permanentAddress} />
            {errors.permanentAddress && <p className="text-sm text-destructive">{errors.permanentAddress.message}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BriefcaseIcon className="h-5 w-5" /> Employment Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code *</Label>
              <Input id="employeeCode" {...register("employeeCode")} aria-invalid={!!errors.employeeCode} />
              {errors.employeeCode && <p className="text-sm text-destructive">{errors.employeeCode.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date *</Label>
              <Input id="joiningDate" type="date" {...register("joiningDate")} aria-invalid={!!errors.joiningDate} />
              {errors.joiningDate && <p className="text-sm text-destructive">{errors.joiningDate.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <select id="department" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("department")}>
                {departmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <select id="designation" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("designation")}>
                {designationOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="shift">Shift *</Label>
              <select id="shift" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("shift")}>
                {shiftOptionsList.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade *</Label>
              <select id="grade" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("grade")}>
                {gradeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section *</Label>
              <select id="section" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("section")}>
                {sectionOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BuildingIcon className="h-5 w-5" /> Bank Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" {...register("bankName")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Account Number</Label>
              <Input id="bankAccount" {...register("bankAccount")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankBranch">Branch</Label>
              <Input id="bankBranch" {...register("bankBranch")} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BanknoteIcon className="h-5 w-5" /> Salary Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="basicSalary">Basic Salary *</Label>
              <Input id="basicSalary" type="number" min="0" {...register("basicSalary", { valueAsNumber: true })} aria-invalid={!!errors.basicSalary} />
              {errors.basicSalary && <p className="text-sm text-destructive">{errors.basicSalary.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="houseRent">House Rent *</Label>
              <Input id="houseRent" type="number" min="0" {...register("houseRent", { valueAsNumber: true })} aria-invalid={!!errors.houseRent} />
              {errors.houseRent && <p className="text-sm text-destructive">{errors.houseRent.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medicalAllowance">Medical Allowance *</Label>
              <Input id="medicalAllowance" type="number" min="0" {...register("medicalAllowance", { valueAsNumber: true })} aria-invalid={!!errors.medicalAllowance} />
              {errors.medicalAllowance && <p className="text-sm text-destructive">{errors.medicalAllowance.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="transportAllowance">Transport Allowance *</Label>
              <Input id="transportAllowance" type="number" min="0" {...register("transportAllowance", { valueAsNumber: true })} aria-invalid={!!errors.transportAllowance} />
              {errors.transportAllowance && <p className="text-sm text-destructive">{errors.transportAllowance.message}</p>}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...register("status")}>
                {statusOptionsEmployee.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4 pt-4 border-t">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? "Update Employee" : "Create Employee"}
        </Button>
      </div>
    </form>
  )
}
