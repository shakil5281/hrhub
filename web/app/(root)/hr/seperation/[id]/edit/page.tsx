"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { UserXIcon } from "lucide-react"
import { SeparationForm } from "@/components/form/separation-form"
import { updateSeparation, getSeparation, SeparationFormData } from "@/components/data/separation-data"

export default function EditSeparationPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const handleSuccess = (data: SeparationFormData) => { updateSeparation(id, data); router.push("/hr/seperation") }
  const separation = getSeparation(id)

  if (!separation) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Separation Not Found</h1>
          <p className="text-muted-foreground mt-1">The requested separation does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <UserXIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Separation</h1>
          <p className="text-muted-foreground mt-1">Update employee separation record</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <SeparationForm
          initialData={{
            employee: separation.employee, employeeCode: separation.employeeCode,
            department: separation.department, type: separation.type,
            date: separation.date, status: separation.status, reason: separation.reason,
          }}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/hr/seperation")}
          isEditing separationId={id}
        />
      </div>
    </div>
  )
}
