import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, ShieldCheck } from 'lucide-react';
import { weburl } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ConfirmAccountDeletion = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'used'>('loading');
  const [gameAccountName, setGameAccountName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Invalid token');
      return;
    }

    const confirmDeletion = async () => {
      try {
        const response = await fetch(`${weburl}/api/gameaccount/confirm-deletion/${token}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setGameAccountName(data.deletedAccount || 'Game Account');
        } else {
          if (data.error?.includes('expired')) {
            setStatus('expired');
          } else if (data.error?.includes('already been used')) {
            setStatus('used');
          } else {
            setStatus('error');
            setErrorMessage(data.error || 'Failed to delete account');
          }
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('Network error occurred');
      }
    };

    confirmDeletion();
  }, [token]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Card className='bg-lafftale-darkgray border-lafftale-gold/30 max-w-md mx-auto'>
            <CardHeader className='text-center'>
              <CardTitle className='text-lafftale-gold flex items-center justify-center gap-2'>
                <Loader2 className='animate-spin' size={24} />
                Processing Deletion
              </CardTitle>
              <CardDescription>Please wait while we confirm your account deletion...</CardDescription>
            </CardHeader>
          </Card>
        );

      case 'success':
        return (
          <Card className='bg-lafftale-darkgray border-green-500/30 max-w-md mx-auto'>
            <CardHeader className='text-center'>
              <CardTitle className='text-green-500 flex items-center justify-center gap-2'>
                <CheckCircle size={24} />
                Account Deleted Successfully
              </CardTitle>
              <CardDescription>Your game account has been permanently deleted.</CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='p-4 bg-green-500/10 rounded-lg border border-green-500/20'>
                <p className='text-green-500 font-medium'>
                  Game Account "<span className='text-lafftale-gold'>{gameAccountName}</span>" has been permanently
                  deleted.
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  All characters, items, and progress associated with this account have been removed.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = '/account')}
                className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
              >
                Return to Account Management
              </Button>
            </CardContent>
          </Card>
        );

      case 'expired':
        return (
          <Card className='bg-lafftale-darkgray border-orange-500/30 max-w-md mx-auto'>
            <CardHeader className='text-center'>
              <CardTitle className='text-orange-500 flex items-center justify-center gap-2'>
                <XCircle size={24} />
                Deletion Link Expired
              </CardTitle>
              <CardDescription>This deletion confirmation link has expired.</CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='p-4 bg-orange-500/10 rounded-lg border border-orange-500/20'>
                <p className='text-orange-500 font-medium'>
                  This deletion link expired after 1 hour for security reasons.
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  If you still want to delete your game account, please initiate a new deletion request.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = '/account?tab=game-accounts')}
                className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
              >
                Go to Game Account Management
              </Button>
            </CardContent>
          </Card>
        );

      case 'used':
        return (
          <Card className='bg-lafftale-darkgray border-blue-500/30 max-w-md mx-auto'>
            <CardHeader className='text-center'>
              <CardTitle className='text-blue-500 flex items-center justify-center gap-2'>
                <ShieldCheck size={24} />
                Already Processed
              </CardTitle>
              <CardDescription>This deletion confirmation has already been used.</CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='p-4 bg-blue-500/10 rounded-lg border border-blue-500/20'>
                <p className='text-blue-500 font-medium'>
                  This deletion token has already been used to delete an account.
                </p>
                <p className='text-sm text-gray-400 mt-2'>
                  Each deletion link can only be used once for security reasons.
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = '/account')}
                className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
              >
                Return to Account Management
              </Button>
            </CardContent>
          </Card>
        );

      case 'error':
      default:
        return (
          <Card className='bg-lafftale-darkgray border-red-500/30 max-w-md mx-auto'>
            <CardHeader className='text-center'>
              <CardTitle className='text-red-500 flex items-center justify-center gap-2'>
                <XCircle size={24} />
                Deletion Failed
              </CardTitle>
              <CardDescription>Unable to process the account deletion.</CardDescription>
            </CardHeader>
            <CardContent className='text-center space-y-4'>
              <div className='p-4 bg-red-500/10 rounded-lg border border-red-500/20'>
                <p className='text-red-500 font-medium'>Error:</p>
                <p className='text-sm text-gray-400'>{errorMessage}</p>
              </div>
              <Button
                onClick={() => (window.location.href = '/account')}
                className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
              >
                Return to Account Management
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />
      <main className='flex-grow bg-login-bg bg-cover bg-center flex items-center justify-center px-4'>
        <div className='w-full max-w-lg'>{renderContent()}</div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmAccountDeletion;
