"use client"

import { z } from "zod"

export interface IdCard {
  id: number
  employee: string
  employeeCode: string
  designation: string
  department: string
  cardNo: string
  issued: string
  expiry: string
  status: "Active" | "Expired" | "Lost" | "Damaged"
}

export const idCardSchema = z.object({
  employee: z.string().min(2, "Employee name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  cardNo: z.string().min(1, "Card number is required"),
  issued: z.string().min(1, "Issue date is required"),
  expiry: z.string().min(1, "Expiry date is required"),
  status: z.enum(["Active", "Expired", "Lost", "Damaged"]),
})

export type IdCardFormData = z.infer<typeof idCardSchema>

const mockIdCards: IdCard[] = [
  { id: 1, employee: "Rafiqul Islam", employeeCode: "EMP001", designation: "Operator", department: "Production", cardNo: "ID-001", issued: "2026-01-01", expiry: "2026-12-31", status: "Active" },
  { id: 2, employee: "Shamima Akter", employeeCode: "EMP002", designation: "Supervisor", department: "Production", cardNo: "ID-002", issued: "2026-01-01", expiry: "2026-12-31", status: "Active" },
  { id: 3, employee: "Kamal Hossain", employeeCode: "EMP003", designation: "Manager", department: "Admin", cardNo: "ID-003", issued: "2026-01-01", expiry: "2026-12-31", status: "Active" },
  { id: 4, employee: "Nasrin Sultana", employeeCode: "EMP004", designation: "Developer", department: "IT", cardNo: "ID-004", issued: "2026-03-15", expiry: "2027-03-14", status: "Active" },
  { id: 5, employee: "Jahangir Alam", employeeCode: "EMP005", designation: "QC Inspector", department: "QC", cardNo: "ID-005", issued: "2026-02-01", expiry: "2026-12-31", status: "Expired" },
  { id: 6, employee: "Abdur Rahman", employeeCode: "EMP007", designation: "Security Guard", department: "Security", cardNo: "ID-006", issued: "2026-01-01", expiry: "2026-12-31", status: "Active" },
  { id: 7, employee: "Maksuda Khatun", employeeCode: "EMP008", designation: "Accountant", department: "Finance", cardNo: "ID-007", issued: "2026-04-01", expiry: "2027-03-31", status: "Active" },
  { id: 8, employee: "Shahidul Islam", employeeCode: "EMP009", designation: "Driver", department: "Logistics", cardNo: "ID-008", issued: "2026-01-01", expiry: "2026-12-31", status: "Lost" },
]

let idCards = [...mockIdCards]
let nextId = 9

export function getIdCards(): IdCard[] { return idCards }
export function getIdCard(id: number): IdCard | undefined { return idCards.find((c) => c.id === id) }

export function createIdCard(data: IdCardFormData): IdCard {
  const card: IdCard = { ...data, id: nextId++ }
  idCards.push(card)
  return card
}

export function updateIdCard(id: number, data: Partial<IdCardFormData>): IdCard | null {
  const index = idCards.findIndex((c) => c.id === id)
  if (index === -1) return null
  idCards[index] = { ...idCards[index], ...data }
  return idCards[index]
}

export function deleteIdCard(id: number): boolean {
  const index = idCards.findIndex((c) => c.id === id)
  if (index === -1) return false
  idCards.splice(index, 1)
  return true
}

export const departmentOptions = [
  "Production", "Admin", "IT", "QC", "Security", "Cleaning", "Finance", "Logistics", "HR", "Sales", "Marketing",
].map((v) => ({ value: v, label: v }))

export const designationOptions = [
  "Senior Operator", "Operator", "Supervisor", "Manager", "Software Developer", "QC Inspector",
  "Security Guard", "Cleaner", "Accountant", "Driver", "HR Executive", "Executive", "Assistant",
].map((v) => ({ value: v, label: v }))

export const idCardStatusOptions = [
  { value: "Active" as const, label: "Active" },
  { value: "Expired" as const, label: "Expired" },
  { value: "Lost" as const, label: "Lost" },
  { value: "Damaged" as const, label: "Damaged" },
]
