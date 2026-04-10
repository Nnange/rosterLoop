// Klaro Cookie Consent Configuration for GDPR Compliance
// This configuration manages user consent for different types of cookies

const getCookieDomain = (): string => {
  if (globalThis.window !== undefined) {
    return globalThis.window.location.hostname
  }
  return 'localhost'
}

export const klaroConfig = {
  elementID: 'klaro',
  cookieName: 'klaro',
  cookieExpiresAfterDays: 365,
  defaultLanguage: 'en',
  cookieDomain: getCookieDomain(),
  
  // Privacy policy link (required by GDPR)
  privacyPolicy: '/privacy-policy',
  
  // List of services/purposes for cookie consent
  services: [
    {
      // Essential cookies - always enabled, cannot be disabled
      name: 'essential',
      title: 'Essential Cookies',
      description: 'Essential cookies for authentication and session management. These are required for the app to function.',
      required: true, // User cannot disable this
      cookies: [],
      purposes: ['authentication', 'security'],
    },
    {
      // Analytics - optional, user can opt out
      name: 'analytics',
      title: 'Analytics & Performance',
      description: 'Help us improve RosterLoop by collecting anonymous usage statistics. No personal data is collected.',
      required: false,
      cookies: [],
      purposes: ['analytics'],
    },
    {
      // Marketing cookies - optional
      name: 'marketing',
      title: 'Marketing & External Content',
      description: 'Allow us to show personalized content and advertisements based on your interests.',
      required: false,
      cookies: [],
      purposes: ['marketing'],
    },
  ],

  // Cookie purposes - organized grouping
  purposes: {
    authentication: 'Authentication & Security',
    security: 'Security',
    analytics: 'Analytics & Insights',
    marketing: 'Marketing & Personalization',
  },

  // Translation strings
  translations: {
    en: {
      appTitle: 'RosterLoop Cookie Settings',
      appDescription: 'RosterLoop uses cookies to provide essential functionality and improve your experience.',
      
      privacyPolicy: 'Privacy Policy',
      privacyPolicyUrl: '/privacy-policy',

      purposes: {
        authentication: 'Authentication & Security',
        security: 'Security & Protection',
        analytics: 'Analytics & Insights',
        marketing: 'Marketing & Personalization',
      },

      purposes_description: {
        authentication: 'Cookies required to keep you logged in and protect your account.',
        security: 'Cookies that protect your data and prevent unauthorized access.',
        analytics: 'Anonymous statistics to help us improve the app.',
        marketing: 'Show you content and features tailored to your interests.',
      },

      consentNotice: {
        changeDescription: 'This website uses cookies to provide you with the best experience. You can accept all cookies or choose which ones you want to allow.',
        description: 'RosterLoop is committed to protecting your privacy. We use only essential cookies by default. Optional cookies help us improve your experience.',
        learnMore: 'Learn more about our cookie usage',
      },

      consentModal: {
        title: '🍪 Cookie Settings',
        description: 'RosterLoop uses cookies to enhance your experience and ensure the app works properly. Please choose which cookies you want to allow.',
        privacyPolicy: {
          text: 'To learn more about how we use cookies and manage your data, please read our ',
          linkText: 'Privacy Policy',
        },
      },

      consentButtons: {
        acceptAll: 'Accept All',
        acceptSelected: 'Accept Selected',
        acceptEssentialOnly: 'Only Essential',
        rejectAll: 'Reject All (except essential)',
        learnMore: 'Manage Settings',
      },

      close: 'Close',
      save: 'Save Settings',
      acceptAll: 'Accept All',
      acceptSelected: 'Accept Selected',
      acceptEssentialOnly: 'Only Essential',
      rejectAll: 'Reject All',
    },
  },
};

export default klaroConfig;
