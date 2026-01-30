import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility to merge Tailwind CSS class strings safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
