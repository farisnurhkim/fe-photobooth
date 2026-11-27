import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  if (amount >= 1000) {
    const kValue = amount / 1000;
    return `IDR ${kValue % 1 !== 0 ? kValue.toFixed(1) : kValue}k`;
  }
  return `IDR ${amount}`;
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}
