import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(value: number | null | undefined) {
  return `RM ${(value ?? 0).toFixed(2)}`;
}

export function formatDate(value: unknown) {
  if (!value) return "-";
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as {toDate: () => Date}).toDate().toLocaleString();
  }
  return String(value);
}
