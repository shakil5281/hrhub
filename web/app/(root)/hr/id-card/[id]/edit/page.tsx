"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { IdCardIcon } from "lucide-react"
import { IdCardForm } from "@/components/form/id-card-form"
import { updateIdCard, getIdCard, IdCardFormData } from "@/components/data/id-card-data"

export default function EditIdCardPage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)
  const handleSuccess = (data: IdCardFormData) => { updateIdCard(id, data); router.push("/hr/id-card") }
  const card = getIdCard(id)

  if (!card) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">ID Card Not Found</h1>
          <p className="text-muted-foreground mt-1">The requested ID card does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <IdCardIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit ID Card</h1>
          <p className="text-muted-foreground mt-1">Update employee ID card details</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <IdCardForm
          initialData={{
            employee: card.employee, employeeCode: card.employeeCode,
            designation: card.designation, department: card.department,
            cardNo: card.cardNo, issued: card.issued, expiry: card.expiry, status: card.status,
          }}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/hr/id-card")}
          isEditing cardId={id}
        />
      </div>
    </div>
  )
}
