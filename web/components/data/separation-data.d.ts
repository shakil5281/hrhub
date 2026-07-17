import { z } from "zod";
import type { Department } from "./organization-data";
export interface Separation {
    id: string;
    employee: string;
    employee_id: string;
    department_id: string;
    type: "Resignation" | "Termination" | "Retirement" | "Contract End" | "Other";
    date: string;
    status: "Approved" | "Pending" | "Rejected";
    reason: string;
    created_at: string;
    updated_at: string;
    department?: Department;
}
export declare const separationSchema: z.ZodObject<{
    employee: z.ZodString;
    employee_id: z.ZodString;
    department_id: z.ZodString;
    type: z.ZodEnum<{
        Other: "Other";
        Resignation: "Resignation";
        Termination: "Termination";
        Retirement: "Retirement";
        "Contract End": "Contract End";
    }>;
    date: z.ZodString;
    status: z.ZodEnum<{
        Approved: "Approved";
        Pending: "Pending";
        Rejected: "Rejected";
    }>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type SeparationFormData = z.infer<typeof separationSchema>;
export declare const separationTypeOptions: ({
    value: "Resignation";
    label: string;
} | {
    value: "Termination";
    label: string;
} | {
    value: "Retirement";
    label: string;
} | {
    value: "Contract End";
    label: string;
} | {
    value: "Other";
    label: string;
})[];
export declare const separationStatusOptions: ({
    value: "Approved";
    label: string;
} | {
    value: "Pending";
    label: string;
} | {
    value: "Rejected";
    label: string;
})[];
