import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function isPromise(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.then === "function"
  );
}