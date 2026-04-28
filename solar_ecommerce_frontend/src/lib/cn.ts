/**
 * Tailwind class merge utility.
 * - clsx for conditional joining
 * - tailwind-merge for resolving conflicting Tailwind classes
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
