import { useEffect, useState } from 'react';
import { weburl } from '@/lib/api';

// Interface for web settings from the API
export interface WebSettings {
  grand_opening_enabled: boolean;
  grand_opening_date: string;
  grand_opening_dismiss_days: number;
  cookie_consent_enabled: boolean;
  cookie_consent_expire_days: number;
}

// Default settings if API fails or settings are not configured
const DEFAULT_SETTINGS: WebSettings = {
  grand_opening_enabled: true,
  grand_opening_date: '2026-03-31',
  grand_opening_dismiss_days: 7,
  cookie_consent_enabled: true,
  cookie_consent_expire_days: 365,
};

// Cache the settings to avoid multiple API calls
let cachedSettings: WebSettings | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to fetch web settings from the API
 * Settings are cached for 5 minutes to reduce API calls
 */
export const useWebSettings = () => {
  const [settings, setSettings] = useState<WebSettings>(cachedSettings || DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use cached settings if still valid
    if (cachedSettings && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        // Public endpoint - no auth required for reading
        const response = await fetch(`${weburl}/api/settings`);

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();

        // Parse the settings from the API response
        const parsedSettings: WebSettings = {
          grand_opening_enabled: data.grand_opening_enabled !== 'false',
          grand_opening_date: data.grand_opening_date || DEFAULT_SETTINGS.grand_opening_date,
          grand_opening_dismiss_days:
            parseInt(data.grand_opening_dismiss_days) ||
            DEFAULT_SETTINGS.grand_opening_dismiss_days,
          cookie_consent_enabled: data.cookie_consent_enabled !== 'false',
          cookie_consent_expire_days:
            parseInt(data.cookie_consent_expire_days) ||
            DEFAULT_SETTINGS.cookie_consent_expire_days,
        };

        // Update cache
        cachedSettings = parsedSettings;
        cacheTimestamp = Date.now();

        setSettings(parsedSettings);
        setError(null);
      } catch (err) {
        console.warn('Failed to fetch web settings, using defaults:', err);
        setSettings(DEFAULT_SETTINGS);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};

/**
 * Utility to invalidate the settings cache
 * Call this after updating settings in the admin panel
 */
export const invalidateWebSettingsCache = () => {
  cachedSettings = null;
  cacheTimestamp = 0;
};

export default useWebSettings;
