"use client"

import { z } from "zod"

export interface Company {
  id: string
  companyNameEn: string
  companyNameBn: string
  addressEn: string
  addressBn: string
  phone: string
  emailAddress: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export const companySchema = z.object({
  companyNameEn: z.string().min(2, "Company Name (English) must be at least 2 characters"),
  companyNameBn: z.string().optional(),
  addressEn: z.string().min(5, "Address (English) must be at least 5 characters"),
  addressBn: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  emailAddress: z.string().email("Invalid email address"),
  status: z.enum(["active", "inactive"]).default("active").optional(),
})

export type CompanyFormData = z.infer<typeof companySchema>

const mockCompanies: Company[] = [
  {
    id: "1",
    companyNameEn: "Acme Corporation",
    companyNameBn: "একমি কর্পোরেশন",
    addressEn: "123 Business Avenue, Suite 400, San Francisco, CA 94105",
    addressBn: "১২৩ ব্যবসায়িক এভेनিউ, সুট ৪০০, সান ফ্রানসিস্কো, সিএ ৯৪১০৫",
    phone: "+1 (555) 123-4567",
    emailAddress: "info@acmecorp.com",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    companyNameEn: "TechStart Inc.",
    companyNameBn: "টেকস্টার্ট ইনকর্পোরেটেড",
    addressEn: "456 Innovation Drive, Austin, TX 78701",
    addressBn: "৪৫৬ ইনোভেশন ড্রাইভ, অস্টিন, টেক্সাস ৭৮৭০১",
    phone: "+1 (555) 987-6543",
    emailAddress: "contact@techstart.io",
    status: "active",
    createdAt: "2024-02-20T14:30:00Z",
    updatedAt: "2024-02-20T14:30:00Z",
  },
  {
    id: "3",
    companyNameEn: "Global Solutions Ltd.",
    companyNameBn: "গ্লোবাল সলিউশনস লিমিটেড",
    addressEn: "789 Commerce Street, London EC2A 4AY, UK",
    addressBn: "৭৮৯ কমার্স স্ট্রিট, লন্ডন EC2A 4AY, ইউকে",
    phone: "+44 20 7946 0958",
    emailAddress: "hello@globalsolutions.com",
    status: "inactive",
    createdAt: "2024-03-10T09:15:00Z",
    updatedAt: "2024-03-10T09:15:00Z",
  },
]

let companies = [...mockCompanies]
let nextId = 4

export function getCompanies(): Company[] {
  return companies
}

export function getCompany(id: string): Company | undefined {
  return companies.find((c) => c.id === id)
}

export function createCompany(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Company {
  const now = new Date().toISOString()
  const newCompany: Company = {
    ...data,
    id: String(nextId++),
    createdAt: now,
    updatedAt: now,
  }
  companies.push(newCompany)
  return newCompany
}

export function updateCompany(id: string, data: Partial<Company>): Company | null {
  const index = companies.findIndex((c) => c.id === id)
  if (index === -1) return null
  companies[index] = { ...companies[index], ...data, updatedAt: new Date().toISOString() }
  return companies[index]
}

export function deleteCompany(id: string): boolean {
  const index = companies.findIndex((c) => c.id === id)
  if (index === -1) return false
  companies.splice(index, 1)
  return true
}

export const statusOptions: { value: "active" | "inactive"; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]