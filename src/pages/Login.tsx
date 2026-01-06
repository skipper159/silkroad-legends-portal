import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { weburl } from '@/lib/api';
import TwoFactorModal from '@/components/TwoFactorModal';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLoginSuccess = (data: { token: string; user: any }) => {
    try {
      // JWT dekodieren
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      console.log('JWT Payload:', payload);

      // Update auth context and save token
      const isAdmin = payload.isAdmin || false;
      login(data.token, isAdmin);

      toast({
        title: 'Login Successful',
        description: 'Welcome back to Lafftale online!',
      });

      // Sofortige Navigation ohne Verzögerung
      if (isAdmin) {
        navigate('/AdminDashboard', { replace: true });
      } else {
        navigate('/account', { replace: true });
      }
    } catch (error) {
      console.error('Error decoding JWT:', error);
      navigate('/account', { replace: true });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${weburl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();

      if (response.ok) {
        // Check if 2FA is required
        if (data.requires2FA && data.tempToken) {
          setTempToken(data.tempToken);
          setShow2FAModal(true);
          setIsLoading(false);
          return;
        }

        // Normal login success
        handleLoginSuccess(data);
      } else {
        if (data?.needsVerification) {
          toast({
            title: 'Email not verified',
            description: 'Please verify your email address to log in.',
            variant: 'destructive',
          });
          setTimeout(() => navigate('/resend-verification'), 2000);
        } else {
          toast({
            title: 'Login Failed',
            description: data?.message || 'Incorrect Login Data.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Network Fail',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASuccess = (data: { token: string; user: object }) => {
    setShow2FAModal(false);
    setTempToken(null);
    handleLoginSuccess(data as { token: string; user: any });
  };

  const handle2FACancel = () => {
    setShow2FAModal(false);
    setTempToken(null);
    toast({
      title: '2FA Cancelled',
      description: 'Login cancelled. Please try again.',
      variant: 'destructive',
    });
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow bg-login-bg bg-cover bg-center'>
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='max-w-md mx-auto'>
            <div className='card backdrop-blur-sm border-silkroad-gold/30'>
              <div className='text-center mb-8'>
                <h1 className='text-3xl font-bold'>Login</h1>
                <p className='text-gray-400 mt-2'>Sign in to your Silkroad Lafftale account</p>
              </div>

              <form onSubmit={handleLogin} className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='username'>Username or Email</Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Enter your username or email'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <Label htmlFor='password'>Password</Label>
                    <Link to='/forgot-password' className='text-sm text-silkroad-gold hover:underline'>
                      Forgot Password?
                    </Link>
                  </div>
                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder='Enter your password'
                    required
                    className='bg-silkroad-dark/70 border-silkroad-gold/20 focus:border-silkroad-gold'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='remember'
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor='remember' className='text-sm text-gray-300'>
                    Remember me
                  </Label>
                </div>

                <Button type='submit' className='btn-primary w-full' disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-gray-400'>
                  Don't have an account?{' '}
                  <Link to='/register' className='text-silkroad-gold hover:underline'>
                    Register now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* 2FA Modal */}
      {show2FAModal && tempToken && (
        <TwoFactorModal tempToken={tempToken} onSuccess={handle2FASuccess} onCancel={handle2FACancel} />
      )}
    </div>
  );
};

export default Login;
