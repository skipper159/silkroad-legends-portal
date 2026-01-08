import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  Users,
  UserCheck,
  Shield,
  UserX,
  Key,
  ShieldAlert,
  BadgeCheck,
  ShieldBan,
  MoreHorizontal,
} from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface WebAccount {
  Id: number;
  Username: string;
  Email: string;
  RegisteredAt: string;
  LastLogin: string;
  totp_enabled: boolean;
  IsAdmin: boolean;
  is_active: boolean; // Note: API might return this specific casing, need to verify or map it
}

interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  inactive_users: number;
}

const WebAccountsList = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WebAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<WebAccount[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Password Reset State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAccounts(), fetchUserStats()]);
    setLoading(false);
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetchWithAuth(`${weburl}/api/admin/webaccounts`);
      if (res.ok) {
        const data = await res.json();
        // Ensure we map the data correctly if backend fields differ
        // The /api/admin/webaccounts endpoint returns: Id, Username, Email, RegisteredAt, LastLogin, IsAdmin, totp_enabled
        // We might need to fetch 'is_active' as well if it's not currently returned, or assume active
        // Let's assume the backend will be updated or we use the users endpoint logic if needed.
        // For now, let's use the data as provided and default missing fields.

        // Actually, to fully replace UserRolesManager, we need is_active.
        // The admin.js route for /webaccounts returns: id, username, email, created_at, updated_at, ur.is_admin, u.totp_enabled
        // It does NOT currently return is_active from users table.
        // We should handle this gracefully or update backend. For now, let's handle the UI.
        setAccounts(data);
        setFilteredAccounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/user-stats`);
      const data = await response.json();
      if (data.success) {
        setUserStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleReset2FA = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to disable 2FA for user ${username}?`)) return;

    try {
      const res = await fetchWithAuth(`${weburl}/api/admin/users/${userId}/reset-2fa`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to reset 2FA');
      const result = await res.json();

      toast({ title: 'Success', description: result.message });

      setAccounts((prev) => prev.map((acc) => (acc.Id === userId ? { ...acc, totp_enabled: false } : acc)));
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleAdminRole = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users/${userId}/admin`, {
        method: 'PUT',
        body: JSON.stringify({ is_admin: !currentStatus }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: `Admin rights ${!currentStatus ? 'granted' : 'revoked'}` });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update admin role', variant: 'destructive' });
    }
  };

  // We need to implement toggleUserStatus, but first we need to ensure the backend supports it for the list
  // The UserRolesManager used /api/user-roles/users/${userId}/status

  const resetPassword = async () => {
    if (!selectedUserId || !newPassword.trim()) {
      toast({ title: 'Error', description: 'Please enter a password', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users/${selectedUserId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Password reset successfully' });
        setPasswordModalOpen(false);
        setNewPassword('');
        setSelectedUserId(null);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to reset password', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      setFilteredAccounts(
        accounts.filter(
          (account) =>
            account.Username.toLowerCase().includes(lowercaseSearch) ||
            account.Email.toLowerCase().includes(lowercaseSearch)
        )
      );
    } else {
      setFilteredAccounts(accounts);
    }
  }, [searchTerm, accounts]);

  if (loading && accounts.length === 0) {
    return (
      <div className='flex justify-center py-10 text-theme-primary'>
        <Loader2 className='animate-spin mr-2' />
        Loading...
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      {userStats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='bg-theme-surface border-theme-primary/20'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-theme-text-muted'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-theme-primary' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{userStats.total_users.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className='bg-theme-surface border-green-900/50'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-theme-text-muted'>Active</CardTitle>
              <UserCheck className='h-4 w-4 text-green-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{userStats.active_users}</div>
            </CardContent>
          </Card>
          <Card className='bg-theme-surface border-blue-900/50'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-theme-text-muted'>Admins</CardTitle>
              <Shield className='h-4 w-4 text-blue-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{userStats.admin_users}</div>
            </CardContent>
          </Card>
          <Card className='bg-theme-surface border-red-900/50'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-theme-text-muted'>Inactive</CardTitle>
              <UserX className='h-4 w-4 text-red-500' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-white'>{userStats.inactive_users}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className='bg-theme-surface border-theme-primary/30 sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='text-theme-primary'>Reset Password</DialogTitle>
            <DialogDescription className='text-theme-text-muted'>Enter a new password for the user.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <div>
              <Label htmlFor='new_password'>New Password</Label>
              <Input
                id='new_password'
                type='password'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder='Enter new password...'
                className='bg-theme-surface/50 border-gray-600'
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setPasswordModalOpen(false)} className='border-gray-600'>
              Cancel
            </Button>
            <Button
              onClick={resetPassword}
              className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-accent'
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder='Search by username or email...' />

      <Card className='overflow-hidden border-theme-primary/30 bg-theme-surface'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm text-gray-300'>
            <thead className='bg-theme-surface/50 text-theme-primary uppercase'>
              <tr>
                <th className='p-3'>User Info</th>
                <th className='p-3'>Security</th>
                <th className='p-3'>2FA Status</th>
                <th className='p-3'>Role</th>
                <th className='p-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.Id} className='border-b border-theme-primary/10 hover:bg-theme-surface/30'>
                    <td className='p-3'>
                      <div className='font-medium text-white'>{acc.Username}</div>
                      <div className='text-xs text-theme-text-muted'>{acc.Email}</div>
                      <div className='text-xs text-theme-text-muted mt-1'>
                        ID: {acc.Id} | Reg: {new Date(acc.RegisteredAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className='p-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 text-xs border-gray-700 hover:bg-theme-primary/10'
                        onClick={() => {
                          setSelectedUserId(acc.Id);
                          setPasswordModalOpen(true);
                        }}
                      >
                        <Key className='w-3 h-3 mr-1' /> Reset PW
                      </Button>
                    </td>
                    <td className='p-3'>
                      <div className='flex items-center gap-2'>
                        {acc.totp_enabled ? (
                          <Badge variant='outline' className='bg-green-900/20 text-green-400 border-green-900'>
                            <BadgeCheck className='w-3 h-3 mr-1' /> Enabled
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='bg-gray-800 text-theme-text-muted border-gray-700'>
                            <ShieldAlert className='w-3 h-3 mr-1' /> Disabled
                          </Badge>
                        )}
                        {acc.totp_enabled && (
                          <Button
                            variant='ghost'
                            size='sm'
                            className='h-6 w-6 p-0 text-red-400 hover:text-red-300'
                            onClick={() => handleReset2FA(acc.Id, acc.Username)}
                            title='Reset 2FA'
                          >
                            <ShieldBan className='w-3 h-3' />
                          </Button>
                        )}
                      </div>
                    </td>
                    <td className='p-3'>
                      <Badge
                        className={`cursor-pointer select-none ${
                          acc.IsAdmin
                            ? 'bg-theme-primary text-theme-text-on-primary hover:bg-theme-accent'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => toggleAdminRole(acc.Id, acc.IsAdmin)}
                      >
                        {acc.IsAdmin ? <Shield className='w-3 h-3 mr-1' /> : <Users className='w-3 h-3 mr-1' />}
                        {acc.IsAdmin ? 'Admin' : 'User'}
                      </Badge>
                    </td>
                    <td className='p-3'>
                      {/* Placeholder for future Actions like Ban/Unban if implemented fully */}
                      <span className='text-xs text-theme-text-muted'>Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className='p-8 text-center text-theme-text-muted'>
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default WebAccountsList;
