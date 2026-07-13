"use client"

import { useRouter } from "next/navigation"
import { IdCardIcon } from "lucide-react"
import { IdCardForm } from "@/components/id-card-form"
import { createIdCard, IdCardFormData } from "@/components/id-card-data"

export default function CreateIdCardPage() {
  const router = useRouter()
  const handleSuccess = (data: IdCardFormData) => { createIdCard(data); router.push("/hr/id-card") }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <IdCardIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create ID Card</h1>
          <p className="text-muted-foreground mt-1">Issue a new ID card to an employee</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <IdCardForm onSuccess={handleSuccess} onCancel={() => router.back()} />
      </div>
    </div>
  )
}
