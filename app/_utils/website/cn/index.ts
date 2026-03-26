/**
 * Utility function for merging Tailwind CSS classes
 * 
 * Combines clsx and tailwind-merge to handle conditional classes
 * and resolve Tailwind class conflicts.
 * 
 * @example
 * ```tsx
 * cn('px-4 py-2', isActive && 'bg-blue-500', className)
 * ```
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

