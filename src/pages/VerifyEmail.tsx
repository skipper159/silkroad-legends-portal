import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { weburl } from '@/lib/api';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`${weburl}/api/auth/verify-email/${token}`, {
          method: 'GET',
        });

        if (response.ok) {
          setIsVerified(true);
          toast({
            title: 'Email verified',
            description: 'Your email address has been successfully verified.',
          });
          // Optional: Redirect to login page after successful verification
          setTimeout(() => navigate('/login'), 3000);
        } else {
          toast({
            title: 'Verification Error',
            description: 'The verification link is invalid or expired.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Email verification error:', error);
        toast({
          title: 'Network Error',
          description: 'An error occurred while verifying your email address.',
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast, navigate]);

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
                <h1 className='text-3xl font-bold'>Email Verification</h1>
                {isVerifying ? (
                  <p className='text-theme-text-muted mt-2'>Verifying your email address...</p>
                ) : isVerified ? (
                  <p className='text-theme-text-muted mt-2'>Your email address has been successfully verified.</p>
                ) : (
                  <p className='text-theme-text-muted mt-2'>The verification link is invalid or expired.</p>
                )}
              </div>

              <div className='text-center'>
                {isVerifying ? (
                  <div className='loader'></div>
                ) : isVerified ? (
                  <div>
                    <p className='mb-6 text-theme-text-muted'>
                      Thank you for verifying your email address. You can now log in.
                    </p>
                    <Link to='/login'>
                      <Button className='btn-primary w-full'>Go to Login</Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    <p className='mb-6 text-theme-text-muted'>
                      This verification link is invalid or expired. Please request a new link.
                    </p>
                    <Link to='/resend-verification'>
                      <Button className='btn-primary w-full'>Request New Link</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default VerifyEmail;
