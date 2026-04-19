'use client'

import { useEffect } from 'react'
import klaroConfig from '@/app/utils/klaroConfig'

declare global {
  interface Window {
    klaro?: any
  }
}

/**
 * KlaroConsentProvider - Initializes Klaro cookie consent banner
 * Must be placed in the root layout to initialize on every page load
 */
export function KlaroConsentProvider() {
  useEffect(() => {
    // Initialize Klaro with the configuration
    // Dynamically import Klaro to ensure it loads correctly
    import('klaro').then((klaroModule) => {
      const klaro = klaroModule.default || klaroModule.klaro
      klaro?.show(klaroConfig)
    }).catch((error) => {
      console.error('Error importing Klaro:', error)
    })
  }, [])

  return null
}

export default KlaroConsentProvider
