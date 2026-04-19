// Utility functions to check and manage Klaro consent status

/**
 * Check if a specific service has consent
 * @param serviceName - Name of the service (e.g., 'analytics', 'marketing')
 * @returns boolean - True if consent is given, false otherwise
 */
export function hasConsent(serviceName: string): boolean {
  if (globalThis.window === undefined) return false;

  try {
    const consentCookie = localStorage.getItem('klaro');
    if (!consentCookie) return false;

    const consent = JSON.parse(consentCookie);
    return consent[serviceName] === true;
  } catch (error) {
    console.error('Error checking consent:', error);
    return false;
  }
}

/**
 * Check if essential cookies have consent (always true)
 * @returns boolean - Always true for essential cookies
 */
export function hasEssentialConsent(): boolean {
  return true;
}

/**
 * Check if analytics consent is given
 * @returns boolean
 */
export function hasAnalyticsConsent(): boolean {
  return hasConsent('analytics');
}

/**
 * Check if marketing consent is given
 * @returns boolean
 */
export function hasMarketingConsent(): boolean {
  return hasConsent('marketing');
}

/**
 * Load Google Analytics script if consent is given
 * This is an example of how to conditionally load third-party scripts
 */
export function loadGoogleAnalytics(measurementId: string): void {
  if (!hasAnalyticsConsent()) {
    return;
  }

  if (globalThis.window === undefined) return;

  // Load Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (globalThis.window as any).dataLayer = (globalThis.window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (globalThis.window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
}

/**
 * Get all current consent preferences
 * @returns object with service names and boolean values
 */
export function getAllConsent(): Record<string, boolean> {
  if (globalThis.window === undefined) return {};

  try {
    const consentCookie = localStorage.getItem('klaro');
    if (!consentCookie) return {};

    return JSON.parse(consentCookie);
  } catch (error) {
    console.error('Error getting consent:', error);
    return {};
  }
}

/**
 * Set consent for a specific service
 * Note: This is for demonstration. In production, use Klaro's API
 * @param serviceName - Name of the service
 * @param consented - True or false
 */
export function setConsent(serviceName: string, consented: boolean): void {
  if (globalThis.window === undefined) return;

  try {
    const current = getAllConsent();
    current[serviceName] = consented;
    localStorage.setItem('klaro', JSON.stringify(current));
  } catch (error) {
    console.error('Error setting consent:', error);
  }
}
