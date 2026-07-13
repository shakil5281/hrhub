"use client"

import { z } from "zod"

export interface Organization {
  id: number
  department: string
  section: string
  designation: string
  line: string
}

export const organizationSchema = z.object({
  department: z.string().min(1, "Department is required"),
  section: z.string().min(1, "Section is required"),
  designation: z.string().min(1, "Designation is required"),
  line: z.string().min(1, "Line is required"),
})

export type OrganizationFormData = z.infer<typeof organizationSchema>

const mockData: Organization[] = [
  { id: 1, department: "Production", section: "Section-A", designation: "Senior Operator", line: "Line-1" },
  { id: 2, department: "Production", section: "Section-A", designation: "Senior Operator", line: "Line-2" },
  { id: 3, department: "Production", section: "Section-A", designation: "Operator", line: "Line-1" },
  { id: 4, department: "Production", section: "Section-A", designation: "Supervisor", line: "Line-1" },
  { id: 5, department: "Production", section: "Section-B", designation: "Operator", line: "Line-2" },
  { id: 6, department: "Production", section: "Section-B", designation: "Senior Operator", line: "Line-3" },
  { id: 7, department: "Admin", section: "Section-B", designation: "Manager", line: "Line-2" },
  { id: 8, department: "Admin", section: "Section-B", designation: "Assistant", line: "Line-2" },
  { id: 9, department: "Admin", section: "Section-B", designation: "Executive", line: "Line-2" },
  { id: 10, department: "IT", section: "Section-C", designation: "Software Developer", line: "Line-1" },
  { id: 11, department: "IT", section: "Section-C", designation: "Software Developer", line: "Line-3" },
  { id: 12, department: "IT", section: "Section-C", designation: "Support Engineer", line: "Line-1" },
  { id: 13, department: "QC", section: "Section-D", designation: "QC Inspector", line: "Line-2" },
  { id: 14, department: "QC", section: "Section-D", designation: "QC Inspector", line: "Line-5" },
  { id: 15, department: "QC", section: "Section-D", designation: "Supervisor", line: "Line-5" },
  { id: 16, department: "Finance", section: "Section-E", designation: "Accountant", line: "Line-3" },
  { id: 17, department: "Finance", section: "Section-E", designation: "Accountant", line: "Line-2" },
  { id: 18, department: "Finance", section: "Section-E", designation: "Manager", line: "Line-2" },
  { id: 19, department: "Security", section: "Section-A", designation: "Security Guard", line: "Line-1" },
  { id: 20, department: "Security", section: "Section-A", designation: "Security Guard", line: "Line-2" },
  { id: 21, department: "HR", section: "Section-A", designation: "HR Executive", line: "Line-1" },
  { id: 22, department: "HR", section: "Section-A", designation: "Manager", line: "Line-1" },
  { id: 23, department: "Cleaning", section: "Section-C", designation: "Cleaner", line: "Line-3" },
  { id: 24, department: "Logistics", section: "Section-D", designation: "Driver", line: "Line-3" },
  { id: 25, department: "Logistics", section: "Section-D", designation: "Store Keeper", line: "Line-2" },
]

let data = [...mockData]
let nextId = 26

export function getOrganizations(): Organization[] { return data }
export function getOrganization(id: number): Organization | undefined { return data.find((d) => d.id === id) }

export function createOrganization(form: OrganizationFormData): Organization {
  const item: Organization = { ...form, id: nextId++ }
  data.push(item)
  return item
}

export function updateOrganization(id: number, form: Partial<OrganizationFormData>): Organization | null {
  const index = data.findIndex((d) => d.id === id)
  if (index === -1) return null
  data[index] = { ...data[index], ...form }
  return data[index]
}

export function deleteOrganization(id: number): boolean {
  const index = data.findIndex((d) => d.id === id)
  if (index === -1) return false
  data.splice(index, 1)
  return true
}

export const departmentOptions = ["Production", "Admin", "IT", "QC", "Security", "Cleaning", "Finance", "Logistics", "HR"].map((v) => ({ value: v, label: v }))
export const sectionOptions = ["Section-A", "Section-B", "Section-C", "Section-D", "Section-E"].map((v) => ({ value: v, label: v }))
export const designationOptions = ["Senior Operator", "Operator", "Supervisor", "Manager", "Software Developer", "Support Engineer", "QC Inspector", "Security Guard", "Cleaner", "Accountant", "Driver", "Store Keeper", "HR Executive", "Executive", "Assistant"].map((v) => ({ value: v, label: v }))
export const lineOptions = ["Line-1", "Line-2", "Line-3", "Line-4", "Line-5"].map((v) => ({ value: v, label: v }))
