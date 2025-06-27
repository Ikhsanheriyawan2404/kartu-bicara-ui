import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateFormat(dateStr: string | undefined): string {
  if (!dateStr) return "Tanggal tidak tersedia";
  const tanggal = new Date(dateStr);
  return tanggal.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

