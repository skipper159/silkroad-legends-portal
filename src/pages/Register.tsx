import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { weburl } from '@/lib/api';
import useFingerprint from '@/hooks/useFingerprint';
import { useTheme } from '@/context/ThemeContext';

const Register = () => {
  const { currentTemplate } = useTheme();
  const { Layout, AuthLayout } = currentTemplate.components;
  const LayoutComponent = AuthLayout || Layout;
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');
  const { fingerprint, isLoading: fingerprintLoading } = useFingerprint();

  useEffect(() => {
    if (redirectCountdown !== null) {
      if (redirectCountdown <= 0) {
        navigate('/login');
      } else {
        const timer = setTimeout(() => {
          setRedirectCountdown(redirectCountdown - 1);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [redirectCountdown, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    if (!agreeTerms) {
      toast({
        title: 'Terms agreement required',
        description: 'Please accept the terms of service to register.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    if (!fingerprint) {
      toast({
        title: 'Anti-Cheat loading',
        description: 'Please wait while we prepare security measures...',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    try {
      const requestBody: any = {
        username,
        email,
        password,
        fingerprint,
      };
      if (referralCode) {
        requestBody.referralCode = referralCode;
        console.log('Sending referral code:', referralCode);
      }

      console.log('Registration request body:', {
        ...requestBody,
        fingerprint: fingerprint ? fingerprint.substring(0, 8) + '...' : 'null',
      });

      const response = await fetch(`${weburl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.text();
        toast({
          title: 'Registration Successful',
          description: 'Welcome to Silkroad Legends! Redirecting to login in 5 seconds.',
        });
        setRedirectCountdown(5);
      } else {
        let errorMessage = 'Something went wrong during registration.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch {
          errorMessage = (await response.text()) || errorMessage;
        }

        toast({
          title: 'Registration failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Network error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutComponent>
      <div
        className='flex-grow bg-cover bg-center py-16 md:py-24'
        style={{
          backgroundImage: `url('${currentTemplate.assets.registerBackground}')`,
        }}
      >
        <div className='container mx-auto px-4'>
          <div className='max-w-md mx-auto'>
            <div
              className='p-6 transition-all'
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                backdropFilter: 'blur(var(--theme-card-blur))',
                borderRadius: 'var(--theme-card-radius)',
                border: 'var(--theme-card-border-width) solid var(--theme-border)',
                boxShadow: 'var(--theme-card-shadow)',
              }}
            >
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-theme-primary'>Register</h2>
                <p className='text-theme-text-muted mt-2'>Create your Silkroad Legends account</p>
                {referralCode && (
                  <div className='mt-4 space-y-3'>
                    <div className='p-3 bg-theme-primary/10 border border-theme-primary/30 rounded-lg'>
                      <p className='text-sm text-theme-primary'>
                        🎉 You've been invited! Referral code:{' '}
                        <span className='font-mono font-bold'>{referralCode}</span>
                      </p>
                    </div>

                    {/* Referral Requirements */}
                    <div className='p-4 bg-theme-surface border border-theme-border rounded-lg text-left'>
                      <h3 className='text-sm font-semibold text-theme-primary mb-2'>📋 Referral Requirements</h3>
                      <ul className='text-xs text-theme-text-muted space-y-1'>
                        <li>
                          • <strong>One Account per Person:</strong> Only one referral account per IP address and
                          browser
                        </li>
                        <li>
                          • <strong>Real Players:</strong> Account must reach at least Level 20
                        </li>
                        <li>
                          • <strong>Playtime:</strong> Minimum 5 hours of active gameplay required
                        </li>
                        <li>
                          • <strong>Reward:</strong> Points are awarded after 24h and meeting the requirements
                        </li>
                        <li>
                          • <strong>Fair Play:</strong> Multiple accounts or cheating attempts are automatically
                          detected
                        </li>
                      </ul>
                      <p className='text-xs text-blue-400 mt-2'>
                        ℹ️ Our Anti-Cheat system protects against abuse and ensures fair rewards.
                      </p>
                    </div>
                  </div>
                )}

                {/* Anti-Cheat Status */}
                <div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
                  <div className='flex items-center justify-center space-x-2'>
                    {fingerprintLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-sm text-blue-400'>Anti-Cheat initializing...</span>
                      </>
                    ) : fingerprint ? (
                      <>
                        <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                        <span className='text-sm text-green-400'>Anti-Cheat active</span>
                        <span className='text-xs text-theme-text-muted font-mono'>
                          ID: {fingerprint.substring(0, 8)}...
                        </span>
                      </>
                    ) : (
                      <>
                        <div className='w-4 h-4 bg-red-500 rounded-full'></div>
                        <span className='text-sm text-red-400'>Anti-Cheat Error</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegister} className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='username' className='text-theme-text'>
                    Username
                  </Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Choose a username'
                    required
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-theme-text'>
                    Email
                  </Label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email address'
                    required
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password' className='text-theme-text'>
                    Password
                  </Label>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Create a strong password'
                    required
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword' className='text-theme-text'>
                    Confirm Password
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm your password'
                    required
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='terms'
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    required
                  />
                  <Label htmlFor='terms' className='text-sm text-theme-text-muted'>
                    I agree to the{' '}
                    <Link to='/terms' className='text-theme-primary hover:underline'>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to='/privacy' className='text-theme-primary hover:underline'>
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300'
                  disabled={isLoading || fingerprintLoading || !fingerprint}
                >
                  {isLoading
                    ? 'Creating Account...'
                    : fingerprintLoading
                    ? 'Preparing Security...'
                    : !fingerprint
                    ? 'Security Check Required'
                    : 'Create Account'}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-theme-text-muted'>
                  Already have an account?{' '}
                  <Link to='/login' className='text-theme-primary hover:underline'>
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
};

export default Register;
