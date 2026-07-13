"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { BuildingIcon } from "lucide-react"
import { OrganizationForm } from "@/components/organization-form"
import { updateOrganization, getOrganization, OrganizationFormData } from "@/components/organization-data"

export default function EditOrganizationPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const handleSuccess = (data: OrganizationFormData) => { updateOrganization(id, data); router.push("/information/organization") }
  const item = getOrganization(id)

  if (!item) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Entry Not Found</h1>
          <p className="text-muted-foreground mt-1">The requested entry does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <BuildingIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Entry</h1>
          <p className="text-muted-foreground mt-1">Update organization structure entry</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <OrganizationForm initialData={{ department: item.department, section: item.section, designation: item.designation, line: item.line }} onSuccess={handleSuccess} onCancel={() => router.push("/information/organization")} isEditing orgId={id} />
      </div>
    </div>
  )
}
