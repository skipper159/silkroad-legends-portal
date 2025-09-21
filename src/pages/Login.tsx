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

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

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
        toast({
          title: 'Login Successful',
          description: 'Welcome back to Lafftale online!',
        });

        try {
          // JWT dekodieren
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          console.log('JWT Payload:', payload);
          console.log('User data being sent:', data.user);

          // Auth-Kontext aktualisieren und Token speichern
          const isAdmin = payload.isAdmin || false;
          console.log('isAdmin status:', isAdmin);
          login(data.token, isAdmin);

          // Sofortige Navigation ohne Verzögerung
          if (isAdmin) {
            console.log('Redirecting to AdminDashboard');
            navigate('/AdminDashboard', { replace: true });
          } else {
            console.log('Redirecting to account');
            navigate('/account', { replace: true });
          }
        } catch (error) {
          console.error('Error decoding JWT:', error);
          // Fallback for JWT decoding errors
          navigate('/account', { replace: true });
        }
      } else {
        if (data?.needsVerification) {
          toast({
            title: 'Email not verified',
            description: 'Please verify your email address to log in.',
            variant: 'destructive',
          });

          // Redirect to the page for resending the verification email
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
    </div>
  );
};

export default Login;
