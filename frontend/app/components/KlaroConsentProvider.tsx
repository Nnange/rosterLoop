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
    try {
      // Dynamically import Klaro to ensure it loads correctly
      import('klaro').then((klaroModule) => {
        const klaro = klaroModule.default || klaroModule.klaro
        if (klaro && klaro.show) {
          klaro.show(klaroConfig)
          console.log('Klaro consent banner initialized')
        } else {
          console.warn('Klaro module loaded but show method not available')
        }
      }).catch((error) => {
        console.error('Error importing Klaro:', error)
      })
    } catch (error) {
      console.error('Error initializing Klaro:', error)
    }
  }, [])

  return null
}

export default KlaroConsentProvider
