"use client"

import { z } from "zod"

export interface Requirement {
  id: number
  position: string
  department: string
  vacancies: number
  applicants: number
  status: "Open" | "Closed"
  priority: "High" | "Medium" | "Low"
  description: string
}

export const requirementSchema = z.object({
  position: z.string().min(2, "Position is required"),
  department: z.string().min(1, "Department is required"),
  vacancies: z.number().min(1, "At least 1 vacancy"),
  applicants: z.number().min(0, "Must be 0 or more"),
  status: z.enum(["Open", "Closed"]),
  priority: z.enum(["High", "Medium", "Low"]),
  description: z.string().optional(),
})

export type RequirementFormData = z.infer<typeof requirementSchema>

const mockRequirements: Requirement[] = [
  { id: 1, position: "Senior Operator", department: "Production", vacancies: 5, applicants: 12, status: "Open", priority: "High", description: "Need experienced operators for night shift" },
  { id: 2, position: "Accountant", department: "Finance", vacancies: 2, applicants: 8, status: "Open", priority: "Medium", description: "CMA preferred" },
  { id: 3, position: "Security Guard", department: "Security", vacancies: 3, applicants: 15, status: "Open", priority: "High", description: "Retired army personnel preferred" },
  { id: 4, position: "Cleaner", department: "Cleaning", vacancies: 4, applicants: 6, status: "Open", priority: "Low", description: "" },
  { id: 5, position: "IT Support", department: "IT", vacancies: 1, applicants: 10, status: "Closed", priority: "Medium", description: "Position filled" },
  { id: 6, position: "HR Executive", department: "HR", vacancies: 1, applicants: 20, status: "Open", priority: "High", description: "3+ years experience required" },
  { id: 7, position: "Quality Inspector", department: "QC", vacancies: 2, applicants: 5, status: "Open", priority: "Medium", description: "" },
  { id: 8, position: "Store Keeper", department: "Logistics", vacancies: 1, applicants: 4, status: "Open", priority: "Low", description: "" },
]

let requirements = [...mockRequirements]
let nextId = 9

export function getRequirements(): Requirement[] {
  return requirements
}

export function getRequirement(id: number): Requirement | undefined {
  return requirements.find((r) => r.id === id)
}

export function createRequirement(data: RequirementFormData): Requirement {
  const req: Requirement = { ...data, description: data.description || "", id: nextId++ }
  requirements.push(req)
  return req
}

export function updateRequirement(id: number, data: Partial<RequirementFormData>): Requirement | null {
  const index = requirements.findIndex((r) => r.id === id)
  if (index === -1) return null
  requirements[index] = { ...requirements[index], ...data, description: data.description ?? requirements[index].description }
  return requirements[index]
}

export function deleteRequirement(id: number): boolean {
  const index = requirements.findIndex((r) => r.id === id)
  if (index === -1) return false
  requirements.splice(index, 1)
  return true
}

export const departmentOptions = [
  "Production", "Admin", "IT", "QC", "Security", "Cleaning", "Finance", "Logistics", "HR", "Sales", "Marketing",
].map((v) => ({ value: v, label: v }))

export const statusOptions = [
  { value: "Open" as const, label: "Open" },
  { value: "Closed" as const, label: "Closed" },
]

export const priorityOptions = [
  { value: "High" as const, label: "High" },
  { value: "Medium" as const, label: "Medium" },
  { value: "Low" as const, label: "Low" },
]

export const positionOptions = [
  "Senior Operator", "Operator", "Supervisor", "Manager", "Software Developer", "QC Inspector",
  "Security Guard", "Cleaner", "Accountant", "Driver", "HR Executive", "Executive", "Assistant",
  "Store Keeper", "IT Support", "Quality Inspector",
].map((v) => ({ value: v, label: v }))
