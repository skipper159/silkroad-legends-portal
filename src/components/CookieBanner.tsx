import { useState } from 'react';
import { Cookie, Settings, Shield } from 'lucide-react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import CookieSettingsModal from '@/components/CookieSettingsModal';

const CookieBanner = () => {
  const { preferences, acceptAll, declineAll } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);

  // Don't show banner if user has already made a choice
  if (preferences.hasConsent) {
    return null;
  }

  return (
    <>
      <div className='fixed bottom-0 left-0 right-0 z-40 p-3 animate-slide-up'>
        <div className='max-w-5xl mx-auto bg-gradient-to-br from-gray-900 via-lafftale-darkgray to-gray-900 border border-lafftale-gold/30 rounded-lg shadow-2xl backdrop-blur-sm'>
          <div className='p-4 md:p-5'>
            {/* Header & Content in one row on desktop */}
            <div className='flex flex-col md:flex-row md:items-center gap-4 mb-3'>
              <div className='flex items-center gap-3 flex-shrink-0'>
                <div className='p-1.5 bg-lafftale-gold/10 rounded-lg'>
                  <Cookie className='text-lafftale-gold' size={20} />
                </div>
                <div>
                  <h3 className='text-base font-bold text-white'>Cookie Settings</h3>
                </div>
              </div>

              <p className='text-gray-300 text-xs md:text-sm flex-1'>
                We use cookies to enhance your experience. Essential cookies are required for basic functionality, while
                functional cookies enable additional features.{' '}
                <a href='/privacy-policy' className='text-lafftale-gold hover:underline'>
                  Learn more
                </a>
              </p>
            </div>

            {/* Cookie Types - Compact */}
            <div className='grid grid-cols-2 gap-2 mb-3'>
              <div className='flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded'>
                <Shield className='text-green-500' size={14} />
                <div>
                  <p className='text-xs font-semibold text-green-400'>Essential</p>
                  <p className='text-[10px] text-gray-400'>Required</p>
                </div>
              </div>
              <div className='flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded'>
                <Settings className='text-blue-500' size={14} />
                <div>
                  <p className='text-xs font-semibold text-blue-400'>Functional</p>
                  <p className='text-[10px] text-gray-400'>Optional</p>
                </div>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className='flex flex-col sm:flex-row gap-2'>
              <button
                onClick={acceptAll}
                className='flex-1 px-4 py-2 text-sm bg-gradient-to-r from-lafftale-bronze to-lafftale-gold text-white font-semibold rounded hover:opacity-90 transition-opacity'
              >
                Accept All
              </button>
              <button
                onClick={declineAll}
                className='flex-1 px-4 py-2 text-sm bg-gray-700 text-white font-semibold rounded hover:bg-gray-600 transition-colors'
              >
                Essential Only
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className='px-4 py-2 text-sm bg-white/10 text-white font-semibold rounded hover:bg-white/20 transition-colors border border-white/20 flex items-center justify-center gap-1.5'
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
