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
}

export const companyApi = {
  list: () => api.get("/companies"),
  get: (id: string) => api.get(`/companies/${id}`),
  create: (data: Record<string, unknown>) => api.post("/companies", data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/companies/${id}`, data),
  delete: (id: string) => api.delete(`/companies/${id}`),
}

export const employeeApi = {
  list: () => api.get("/employees"),
  get: (id: string) => api.get(`/employees/${id}`),
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
  clockIn: (data: Record<string, unknown>) => api.post("/attendance/clock-in", data),
  clockOut: (data: Record<string, unknown>) => api.post("/attendance/clock-out", data),
}

export const dataLogApi = {
  import: (data: FormData) => api.post("/data-logs/import", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  list: (params?: Record<string, string>) => api.get("/data-logs", { params }),
  process: (data: { date: string; company_id: string }) => api.post("/data-logs/process", data),
  stats: () => api.get("/data-logs/stats"),
}
