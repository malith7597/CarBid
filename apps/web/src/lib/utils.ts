import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, with later Tailwind utilities winning over earlier conflicting ones.
 *
 * `clsx` handles conditionals; `twMerge` resolves conflicts — so `cn('p-2', 'p-4')` yields `p-4`
 * rather than both. Every shadcn component depends on this helper existing at this path.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
