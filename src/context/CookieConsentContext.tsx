import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CookieConsent, CookiePreferences, DEFAULT_COOKIE_CONSENT } from '@/types/cookies';
import { getCookie, setCookie } from '@/utils/cookies';

interface CookieConsentContextType {
  preferences: CookiePreferences;
  updateConsent: (consent: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  declineAll: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_CONSENT_NAME = 'cookie_consent';
const COOKIE_CONSENT_EXPIRY_DAYS = 365;

export const CookieConsentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<CookiePreferences>(() => {
    const saved = getCookie(COOKIE_CONSENT_NAME);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          hasConsent: true,
          consent: parsed,
        };
      } catch {
        return {
          hasConsent: false,
          consent: DEFAULT_COOKIE_CONSENT,
        };
      }
    }
    return {
      hasConsent: false,
      consent: DEFAULT_COOKIE_CONSENT,
    };
  });

  const saveConsent = (consent: CookieConsent) => {
    const consentWithTimestamp = {
      ...consent,
      timestamp: Date.now(),
    };
    setCookie(COOKIE_CONSENT_NAME, JSON.stringify(consentWithTimestamp), COOKIE_CONSENT_EXPIRY_DAYS);
    setPreferences({
      hasConsent: true,
      consent: consentWithTimestamp,
    });
  };

  const updateConsent = (partialConsent: Partial<CookieConsent>) => {
    const newConsent = {
      ...preferences.consent,
      ...partialConsent,
      essential: true, // Always true
    };
    saveConsent(newConsent);
  };

  const acceptAll = () => {
    saveConsent({
      essential: true,
      functional: true,
      timestamp: Date.now(),
    });
  };

  const declineAll = () => {
    saveConsent({
      essential: true,
      functional: false,
      timestamp: Date.now(),
    });
  };

  const resetConsent = () => {
    setPreferences({
      hasConsent: false,
      consent: DEFAULT_COOKIE_CONSENT,
    });
  };

  return (
    <CookieConsentContext.Provider
      value={{
        preferences,
        updateConsent,
        acceptAll,
        declineAll,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
