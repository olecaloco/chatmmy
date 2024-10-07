import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractColonedWord(input: string): string | null {
  const colonWordRegex = /@(\w+)@/;
  const match = input.match(colonWordRegex);
  return match ? match[1] : null;
}

export function isValidHttpUrl(url: string) {
  try {
    const newUrl = new URL(url);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
}
