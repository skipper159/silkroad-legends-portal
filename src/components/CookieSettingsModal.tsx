import { useState } from 'react';
import { X, Cookie, Shield, Check } from 'lucide-react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { COOKIE_CATEGORIES, CookieCategory, CookieConsent } from '@/types/cookies';

interface CookieSettingsModalProps {
  onClose: () => void;
}

const CookieSettingsModal = ({ onClose }: CookieSettingsModalProps) => {
  const { preferences, updateConsent } = useCookieConsent();
  const [localConsent, setLocalConsent] = useState(preferences.consent);

  const handleToggle = (category: CookieCategory) => {
    if (category === 'essential') return; // Can't disable essential cookies

    setLocalConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    updateConsent(localConsent);
    onClose();
  };

  const handleAcceptAll = () => {
    const allAccepted: CookieConsent = {
      essential: true,
      functional: true,
      timestamp: Date.now(),
    };
    setLocalConsent(allAccepted);
    updateConsent(allAccepted);
    onClose();
  };

  const getCategoryIcon = (category: CookieCategory) => {
    switch (category) {
      case 'essential':
        return <Shield className='text-green-500' size={20} />;
      case 'functional':
        return <Cookie className='text-blue-500' size={20} />;
    }
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-theme-surface border-2 border-theme-primary/30 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-scale-in'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-theme-primary/20'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-theme-primary/10 rounded-lg'>
              <Cookie className='text-theme-primary' size={24} />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-white'>Cookie Settings</h2>
              <p className='text-sm text-theme-text-muted'>Manage your privacy preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='text-theme-text-muted hover:text-white transition-colors p-2 rounded-full hover:bg-white/10'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto max-h-[60vh]'>
          <p className='text-theme-text-muted mb-6'>
            We use different types of cookies for various purposes. You can decide which categories you want to allow.
            Please note that blocking some types of cookies may impact your experience on our website and the services
            we can offer.
          </p>

          {/* Cookie Categories */}
          <div className='space-y-4'>
            {(Object.keys(COOKIE_CATEGORIES) as CookieCategory[]).map((category) => {
              const info = COOKIE_CATEGORIES[category];
              const isEnabled = localConsent[category];
              const isRequired = info.required;

              return (
                <div
                  key={category}
                  className='bg-theme-surface/50 border border-gray-700 rounded-lg p-4 hover:border-theme-primary/30 transition-colors'
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex items-start gap-3 flex-1'>
                      <div className='mt-1'>{getCategoryIcon(category)}</div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <h3 className='text-lg font-semibold text-white'>{info.name}</h3>
                          {isRequired && (
                            <span className='px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30'>
                              Erforderlich
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-theme-text-muted'>{info.description}</p>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <div className='ml-4'>
                      <button
                        onClick={() => handleToggle(category)}
                        disabled={isRequired}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          isEnabled ? 'bg-theme-primary' : 'bg-gray-600'
                        } ${isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {isEnabled && !isRequired && (
                    <div className='mt-3 pt-3 border-t border-gray-700'>
                      <div className='flex items-center gap-2 text-xs text-green-400'>
                        <Check size={14} />
                        <span>Enabled</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legal Info */}
          <div className='mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
            <div className='flex items-start gap-3'>
              <Shield className='text-blue-400 mt-0.5' size={18} />
              <div>
                <p className='text-sm font-semibold text-blue-400 mb-1'>Your Rights under GDPR</p>
                <p className='text-xs text-theme-text-muted'>
                  You have the right to withdraw your consent at any time. For more information about your rights and
                  how we protect your data, please see our{' '}
                  <a href='/privacy-policy' className='text-theme-primary hover:underline' onClick={onClose}>
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className='p-6 border-t border-theme-primary/20 bg-gray-900/50'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <button
              onClick={handleAcceptAll}
              className='flex-1 px-6 py-3 bg-gradient-to-r from-theme-accent to-theme-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg'
            >
              Accept All
            </button>
            <button
              onClick={handleSave}
              className='flex-1 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20'
            >
              Save Selection
            </button>
            <button
              onClick={onClose}
              className='px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieSettingsModal;
