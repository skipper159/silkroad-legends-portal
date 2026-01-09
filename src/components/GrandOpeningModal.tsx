import { useEffect, useState, useMemo } from 'react';
import { X, Calendar, PartyPopper } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';
import { useWebSettings } from '@/hooks/useWebSettings';
import { getCookie, setCookie } from '@/utils/cookies';
import { useTheme } from '@/context/ThemeContext';

const COOKIE_NAME = 'grand_opening_modal_dismissed';

const GrandOpeningModal = () => {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const { settings, loading } = useWebSettings();

  // Parse the date from settings
  const targetDate = useMemo(() => {
    if (!settings.grand_opening_date) return new Date('2026-03-31T00:00:00');
    return new Date(`${settings.grand_opening_date}T00:00:00`);
  }, [settings.grand_opening_date]);

  // Format date for display
  const formattedDate = useMemo(() => {
    return targetDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [targetDate]);

  const countdown = useCountdown({ targetDate });

  useEffect(() => {
    // Don't show if still loading settings
    if (loading) return;

    // Don't show if disabled in admin settings
    if (!settings.grand_opening_enabled) return;

    // Check if user has dismissed the modal before
    const dismissed = getCookie(COOKIE_NAME);

    // Show modal if not dismissed and not expired
    if (!dismissed && !countdown.isExpired) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, settings.grand_opening_enabled, countdown.isExpired]);

  const handleClose = () => {
    setIsVisible(false);
    // Set cookie with dynamic dismiss duration from settings
    setCookie(COOKIE_NAME, 'true', settings.grand_opening_dismiss_days);
  };

  if (!isVisible || countdown.isExpired || loading) {
    return null;
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={handleClose} />

      {/* Modal Content */}
      <div className='relative bg-theme-surface border-2 border-theme-primary/30 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in'>
        {/* Close Button */}
        <button
          onClick={handleClose}
          className='absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10'
          aria-label='Close modal'
        >
          <X size={24} />
        </button>

        {/* Decorative Top Bar */}
        <div className='h-2 bg-gradient-to-r from-theme-accent via-theme-primary to-theme-accent' />

        {/* Content */}
        <div className='p-8 md:p-12 text-center'>
          {/* Icon */}
          <div className='flex justify-center mb-6'>
            <div className='p-4 bg-theme-primary/10 rounded-full border border-theme-primary/30'>
              <PartyPopper size={48} className='text-theme-primary' />
            </div>
          </div>

          {/* Title */}
          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-white'>
            Grand Opening <span className='text-theme-accent'>{targetDate.getFullYear()}</span>
          </h2>

          <p className='text-theme-text-muted text-lg mb-8 max-w-md mx-auto'>
            Join us for the official launch of{' '}
            <span className='text-theme-primary font-semibold'>{theme.siteName}</span> and embark on an epic journey
            through the Silkroad!
          </p>

          {/* Countdown */}
          <div className='mb-8'>
            <div className='flex items-center justify-center gap-2 mb-4 text-theme-accent'>
              <Calendar size={20} />
              <span className='font-semibold'>{formattedDate}</span>
            </div>

            <div className='grid grid-cols-4 gap-3 md:gap-6 max-w-lg mx-auto'>
              <CountdownBox value={countdown.days} label='Days' />
              <CountdownBox value={countdown.hours} label='Hours' />
              <CountdownBox value={countdown.minutes} label='Minutes' />
              <CountdownBox value={countdown.seconds} label='Seconds' />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <a
              href='/register'
              className='px-8 py-3 bg-gradient-to-r from-theme-accent to-theme-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg'
            >
              Register Now
            </a>
            <a
              href='/download'
              className='px-8 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors border border-white/20'
            >
              Download Client
            </a>
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={handleClose}
            className='mt-6 px-6 py-2 bg-white/10 text-theme-text-muted rounded-lg hover:bg-white/20 transition-colors border border-white/20 text-sm md:hidden'
          >
            Close
          </button>
          <p className='mt-4 text-sm text-gray-500 hidden md:block'>
            Click anywhere outside to close • Won't show again for {settings.grand_opening_dismiss_days} days
          </p>
        </div>
      </div>
    </div>
  );
};

interface CountdownBoxProps {
  value: number;
  label: string;
}

const CountdownBox = ({ value, label }: CountdownBoxProps) => {
  return (
    <div className='bg-theme-surface/50 border border-theme-primary/20 rounded-lg p-3 md:p-4'>
      <div className='text-3xl md:text-4xl font-bold text-theme-primary mb-1'>{String(value).padStart(2, '0')}</div>
      <div className='text-xs md:text-sm text-theme-text-muted uppercase tracking-wider'>{label}</div>
    </div>
  );
};

export default GrandOpeningModal;
