import { useState, useEffect } from 'react';

declare global {
  interface Window {
    FingerprintJS: any;
  }
}

interface FingerprintResult {
  visitorId: string;
  components: {
    [key: string]: any;
  };
}

interface FingerprintHook {
  fingerprint: string | null;
  isLoading: boolean;
  error: string | null;
  generateFingerprint: () => Promise<void>;
}

export const useFingerprint = (): FingerprintHook => {
  const [fingerprint, setFingerprint] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadFingerprintJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.FingerprintJS) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3/dist/fp.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load FingerprintJS'));
      document.head.appendChild(script);
    });
  };

  const generateFingerprint = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await loadFingerprintJS();

      const fp = await window.FingerprintJS.load();
      const result: FingerprintResult = await fp.get();

      setFingerprint(result.visitorId);
    } catch (err) {
      console.error('Fingerprint generation failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Fallback fingerprint basierend auf Browser-Eigenschaften
      const fallbackFingerprint = generateFallbackFingerprint();
      setFingerprint(fallbackFingerprint);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let fingerprint = '';

    // Screen properties
    fingerprint += `${screen.width}x${screen.height}x${screen.colorDepth}`;

    // Timezone
    fingerprint += `_${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

    // Language
    fingerprint += `_${navigator.language}`;

    // User agent hash (simplified)
    fingerprint += `_${navigator.userAgent.length}`;

    // Canvas fingerprint (simplified)
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Anti-cheat fingerprint', 2, 2);
      fingerprint += `_${canvas.toDataURL().slice(-50)}`;
    }

    // Hardware concurrency
    fingerprint += `_${navigator.hardwareConcurrency || 0}`;

    // Create hash
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36);
  };

  useEffect(() => {
    generateFingerprint();
  }, []);

  return {
    fingerprint,
    isLoading,
    error,
    generateFingerprint,
  };
};

export default useFingerprint;
