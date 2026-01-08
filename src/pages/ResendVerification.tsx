import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { weburl } from '@/lib/api';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${weburl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast({
          title: 'Email sent',
          description: 'A new verification email has been sent to your address.',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Error',
          description: data?.message || 'An error occurred while sending the email.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Resend verification error:', error);
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
    <Layout>
      <main
        className='flex-grow bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.loginBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 py-16 md:py-24'>
          <div className='max-w-md mx-auto'>
            <div className='card backdrop-blur-sm border-theme-primary/30'>
              <div className='text-center mb-8'>
                {' '}
                <h1 className='text-3xl font-bold'>Resend Verification Email</h1>
                <p className='text-theme-text-muted mt-2'>
                  {isSubmitted
                    ? 'Check your email for the verification link'
                    : 'Enter your email address to receive a new verification link'}
                </p>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='space-y-2'>
                    {' '}
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Enter your registered email address'
                      required
                      className='bg-theme-surface/70 border-theme-primary/20 focus:border-theme-primary'
                    />
                  </div>

                  <Button type='submit' className='btn-primary w-full' disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Verification Link'}
                  </Button>
                </form>
              ) : (
                <div className='text-center'>
                  {' '}
                  <p className='mb-6 text-theme-text-muted'>
                    We have sent you an email with a new verification link. Please check your inbox and spam folder.
                  </p>
                  <Button className='btn-primary w-full' onClick={() => setIsSubmitted(false)}>
                    Resend
                  </Button>
                </div>
              )}

              <div className='mt-6 text-center'>
                <p className='text-theme-text-muted'>
                  <Link to='/login' className='text-theme-primary hover:underline'>
                    Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default ResendVerification;
