import api from "./axios-instance"

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export const authApi = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
  register: (data: RegisterRequest) => api.post<AuthResponse>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  updateProfile: (data: Record<string, unknown>) => api.put("/auth/profile", data),
  changePassword: (data: { current_password: string; new_password: string }) => api.put("/auth/change-password", data),
  sessions: () => api.get("/auth/sessions"),
  logoutAll: () => api.post("/auth/logout-all"),
}

export const companyApi = {
  list: () => api.get("/companies"),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: Record<string, unknown>) => api.post("/companies", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
}

export const employeeApi = {
  list: (params?: Record<string, string>) => api.get("/employees", { params }),
  get: (id: string) => api.get(`/employees/${id}`),
  create: (data: Record<string, unknown>) => api.post("/employees", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post("/employees/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
  downloadTemplate: () => api.get("/employees/import/template", { responseType: "blob" }),
  exportExcel: (params?: Record<string, string>) => api.get("/employees/export/excel", { params, responseType: "blob" }),
  exportPdf: (params?: Record<string, string>) => api.get("/employees/export/pdf", { params, responseType: "blob" }),
}

export const groupApi = {
  list: () => api.get("/groups"),
  get: (id: string) => api.get(`/groups/${id}`),
  create: (data: Record<string, unknown>) => api.post("/groups", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/groups/${id}`, data),
  delete: (id: string) => api.delete(`/groups/${id}`),
}

export const floorApi = {
  list: () => api.get("/floors"),
  get: (id: string) => api.get(`/floors/${id}`),
  create: (data: Record<string, unknown>) => api.post("/floors", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/floors/${id}`, data),
  delete: (id: string) => api.delete(`/floors/${id}`),
}

export const departmentApi = {
  list: () => api.get("/departments"),
  get: (id: string) => api.get(`/departments/${id}`),
  create: (data: Record<string, unknown>) => api.post("/departments", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
}

export const sectionApi = {
  list: (departmentId?: string) => api.get("/sections", { params: departmentId ? { department_id: departmentId } : {} }),
  get: (id: string) => api.get(`/sections/${id}`),
  create: (data: Record<string, unknown>) => api.post("/sections", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/sections/${id}`, data),
  delete: (id: string) => api.delete(`/sections/${id}`),
}

export const designationApi = {
  list: (sectionId?: string) => api.get("/designations", { params: sectionId ? { section_id: sectionId } : {} }),
  get: (id: string) => api.get(`/designations/${id}`),
  create: (data: Record<string, unknown>) => api.post("/designations", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/designations/${id}`, data),
  delete: (id: string) => api.delete(`/designations/${id}`),
}

export const lineApi = {
  list: (sectionId?: string) => api.get("/lines", { params: sectionId ? { section_id: sectionId } : {} }),
  get: (id: string) => api.get(`/lines/${id}`),
  create: (data: Record<string, unknown>) => api.post("/lines", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/lines/${id}`, data),
  delete: (id: string) => api.delete(`/lines/${id}`),
}

export const shiftApi = {
  list: () => api.get("/shifts"),
  get: (id: string) => api.get(`/shifts/${id}`),
  create: (data: Record<string, unknown>) => api.post("/shifts", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/shifts/${id}`, data),
  delete: (id: string) => api.delete(`/shifts/${id}`),
}

export const attendanceApi = {
  list: (params?: Record<string, string>) => api.get("/attendance", { params }),
  get: (id: string) => api.get(`/attendance/${id}`),
  create: (data: Record<string, unknown>) => api.post("/attendance", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/attendance/${id}`, data),
  delete: (id: string) => api.delete(`/attendance/${id}`),
  clockIn: (data: Record<string, unknown>) => api.post("/attendance/clock-in", data),
  clockOut: (data: Record<string, unknown>) => api.post("/attendance/clock-out", data),
  jobCard: (params?: Record<string, string>) => api.get("/attendance/job-card", { params }),
  stats: () => api.get("/attendance/stats"),
  deleteAll: () => api.delete("/attendance/delete-all"),
  missing: (params: Record<string, string>) => api.get("/attendance/missing", { params }),
  absent: (params: Record<string, string>) => api.get("/attendance/absent", { params }),
  summary: (params?: Record<string, string>) => api.get("/attendance/summary", { params }),
  overtime: (params?: Record<string, string>) => api.get("/attendance/overtime", { params }),
  overtimeSummary: (params?: Record<string, string>) => api.get("/attendance/overtime-summary", { params }),
  monthlyReport: (params?: Record<string, string>) => api.get("/attendance/monthly-report", { params }),
}

export const dataLogApi = {
  import: (data: { file_path?: string; start_date?: string; end_date?: string }) => api.post("/data-logs/import", data),
  list: (params?: Record<string, string>) => api.get("/data-logs", { params }),
  process: (data: { date?: string; start_date?: string; end_date?: string; company_id: string }) => api.post("/data-logs/process", data),
  stats: () => api.get("/data-logs/stats"),
  deleteAll: () => api.delete("/data-logs/delete-all"),
}

export const divisionApi = {
  list: () => api.get("/divisions"),
  get: (id: string) => api.get(`/divisions/${id}`),
  create: (data: Record<string, unknown>) => api.post("/divisions", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/divisions/${id}`, data),
  delete: (id: string) => api.delete(`/divisions/${id}`),
}

export const districtApi = {
  list: (divisionId?: string) => api.get("/districts", { params: divisionId ? { division_id: divisionId } : {} }),
  get: (id: string) => api.get(`/districts/${id}`),
  create: (data: Record<string, unknown>) => api.post("/districts", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/districts/${id}`, data),
  delete: (id: string) => api.delete(`/districts/${id}`),
}

export const upazilaApi = {
  list: (districtId?: string) => api.get("/upazilas", { params: districtId ? { district_id: districtId } : {} }),
  get: (id: string) => api.get(`/upazilas/${id}`),
  create: (data: Record<string, unknown>) => api.post("/upazilas", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/upazilas/${id}`, data),
  delete: (id: string) => api.delete(`/upazilas/${id}`),
}

export const unionApi = {
  list: (upazilaId?: string) => api.get("/unions", { params: upazilaId ? { upazila_id: upazilaId } : {} }),
  get: (id: string) => api.get(`/unions/${id}`),
  create: (data: Record<string, unknown>) => api.post("/unions", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/unions/${id}`, data),
  delete: (id: string) => api.delete(`/unions/${id}`),
}

export const requirementApi = {
  list: (params?: Record<string, string>) => api.get("/requirements", { params }),
  get: (id: string) => api.get(`/requirements/${id}`),
  create: (data: Record<string, unknown>) => api.post("/requirements", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/requirements/${id}`, data),
  delete: (id: string) => api.delete(`/requirements/${id}`),
}

export const separationApi = {
  list: (params?: Record<string, string>) => api.get("/separations", { params }),
  get: (id: string) => api.get(`/separations/${id}`),
  create: (data: Record<string, unknown>) => api.post("/separations", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/separations/${id}`, data),
  delete: (id: string) => api.delete(`/separations/${id}`),
}

export const idCardApi = {
  list: (params?: Record<string, string>) => api.get("/id-cards", { params }),
  get: (id: string) => api.get(`/id-cards/${id}`),
  create: (data: Record<string, unknown>) => api.post("/id-cards", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/id-cards/${id}`, data),
  delete: (id: string) => api.delete(`/id-cards/${id}`),
}

export const leaveTypeApi = {
  list: (companyId?: string) => api.get("/leave-types", { params: companyId ? { company_id: companyId } : {} }),
  get: (id: string) => api.get(`/leave-types/${id}`),
  create: (data: Record<string, unknown>) => api.post("/leave-types", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/leave-types/${id}`, data),
  delete: (id: string) => api.delete(`/leave-types/${id}`),
}

export const leaveApi = {
  list: (params?: Record<string, string>) => api.get("/leaves", { params }),
  get: (id: string) => api.get(`/leaves/${id}`),
  apply: (data: Record<string, unknown>) => api.post("/leaves", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/leaves/${id}`, data),
  cancel: (id: string) => api.delete(`/leaves/${id}`),
  approve: (id: string) => api.put(`/leaves/${id}/approve`),
  reject: (id: string, reason: string) => api.put(`/leaves/${id}/reject`, { rejection_reason: reason }),
}

export const leaveBalanceApi = {
  list: (params?: Record<string, string>) => api.get("/leave-balance", { params }),
}

export const leaveReportApi = {
  monthly: (params?: Record<string, string>) => api.get("/leave-reports/monthly", { params }),
}

export const salaryApi = {
  process: (data: { company_id: string; month: number; year: number }) => api.post("/salary/process", data),
  sheet: (params?: Record<string, string>) => api.get("/salary/sheet", { params }),
  payslip: (params?: Record<string, string>) => api.get("/salary/payslip", { params }),
  list: (params?: Record<string, string>) => api.get("/salary/list", { params }),
  summary: (params?: Record<string, string>) => api.get("/salary/summary", { params }),
}

export const temporaryShiftApi = {
  list: (params?: Record<string, string>) => api.get("/temporary-shifts", { params }),
  get: (id: string) => api.get(`/temporary-shifts/${id}`),
  create: (data: Record<string, unknown>) => api.post("/temporary-shifts", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/temporary-shifts/${id}`, data),
  delete: (id: string) => api.delete(`/temporary-shifts/${id}`),
}

export const uploadApi = {
  file: (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    return api.post<{ url: string; filename: string }>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  },
}
