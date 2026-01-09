import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import TwoFactorSetup from './TwoFactorSetup';

interface AccountWebSettingsProps {
  userData: {
    username: string;
    email: string;
    registeredAt: string;
    lastLogin: string;
  };
}

const AccountWebSettings = ({ userData }: AccountWebSettingsProps) => {
  const [email, setEmail] = useState(userData.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { toast } = useToast();

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        title: 'Password Required',
        description: 'Please enter your current password to change email',
        variant: 'destructive',
      });
      return;
    }

    // Mock API call - will be replaced with actual API call later
    toast({
      title: 'Email Updated',
      description: 'Your email has been successfully updated',
    });
    setCurrentPassword('');
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        title: 'Current Password Required',
        description: 'Please enter your current password',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Password Too Short',
        description: 'New password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }

    // Mock API call - will be replaced with actual API call later
    toast({
      title: 'Password Updated',
      description: 'Your password has been successfully changed',
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold font-cinzel text-theme-primary mb-6'>Web Account Settings</h2>

        <Card className='bg-theme-surface border-theme-primary/30'>
          <CardHeader>
            <CardTitle className='text-theme-primary'>Change Email Address</CardTitle>
            <CardDescription>Update the email address associated with your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailChange} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>New Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='flex-1'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='current-password-email'>Current Password</Label>
                <Input
                  id='current-password-email'
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className='flex-1'
                  required
                />
              </div>
              <Button type='submit' className='bg-theme-primary hover:bg-theme-primary/90 text-theme-text-on-primary'>
                Update Email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className='bg-theme-surface border-theme-primary/30'>
        <CardHeader>
          <CardTitle className='text-theme-primary'>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='current-password'>Current Password</Label>
              <Input
                id='current-password'
                type='password'
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className='bg-theme-surface/70 border-theme-primary/20'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='new-password'>New Password</Label>
              <Input
                id='new-password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className='bg-theme-surface/70 border-theme-primary/20'
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='confirm-password'>Confirm New Password</Label>
              <Input
                id='confirm-password'
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='bg-theme-surface/70 border-theme-primary/20'
                required
              />
            </div>
            <Button type='submit' className='bg-theme-primary hover:bg-theme-primary/90 text-theme-text-on-primary'>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <TwoFactorSetup />
    </div>
  );
};

export default AccountWebSettings;
