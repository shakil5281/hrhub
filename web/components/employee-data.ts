"use client"

import { z } from "zod"

export interface Employee {
  id: number
  // Personal
  nameEn: string
  nameBn: string
  fatherName: string
  motherName: string
  dob: string
  gender: "Male" | "Female" | "Other"
  bloodGroup: string
  maritalStatus: "Single" | "Married" | "Divorced" | "Widowed"
  nationality: string
  nid: string
  // Contact
  phone: string
  email: string
  presentAddress: string
  permanentAddress: string
  // Employment
  employeeCode: string
  designation: string
  department: string
  joiningDate: string
  shift: string
  grade: string
  section: string
  // Bank
  bankName: string
  bankAccount: string
  bankBranch: string
  // Salary
  basicSalary: number
  houseRent: number
  medicalAllowance: number
  transportAllowance: number
  // Status
  status: "Active" | "Inactive"
}

export const employeeSchema = z.object({
  nameEn: z.string().min(2, "Name (English) is required"),
  nameBn: z.string().optional(),
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["Male", "Female", "Other"]),
  bloodGroup: z.string().min(1, "Blood group is required"),
  maritalStatus: z.enum(["Single", "Married", "Divorced", "Widowed"]),
  nationality: z.string().min(2, "Nationality is required"),
  nid: z.string().min(5, "NID/Passport is required"),
  phone: z.string().min(8, "Phone is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  presentAddress: z.string().min(5, "Present address is required"),
  permanentAddress: z.string().min(5, "Permanent address is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  designation: z.string().min(2, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  joiningDate: z.string().min(1, "Joining date is required"),
  shift: z.string().min(1, "Shift is required"),
  grade: z.string().min(1, "Grade is required"),
  section: z.string().min(1, "Section is required"),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankBranch: z.string().optional(),
  basicSalary: z.number().min(0, "Must be 0 or more"),
  houseRent: z.number().min(0, "Must be 0 or more"),
  medicalAllowance: z.number().min(0, "Must be 0 or more"),
  transportAllowance: z.number().min(0, "Must be 0 or more"),
  status: z.enum(["Active", "Inactive"]),
})

export type EmployeeFormData = z.infer<typeof employeeSchema>

const mockEmployees: Employee[] = [
  {
    id: 1, nameEn: "Rafiqul Islam", nameBn: "রফিকুল ইসলাম", fatherName: "Abdul Karim", motherName: "Jahanara Begum",
    dob: "1990-05-15", gender: "Male", bloodGroup: "A+", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19901234567890123",
    phone: "01711-111111", email: "rafiqul@company.com", presentAddress: "123 Gulshan, Dhaka", permanentAddress: "Village: Uttar Para, Faridpur",
    employeeCode: "EMP001", designation: "Senior Operator", department: "Production", joiningDate: "2020-01-15", shift: "Morning Shift", grade: "Grade-3", section: "Section-A",
    bankName: "Sonali Bank", bankAccount: "SBL-123456789", bankBranch: "Gulshan Branch",
    basicSalary: 25000, houseRent: 12500, medicalAllowance: 2500, transportAllowance: 1500, status: "Active",
  },
  {
    id: 2, nameEn: "Shamima Akter", nameBn: "শামীমা আক্তার", fatherName: "Mofiz Uddin", motherName: "Saleha Khatun",
    dob: "1992-08-22", gender: "Female", bloodGroup: "B+", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19929876543210987",
    phone: "01711-111112", email: "shamima@company.com", presentAddress: "456 Banani, Dhaka", permanentAddress: "Village: Dakkhin Para, Tangail",
    employeeCode: "EMP002", designation: "Supervisor", department: "Production", joiningDate: "2019-06-01", shift: "Morning Shift", grade: "Grade-4", section: "Section-A",
    bankName: "Dutch Bangla Bank", bankAccount: "DBBL-987654321", bankBranch: "Banani Branch",
    basicSalary: 30000, houseRent: 15000, medicalAllowance: 3000, transportAllowance: 2000, status: "Active",
  },
  {
    id: 3, nameEn: "Kamal Hossain", nameBn: "কামাল হোসেন", fatherName: "Mizanur Rahman", motherName: "Rahima Khatun",
    dob: "1985-12-10", gender: "Male", bloodGroup: "O+", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19851234567890123",
    phone: "01711-111113", email: "kamal@company.com", presentAddress: "789 Dhanmondi, Dhaka", permanentAddress: "Village: Paschim Para, Kishoreganj",
    employeeCode: "EMP003", designation: "Manager", department: "Admin", joiningDate: "2018-03-20", shift: "General Shift", grade: "Grade-7", section: "Management",
    bankName: "BRAC Bank", bankAccount: "BRAC-456789123", bankBranch: "Dhanmondi Branch",
    basicSalary: 45000, houseRent: 22500, medicalAllowance: 4500, transportAllowance: 3000, status: "Active",
  },
  {
    id: 4, nameEn: "Nasrin Sultana", nameBn: "নাসরিন সুলতানা", fatherName: "Shahidul Islam", motherName: "Nasima Begum",
    dob: "1995-03-18", gender: "Female", bloodGroup: "AB+", maritalStatus: "Single", nationality: "Bangladeshi", nid: "19951234567890123",
    phone: "01711-111114", email: "nasrin@company.com", presentAddress: "321 Uttara, Dhaka", permanentAddress: "Village: Purba Para, Comilla",
    employeeCode: "EMP004", designation: "Software Developer", department: "IT", joiningDate: "2021-07-01", shift: "Flexible Shift", grade: "Grade-5", section: "Development",
    bankName: "City Bank", bankAccount: "CITY-789123456", bankBranch: "Uttara Branch",
    basicSalary: 35000, houseRent: 17500, medicalAllowance: 3500, transportAllowance: 2000, status: "Active",
  },
  {
    id: 5, nameEn: "Jahangir Alam", nameBn: "জাহাঙ্গীর আলম", fatherName: "Nurul Islam", motherName: "Shahida Begum",
    dob: "1988-07-25", gender: "Male", bloodGroup: "B-", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19881234567890123",
    phone: "01711-111115", email: "jahangir@company.com", presentAddress: "654 Mirpur, Dhaka", permanentAddress: "Village: Uttar Para, Bogura",
    employeeCode: "EMP005", designation: "QC Inspector", department: "QC", joiningDate: "2020-11-01", shift: "Day Shift", grade: "Grade-3", section: "Quality Control",
    bankName: "Agrani Bank", bankAccount: "AGB-321654987", bankBranch: "Mirpur Branch",
    basicSalary: 22000, houseRent: 11000, medicalAllowance: 2200, transportAllowance: 1500, status: "Active",
  },
  {
    id: 6, nameEn: "Farida Begum", nameBn: "ফরিদা বেগম", fatherName: "Abdur Rouf", motherName: "Ambia Khatun",
    dob: "1975-01-10", gender: "Female", bloodGroup: "A-", maritalStatus: "Widowed", nationality: "Bangladeshi", nid: "19751234567890123",
    phone: "01711-111116", email: "", presentAddress: "987 Rayer Bazar, Dhaka", permanentAddress: "Village: Dakkhin Para, Manikganj",
    employeeCode: "EMP006", designation: "Cleaner", department: "Cleaning", joiningDate: "2017-04-01", shift: "Morning Shift", grade: "Grade-1", section: "Cleaning",
    bankName: "", bankAccount: "", bankBranch: "",
    basicSalary: 8000, houseRent: 4000, medicalAllowance: 800, transportAllowance: 500, status: "Inactive",
  },
  {
    id: 7, nameEn: "Abdur Rahman", nameBn: "আব্দুর রহমান", fatherName: "Sirajul Islam", motherName: "Jahanara Bibi",
    dob: "1982-11-05", gender: "Male", bloodGroup: "O-", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19821234567890123",
    phone: "01711-111117", email: "abdur@company.com", presentAddress: "159 Mohammadpur, Dhaka", permanentAddress: "Village: Paschim Para, Natore",
    employeeCode: "EMP007", designation: "Security Guard", department: "Security", joiningDate: "2019-09-15", shift: "Night Shift", grade: "Grade-2", section: "Security",
    bankName: "Janata Bank", bankAccount: "JBL-654321987", bankBranch: "Mohammadpur Branch",
    basicSalary: 12000, houseRent: 6000, medicalAllowance: 1200, transportAllowance: 1000, status: "Active",
  },
  {
    id: 8, nameEn: "Maksuda Khatun", nameBn: "মাকসুদা খাতুন", fatherName: "Golam Mostafa", motherName: "Nurjahan Begum",
    dob: "1993-06-20", gender: "Female", bloodGroup: "AB-", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19931234567890123",
    phone: "01711-111118", email: "maksuda@company.com", presentAddress: "753 Khilgaon, Dhaka", permanentAddress: "Village: Uttar Para, Sirajganj",
    employeeCode: "EMP008", designation: "Accountant", department: "Finance", joiningDate: "2021-01-01", shift: "Day Shift", grade: "Grade-5", section: "Accounts",
    bankName: "IFIC Bank", bankAccount: "IFIC-159357456", bankBranch: "Khilgaon Branch",
    basicSalary: 28000, houseRent: 14000, medicalAllowance: 2800, transportAllowance: 2000, status: "Active",
  },
  {
    id: 9, nameEn: "Shahidul Islam", nameBn: "শাহিদুল ইসলাম", fatherName: "Motaleb Hossain", motherName: "Rashida Khatun",
    dob: "1991-09-15", gender: "Male", bloodGroup: "B+", maritalStatus: "Married", nationality: "Bangladeshi", nid: "19911234567890123",
    phone: "01711-111119", email: "shahidul@company.com", presentAddress: "246 Pallabi, Dhaka", permanentAddress: "Village: Dakkhin Para, Pabna",
    employeeCode: "EMP009", designation: "Driver", department: "Logistics", joiningDate: "2022-03-01", shift: "General Shift", grade: "Grade-2", section: "Transport",
    bankName: "Sonali Bank", bankAccount: "SBL-456789123", bankBranch: "Pallabi Branch",
    basicSalary: 15000, houseRent: 7500, medicalAllowance: 1500, transportAllowance: 1000, status: "Active",
  },
  {
    id: 10, nameEn: "Rokeya Begum", nameBn: "রোকেয়া বেগম", fatherName: "Ismail Hossain", motherName: "Fuljan Bibi",
    dob: "1994-12-01", gender: "Female", bloodGroup: "O+", maritalStatus: "Single", nationality: "Bangladeshi", nid: "19941234567890123",
    phone: "01711-111120", email: "rokeya@company.com", presentAddress: "951 Shyamoli, Dhaka", permanentAddress: "Village: Paschim Para, Rajbari",
    employeeCode: "EMP010", designation: "HR Executive", department: "HR", joiningDate: "2022-06-01", shift: "General Shift", grade: "Grade-5", section: "Human Resources",
    bankName: "Eastern Bank", bankAccount: "EBL-951753456", bankBranch: "Shyamoli Branch",
    basicSalary: 30000, houseRent: 15000, medicalAllowance: 3000, transportAllowance: 2000, status: "Active",
  },
]

let employees = [...mockEmployees]
let nextId = 11

export function getEmployees(): Employee[] {
  return employees
}

export function getEmployee(id: number): Employee | undefined {
  return employees.find((e) => e.id === id)
}

export function createEmployee(data: EmployeeFormData): Employee {
  const newEmployee: Employee = { ...data, nameBn: data.nameBn || "", email: data.email || "", bankName: data.bankName || "", bankAccount: data.bankAccount || "", bankBranch: data.bankBranch || "", id: nextId++ }
  employees.push(newEmployee)
  return newEmployee
}

export function updateEmployee(id: number, data: Partial<EmployeeFormData>): Employee | null {
  const index = employees.findIndex((e) => e.id === id)
  if (index === -1) return null
  employees[index] = { ...employees[index], ...data, nameBn: data.nameBn ?? employees[index].nameBn, email: data.email ?? employees[index].email, bankName: data.bankName ?? employees[index].bankName, bankAccount: data.bankAccount ?? employees[index].bankAccount, bankBranch: data.bankBranch ?? employees[index].bankBranch }
  return employees[index]
}

export function deleteEmployee(id: number): boolean {
  const index = employees.findIndex((e) => e.id === id)
  if (index === -1) return false
  employees.splice(index, 1)
  return true
}

export const genderOptions = [
  { value: "Male" as const, label: "Male" },
  { value: "Female" as const, label: "Female" },
  { value: "Other" as const, label: "Other" },
]

export const bloodGroupOptions = [
  { value: "A+", label: "A+" }, { value: "A-", label: "A-" },
  { value: "B+", label: "B+" }, { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" }, { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" }, { value: "O-", label: "O-" },
]

export const maritalStatusOptions = [
  { value: "Single" as const, label: "Single" },
  { value: "Married" as const, label: "Married" },
  { value: "Divorced" as const, label: "Divorced" },
  { value: "Widowed" as const, label: "Widowed" },
]

export const departmentOptions = [
  "Production", "Admin", "IT", "QC", "Security", "Cleaning", "Finance", "Logistics", "HR", "Sales", "Marketing",
].map((v) => ({ value: v, label: v }))

export const designationOptions = [
  "Senior Operator", "Operator", "Supervisor", "Manager", "Software Developer", "QC Inspector",
  "Security Guard", "Cleaner", "Accountant", "Driver", "HR Executive", "Executive", "Assistant",
].map((v) => ({ value: v, label: v }))

export const shiftOptionsList = [
  "Morning Shift", "Day Shift", "Evening Shift", "Night Shift", "General Shift",
  "Half Day Morning", "Half Day Evening", "Flexible Shift",
].map((v) => ({ value: v, label: v }))

export const gradeOptions = ["Grade-1", "Grade-2", "Grade-3", "Grade-4", "Grade-5", "Grade-6", "Grade-7", "Grade-8"].map((v) => ({ value: v, label: v }))

export const sectionOptions = [
  "Section-A", "Section-B", "Section-C", "Section-D", "Development", "Management",
  "Quality Control", "Security", "Cleaning", "Accounts", "Transport", "Human Resources",
].map((v) => ({ value: v, label: v }))

export const statusOptionsEmployee = [
  { value: "Active" as const, label: "Active" },
  { value: "Inactive" as const, label: "Inactive" },
]
