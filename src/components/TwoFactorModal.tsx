import { useState } from 'react';
import { X, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { weburl } from '@/lib/api';

interface TwoFactorModalProps {
  tempToken: string;
  onSuccess: (response: { token: string; user: object }) => void;
  onCancel: () => void;
}

const TwoFactorModal = ({ tempToken, onSuccess, onCancel }: TwoFactorModalProps) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${weburl}/api/2fa/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid 2FA code');
      }

      onSuccess(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/80 backdrop-blur-sm' onClick={onCancel} />

      {/* Modal */}
      <div className='relative bg-theme-surface border-2 border-theme-primary/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-theme-primary/20'>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-theme-primary/10 rounded-lg'>
              <Shield className='text-theme-primary' size={24} />
            </div>
            <div>
              <h2 className='text-xl font-bold text-white'>Two-Factor Authentication</h2>
              <p className='text-sm text-theme-text-muted'>Enter your authenticator code</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className='text-theme-text-muted hover:text-white transition-colors p-2 rounded-full hover:bg-white/10'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-6'>
          <p className='text-theme-text-muted text-center'>
            Open your authenticator app and enter the 6-digit code for Lafftale
          </p>

          {/* Code Input */}
          <div className='space-y-2'>
            <Input
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''));
                setError(null);
              }}
              placeholder='000000'
              className='bg-transparent text-center text-3xl tracking-[0.5em] font-mono py-4'
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className='p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center'>
              <p className='text-red-400 text-sm'>{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className='flex gap-3'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
              className='flex-1 border-gray-600 text-theme-text-muted hover:bg-gray-800'
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-theme-primary hover:bg-theme-primary-hover text-theme-primary-foreground'
              disabled={isSubmitting || code.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className='text-xs text-gray-500 text-center'>
            Lost access to your authenticator? Contact support via tickets to reset 2FA.
          </p>
        </form>
      </div>
    </div>
  );
};

export default TwoFactorModal;
