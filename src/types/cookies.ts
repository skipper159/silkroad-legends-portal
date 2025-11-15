/**
 * Cookie consent types and interfaces
 */

export type CookieCategory = 'essential' | 'functional';

export interface CookieConsent {
  essential: boolean; // Always true, can't be disabled
  functional: boolean;
  timestamp: number;
}

export interface CookiePreferences {
  hasConsent: boolean;
  consent: CookieConsent;
}

export const DEFAULT_COOKIE_CONSENT: CookieConsent = {
  essential: true,
  functional: false,
  timestamp: Date.now(),
};

export const COOKIE_CATEGORIES = {
  essential: {
    name: 'Essential',
    description: 'Required for basic website functionality. Cannot be disabled.',
    required: true,
  },
  functional: {
    name: 'Functional',
    description: 'Enable enhanced features like language settings and personalized content.',
    required: false,
  },
};
