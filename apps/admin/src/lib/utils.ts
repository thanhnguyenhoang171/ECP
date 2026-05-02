import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Kiểm tra xem một chuỗi có giống ID (ObjectId 24 ký tự hex hoặc UUID) hay không
 */
export function isIdLike(val: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(val) || /^[0-9a-fA-F-]{36}$/.test(val);
}

