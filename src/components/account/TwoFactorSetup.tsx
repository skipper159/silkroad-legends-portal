import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { fetchWithAuth, weburl } from '@/lib/api';
import { Shield, ShieldCheck, ShieldOff, QrCode, Loader2, Copy, Check } from 'lucide-react';

interface TwoFactorSetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

const TwoFactorSetup = ({ onStatusChange }: TwoFactorSetupProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch 2FA status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetchWithAuth(`${weburl}/api/2fa/status`);
        if (response.ok) {
          const data = await response.json();
          setIsEnabled(data.enabled);
          onStatusChange?.(data.enabled);
        }
      } catch (err) {
        console.error('Failed to fetch 2FA status:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [onStatusChange]);

  // Start 2FA setup
  const handleStartSetup = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${weburl}/api/2fa/setup`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start setup');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setSetupMode(true);
    } catch (err) {
      toast({
        title: 'Setup Failed',
        description: err instanceof Error ? err.message : 'Could not start 2FA setup',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify code and enable 2FA
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${weburl}/api/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }

      setIsEnabled(true);
      setSetupMode(false);
      setQrCode(null);
      setSecret(null);
      setVerificationCode('');
      onStatusChange?.(true);

      toast({
        title: '2FA Enabled',
        description: 'Two-Factor Authentication is now active on your account',
      });
    } catch (err) {
      toast({
        title: 'Verification Failed',
        description: err instanceof Error ? err.message : 'Invalid code',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Disable 2FA
  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      toast({
        title: 'Password Required',
        description: 'Please enter your password to disable 2FA',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${weburl}/api/2fa/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disablePassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }

      setIsEnabled(false);
      setDisablePassword('');
      onStatusChange?.(false);

      toast({
        title: '2FA Disabled',
        description: 'Two-Factor Authentication has been removed from your account',
      });
    } catch (err) {
      toast({
        title: 'Failed to Disable',
        description: err instanceof Error ? err.message : 'Could not disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy secret to clipboard
  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className='bg-theme-surface border-theme-primary/30'>
        <CardContent className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-theme-primary' />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='bg-theme-surface border-theme-primary/30'>
      <CardHeader>
        <CardTitle className='text-theme-primary flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Add an extra layer of security to your account using an authenticator app</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Display */}
        <div
          className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
            isEnabled ? 'bg-green-500/10 border border-green-500/30' : 'bg-gray-700/50 border border-gray-600'
          }`}
        >
          {isEnabled ? (
            <>
              <ShieldCheck className='h-6 w-6 text-green-500' />
              <div>
                <p className='font-semibold text-green-400'>2FA is Enabled</p>
                <p className='text-sm text-gray-400'>Your account is protected with two-factor authentication</p>
              </div>
            </>
          ) : (
            <>
              <ShieldOff className='h-6 w-6 text-gray-400' />
              <div>
                <p className='font-semibold text-gray-300'>2FA is Disabled</p>
                <p className='text-sm text-gray-400'>Enable 2FA to add extra security to your account</p>
              </div>
            </>
          )}
        </div>

        {/* Setup Mode */}
        {setupMode && qrCode && (
          <div className='space-y-6'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-white mb-2'>Scan QR Code</h3>
              <p className='text-sm text-gray-400 mb-4'>
                Use Google Authenticator, Authy, or any TOTP app to scan this code
              </p>

              {/* QR Code */}
              <div className='inline-block p-4 bg-white rounded-lg mb-4'>
                <img src={qrCode} alt='2FA QR Code' className='w-48 h-48' />
              </div>

              {/* Manual Entry */}
              {secret && (
                <div className='mt-4'>
                  <p className='text-sm text-gray-400 mb-2'>Or enter this code manually:</p>
                  <div className='flex items-center justify-center gap-2'>
                    <code className='px-3 py-2 bg-gray-800 rounded text-theme-primary font-mono text-sm'>{secret}</code>
                    <Button variant='ghost' size='sm' onClick={copySecret} className='text-gray-400 hover:text-white'>
                      {copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='verification-code'>Enter 6-Digit Code</Label>
                <Input
                  id='verification-code'
                  type='text'
                  inputMode='numeric'
                  pattern='[0-9]*'
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder='000000'
                  className='bg-theme-surface border-theme-primary/20 text-theme-text text-center text-2xl tracking-widest'
                />
              </div>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setSetupMode(false);
                    setQrCode(null);
                    setSecret(null);
                    setVerificationCode('');
                  }}
                  className='flex-1'
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='flex-1 bg-theme-primary hover:bg-theme-accent text-theme-text-on-primary'
                  disabled={isSubmitting || verificationCode.length !== 6}
                >
                  {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                  Verify & Enable
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Enable Button */}
        {!isEnabled && !setupMode && (
          <Button
            onClick={handleStartSetup}
            className='w-full bg-theme-primary hover:bg-theme-accent text-theme-text-on-primary'
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : <QrCode className='h-4 w-4 mr-2' />}
            Enable Two-Factor Authentication
          </Button>
        )}

        {/* Disable Form */}
        {isEnabled && !setupMode && (
          <form onSubmit={handleDisable} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='disable-password'>Enter Password to Disable 2FA</Label>
              <Input
                id='disable-password'
                type='password'
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder='Your current password'
                className='bg-theme-surface border-theme-primary/20 text-theme-text'
              />
            </div>
            <Button type='submit' variant='destructive' className='w-full' disabled={isSubmitting || !disablePassword}>
              {isSubmitting ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
              Disable Two-Factor Authentication
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;
