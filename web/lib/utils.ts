import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCheck(val: string | null | undefined): string {
  if (!val) return "-"
  if (val.includes("T")) return val.slice(11, 16)
  if (val.length >= 19 && val[10] === " ") return val.slice(11, 16)
  if (val.length >= 5 && val[2] === ":") return val.slice(0, 5)
  return val
}
