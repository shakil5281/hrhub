"use client"

import { useRouter } from "next/navigation"
import { BuildingIcon } from "lucide-react"
import { OrganizationForm } from "@/components/organization-form"
import { createOrganization, OrganizationFormData } from "@/components/organization-data"

export default function CreateOrganizationPage() {
  const router = useRouter()
  const handleSuccess = (data: OrganizationFormData) => { createOrganization(data); router.push("/information/organization") }
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <BuildingIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Entry</h1>
          <p className="text-muted-foreground mt-1">Add a new organization structure entry</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <OrganizationForm onSuccess={handleSuccess} onCancel={() => router.back()} />
      </div>
    </div>
  )
}
