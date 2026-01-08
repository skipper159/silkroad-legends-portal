import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { weburl } from '@/lib/api';
import TwoFactorModal from '@/components/TwoFactorModal';
import { useTheme } from '@/context/ThemeContext';

const Login = () => {
  const { currentTemplate } = useTheme();
  const { Layout, AuthLayout } = currentTemplate.components;
  const LayoutComponent = AuthLayout || Layout;
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
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      console.log('JWT Payload:', payload);

      const isAdmin = payload.isAdmin || false;
      login(data.token, isAdmin);

      toast({
        title: 'Login Successful',
        description: 'Welcome back to Lafftale online!',
      });

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
        if (data.requires2FA && data.tempToken) {
          setTempToken(data.tempToken);
          setShow2FAModal(true);
          setIsLoading(false);
          return;
        }
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
    <LayoutComponent>
      <div
        className='flex-grow bg-cover bg-center py-16 md:py-24'
        style={{
          backgroundImage: `url('${currentTemplate.assets.loginBackground}')`,
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
                <h2 className='text-3xl font-bold text-theme-primary'>Login</h2>
                <p className='text-theme-text-muted mt-2'>Sign in to your Silkroad Lafftale account</p>
              </div>

              <form onSubmit={handleLogin} className='space-y-6'>
                <div className='space-y-2'>
                  <Label htmlFor='username' className='text-theme-text'>
                    Username or Email
                  </Label>
                  <Input
                    id='username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder='Enter your username or email'
                    required
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <Label htmlFor='password' className='text-theme-text'>
                      Password
                    </Label>
                    <Link to='/forgot-password' className='text-sm text-theme-primary hover:underline'>
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
                    className='bg-theme-background/70 border-theme-border focus:border-theme-primary text-theme-text'
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Checkbox
                    id='remember'
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor='remember' className='text-sm text-theme-text-muted'>
                    Remember me
                  </Label>
                </div>

                <Button
                  type='submit'
                  className='w-full bg-theme-primary hover:bg-theme-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300'
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className='mt-6 text-center'>
                <p className='text-theme-text-muted'>
                  Don't have an account?{' '}
                  <Link to='/register' className='text-theme-primary hover:underline'>
                    Register now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      {show2FAModal && tempToken && (
        <TwoFactorModal tempToken={tempToken} onSuccess={handle2FASuccess} onCancel={handle2FACancel} />
      )}
    </LayoutComponent>
  );
};

export default Login;
