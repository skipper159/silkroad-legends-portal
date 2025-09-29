import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { weburl } from '@/lib/api';
import useFingerprint from '@/hooks/useFingerprint';

const Register = () => {
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

    // Fingerprint warten bevor Registrierung
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
        fingerprint, // Anti-Cheat Fingerprint hinzufügen
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

      const data = await response.text();

      if (response.ok) {
        toast({
          title: 'Registration Successful',
          description: 'Welcome to Silkroad Legends! Redirecting to login in 5 seconds.',
        });
        setRedirectCountdown(5);
      } else {
        toast({
          title: 'Registration failed',
          description: data || 'Something went wrong during registration.',
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
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow bg-register-bg bg-cover bg-center'>
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='max-w-md mx-auto'>
            <div className='card backdrop-blur-sm border-silkroad-gold/30'>
              <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold'>Register</h1>
                <p className='text-gray-400 mt-2'>Create your Silkroad Legends account</p>
                {referralCode && (
                  <div className='mt-4 p-3 bg-lafftale-gold/10 border border-lafftale-gold/30 rounded-lg'>
                    <p className='text-sm text-lafftale-gold'>
                      🎉 You've been invited! Referral code: <span className='font-mono font-bold'>{referralCode}</span>
                    </p>
                  </div>
                )}

                {/* Anti-Cheat Status */}
                <div className='mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    {fingerprintLoading ? (
                      <>
                        <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
                        <span className='text-sm text-blue-400'>Anti-Cheat initialisiert...</span>
                      </>
                    ) : fingerprint ? (
                      <>
                        <div className='w-4 h-4 bg-green-500 rounded-full'></div>
                        <span className='text-sm text-green-400'>Anti-Cheat aktiv</span>
                        <span className='text-xs text-gray-500 font-mono'>ID: {fingerprint.substring(0, 8)}...</span>
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
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Choose a username'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email address'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Create a strong password'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm Password</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Confirm your password'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='terms'
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(!!checked)}
                    required
                  />
                  <Label htmlFor='terms' className='text-sm text-gray-300'>
                    I agree to the{' '}
                    <Link to='/terms' className='text-silkroad-gold hover:underline'>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to='/privacy' className='text-silkroad-gold hover:underline'>
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type='submit'
                  className='btn-primary w-full'
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
                <p className='text-gray-400'>
                  Already have an account?{' '}
                  <Link to='/login' className='text-silkroad-gold hover:underline'>
                    Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;
