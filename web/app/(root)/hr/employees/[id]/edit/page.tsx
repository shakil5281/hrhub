"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { UsersIcon } from "lucide-react"
import { EmployeeForm } from "@/components/employee-form"
import { updateEmployee, getEmployee, EmployeeFormData } from "@/components/employee-data"

export default function EditEmployeePage() {
  const router = useRouter()
  const params = useParams()
  const id = Number(params.id)

  const handleSuccess = (data: EmployeeFormData) => {
    updateEmployee(id, data)
    router.push("/hr/employees")
  }

  const employee = getEmployee(id)

  if (!employee) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Employee Not Found</h1>
          <p className="text-muted-foreground mt-1">The requested employee does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6 flex items-center gap-2">
        <UsersIcon className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Employee</h1>
          <p className="text-muted-foreground mt-1">Update employee information</p>
        </div>
      </div>
      <div className="px-4 lg:px-6">
        <EmployeeForm
          initialData={{
            nameEn: employee.nameEn, nameBn: employee.nameBn, fatherName: employee.fatherName, motherName: employee.motherName,
            dob: employee.dob, gender: employee.gender, bloodGroup: employee.bloodGroup, maritalStatus: employee.maritalStatus,
            nationality: employee.nationality, nid: employee.nid,
            phone: employee.phone, email: employee.email, presentAddress: employee.presentAddress, permanentAddress: employee.permanentAddress,
            employeeCode: employee.employeeCode, designation: employee.designation, department: employee.department,
            joiningDate: employee.joiningDate, shift: employee.shift, grade: employee.grade, section: employee.section,
            bankName: employee.bankName, bankAccount: employee.bankAccount, bankBranch: employee.bankBranch,
            basicSalary: employee.basicSalary, houseRent: employee.houseRent, medicalAllowance: employee.medicalAllowance,
            transportAllowance: employee.transportAllowance, status: employee.status,
          }}
          onSuccess={handleSuccess}
          onCancel={() => router.push("/hr/employees")}
          isEditing
          employeeId={id}
        />
      </div>
    </div>
  )
}
