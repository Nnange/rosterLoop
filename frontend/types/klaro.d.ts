// Type declarations for Klaro cookie consent library

declare module 'klaro' {
  export interface Cookie {
    name: string
    path?: string
    domain?: string
    expiresAfterDays?: number
  }

  export interface Purpose {
    [key: string]: string
  }

  export interface Service {
    name: string
    title: string
    description: string
    required?: boolean
    cookies?: (string | string[])[]
    purposes?: string[]
    onConsent?: () => void
    onDecline?: () => void
  }

  export interface KlaroConfig {
    elementID?: string
    cookieName?: string
    cookieExpiresAfterDays?: number
    defaultLanguage?: string
    cookieDomain?: string
    privacyPolicy?: string
    scriptWrappers?: any[]
    services: Service[]
    purposes?: Purpose
    translations?: Record<string, any>
  }

  export interface Klaro {
    show: (config: KlaroConfig) => void
    hide: () => void
    show: () => void
    getManager: () => Manager
    getConstants: () => any
  }

  interface Manager {
    consent: Record<string, boolean>
    updateConsentFromForm: () => void
    updateConsent: (consent: Record<string, boolean>) => void
  }

  export const klaro: Klaro
  export default klaro
}
