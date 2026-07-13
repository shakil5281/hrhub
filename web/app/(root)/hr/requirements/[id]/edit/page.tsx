"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ClipboardListIcon } from "lucide-react"
import { RequirementForm } from "@/components/requirement-form"
import { updateRequirement, getRequirement, RequirementFormData } from "@/components/requirement-data"

export default function EditRequirementPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const handleSuccess = (data: RequirementFormData) => {
    updateRequirement(id, data)
    router.push("/hr/requirements")
  }

  const requirement = getRequirement(id)

  if (!requirement) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Requirement Not Found</h1>
          <p className="text-muted-foreground mt-1">The requested requirement does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <ClipboardListIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Requirement</h1>
          <p className="text-muted-foreground mt-1">Update recruitment requirement</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <RequirementForm
          initialData={{
            position: requirement.position,
            department: requirement.department,
            vacancies: requirement.vacancies,
            applicants: requirement.applicants,
            status: requirement.status,
            priority: requirement.priority,
            description: requirement.description,
          }}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/hr/requirements")}
          isEditing
          requirementId={id}
        />
      </div>
    </div>
  )
}
