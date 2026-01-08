import { useState } from 'react';
import { Cookie, Settings, Shield } from 'lucide-react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { useWebSettings } from '@/hooks/useWebSettings';
import CookieSettingsModal from '@/components/CookieSettingsModal';

const CookieBanner = () => {
  const { preferences, acceptAll, declineAll } = useCookieConsent();
  const { settings, loading } = useWebSettings();
  const [showSettings, setShowSettings] = useState(false);

  if (loading) {
    return null;
  }

  if (!settings.cookie_consent_enabled) {
    return null;
  }

  if (preferences.hasConsent) {
    return null;
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 z-40 p-3 animate-slide-up'>
        <div className='max-w-5xl mx-auto bg-theme-surface/95 border border-theme-border rounded-lg shadow-2xl backdrop-blur-sm'>
          <div className='p-4 md:p-5'>
            {/* Header & Content */}
            <div className='flex flex-col md:flex-row md:items-center gap-4 mb-3'>
              <div className='flex items-center gap-3 flex-shrink-0'>
                <div className='p-1.5 bg-theme-primary/10 rounded-lg'>
                  <Cookie className='text-theme-primary' size={20} />
                </div>
                <div>
                  <h3 className='text-base font-bold text-theme-text'>Cookie Settings</h3>
                </div>
              </div>

              <p className='text-theme-text-muted text-xs md:text-sm flex-1'>
                We use cookies to enhance your experience. Essential cookies are required for basic functionality, while
                functional cookies enable additional features.{' '}
                <a href='/privacy-policy' className='text-theme-primary hover:underline'>
                  Learn more
                </a>
              </p>
            </div>

            {/* Cookie Types */}
            <div className='grid grid-cols-2 gap-2 mb-3'>
              <div className='flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded'>
                <Shield className='text-green-500' size={14} />
                <div>
                  <p className='text-xs font-semibold text-green-400'>Essential</p>
                  <p className='text-[10px] text-theme-text-muted'>Required</p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded'>
                <Settings className='text-blue-500' size={14} />
                <div>
                  <p className='text-xs font-semibold text-blue-400'>Functional</p>
                  <p className='text-[10px] text-theme-text-muted'>Optional</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={acceptAll}
                className='flex-1 px-4 py-2 text-sm bg-theme-primary text-white font-semibold rounded hover:bg-theme-primary-hover transition-colors'
              >
                Accept All
              </button>
              <button
                onClick={declineAll}
                className='flex-1 px-4 py-2 text-sm bg-theme-surface text-theme-text font-semibold rounded hover:bg-theme-border transition-colors border border-theme-border'
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className='px-4 py-2 text-sm bg-white/10 text-theme-text font-semibold rounded hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-1.5'
              >
                <Settings size={14} />
                Customize
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && <CookieSettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
};

export default CookieBanner;
