import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

// Locale-aware drop-in replacements for next/link and next/navigation.
// Import Link / useRouter / usePathname / redirect from here so internal
// navigation keeps the active locale prefix (/en, /de).
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
