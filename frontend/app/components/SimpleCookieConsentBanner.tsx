'use client'

import { useEffect, useState } from 'react'

interface CookieConsent {
  essential: boolean
  analytics: boolean
  marketing: boolean
}

/**
 * SimpleCookieConsentBanner - A custom GDPR-compliant cookie consent banner
 * This is a simpler alternative to Klaro that works reliably with Next.js 16
 */
export function SimpleCookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState<CookieConsent | null>(null)

  useEffect(() => {
    // Check if user has already given consent
    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      try {
        setConsent(JSON.parse(savedConsent))
        setShowBanner(false)
      } catch (error) {
        console.error('Error parsing saved consent:', error)
        setShowBanner(true)
      }
    } else {
      // No consent saved, show banner
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const allConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
    }
    localStorage.setItem('cookie-consent', JSON.stringify(allConsent))
    setConsent(allConsent)
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    const minimalConsent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem('cookie-consent', JSON.stringify(minimalConsent))
    setConsent(minimalConsent)
    setShowBanner(false)
  }

  const handleSavePreferences = (prefs: CookieConsent) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs))
    setConsent(prefs)
    setShowBanner(false)
  }

  if (!showBanner) {
    return null
  }

  return (
    <CookieBanner
      onAcceptAll={handleAcceptAll}
      onRejectAll={handleRejectAll}
      onSave={handleSavePreferences}
    />
  )
}

interface CookieBannerProps {
  onAcceptAll: () => void
  onRejectAll: () => void
  onSave: (consent: CookieConsent) => void
}

function CookieBanner({ onAcceptAll, onRejectAll, onSave }: Readonly<CookieBannerProps>) {
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookieConsent>({
    essential: true,
    analytics: false,
    marketing: false,
  })

  const togglePreference = (key: keyof CookieConsent) => {
    if (key === 'essential') return // Can't toggle essential
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {!showDetails ? (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">🍪 Cookie Settings</h3>
              <p className="text-sm text-gray-600">
                We use essential cookies for authentication. We also offer optional cookies for analytics 
                to help us improve your experience. You can manage your preferences below or visit our{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                {'.'}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Settings
              </button>
              <button
                onClick={onRejectAll}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Reject All
              </button>
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-bold text-lg mb-4">Cookie Preferences</h3>
            <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
              {/* Essential Cookies */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="essential"
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="essential" className="font-medium block">
                    Essential Cookies ✓ (Required)
                  </label>
                  <p className="text-sm text-gray-600">
                    Required for authentication and app functionality. You cannot disable these.
                  </p>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="analytics"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="analytics" className="font-medium block">
                    Analytics Cookies (Optional)
                  </label>
                  <p className="text-sm text-gray-600">
                    Help us understand how you use RosterLoop and improve your experience. No personal data is collected.
                  </p>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="marketing" className="font-medium block">
                    Marketing Cookies (Optional)
                  </label>
                  <p className="text-sm text-gray-600">
                    Allow us to show you personalized content and advertisements based on your interests.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Back
              </button>
              <button
                onClick={onRejectAll}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Reject All
              </button>
              <button
                onClick={onAcceptAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Accept All
              </button>
              <button
                onClick={() => onSave(preferences)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium ml-auto"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SimpleCookieConsentBanner
