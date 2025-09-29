import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Users, Shield, UserCheck, UserX, Search, Loader2, Edit, MoreHorizontal, Key } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  jid: number;
  last_login: string;
  created_at: string;
}

interface UserStats {
  total_users: number;
  active_users: number;
  admin_users: number;
  inactive_users: number;
}

const UserRolesManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users`);
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Users could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const toggleAdminRole = async (userId: number, isAdmin: boolean) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users/${userId}/admin`, {
        method: 'PUT',
        body: JSON.stringify({ is_admin: !isAdmin }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Admin rights were ${!isAdmin ? 'granted' : 'revoked'}`,
        });
        fetchUsers();
        fetchUserStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Admin status could not be changed',
        variant: 'destructive',
      });
    }
  };

  const toggleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !isActive }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: `User was ${!isActive ? 'activated' : 'deactivated'}`,
        });
        fetchUsers();
        fetchUserStats();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'User status could not be changed',
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async () => {
    if (!selectedUserId || !newPassword.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a new password',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/user-roles/users/${selectedUserId}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Password was reset',
        });
        setPasswordModalOpen(false);
        setNewPassword('');
        setSelectedUserId(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Password could not be reset',
        variant: 'destructive',
      });
    }
  };

  const openPasswordModal = (userId: number) => {
    setSelectedUserId(userId);
    setPasswordModalOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' || (roleFilter === 'admin' && user.is_admin) || (roleFilter === 'user' && !user.is_admin);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Statistics Cards */}
      {userStats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Users</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{userStats.total_users.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Active</CardTitle>
              <UserCheck className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{userStats.active_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Admins</CardTitle>
              <Shield className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{userStats.admin_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Inaktive</CardTitle>
              <UserX className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{userStats.inactive_users}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Password Reset Modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Enter a new password for the user.</DialogDescription>
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
                autoComplete='new-password'
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setPasswordModalOpen(false);
                setNewPassword('');
                setSelectedUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={resetPassword}>Reset Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Users className='h-5 w-5' />
                User & Role Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles and permissions</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className='flex flex-col sm:flex-row gap-4 mb-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search users...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className='w-full sm:w-32'>
                <SelectValue placeholder='Rolle' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Alle Rollen</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='user'>User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-full sm:w-32'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Alle Status</SelectItem>
                <SelectItem value='active'>Aktiv</SelectItem>
                <SelectItem value='inactive'>Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className='rounded-md border'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='h-12 px-4 text-left align-middle font-medium'>User</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>Email</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>JID</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>Role</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>Status</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>Last Login</th>
                    <th className='h-12 px-4 text-left align-middle font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className='border-b'>
                      <td className='p-4'>
                        <div>
                          <div className='font-medium'>{user.username}</div>
                          <div className='text-sm text-muted-foreground'>
                            Registriert: {formatDate(user.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className='p-4'>{user.email}</td>
                      <td className='p-4'>
                        <Badge variant='outline'>JID: {user.jid}</Badge>
                      </td>
                      <td className='p-4'>
                        <Badge
                          variant={user.is_admin ? 'default' : 'secondary'}
                          className='cursor-pointer'
                          onClick={() => toggleAdminRole(user.id, user.is_admin)}
                        >
                          {user.is_admin ? (
                            <>
                              <Shield className='h-3 w-3 mr-1' /> Admin
                            </>
                          ) : (
                            <>
                              <Users className='h-3 w-3 mr-1' /> User
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className='p-4'>
                        <Badge
                          variant={user.is_active ? 'default' : 'secondary'}
                          className={`cursor-pointer ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? (
                            <>
                              <UserCheck className='h-3 w-3 mr-1' /> Aktiv
                            </>
                          ) : (
                            <>
                              <UserX className='h-3 w-3 mr-1' /> Inaktiv
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className='p-4 text-sm text-muted-foreground'>
                        {user.last_login ? formatDate(user.last_login) : 'Nie'}
                      </td>
                      <td className='p-4'>
                        <div className='flex space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => openPasswordModal(user.id)}
                            title='Reset Password'
                          >
                            <Key className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleAdminRole(user.id, user.is_admin)}
                            title={user.is_admin ? 'Admin-Rechte entziehen' : 'Admin-Rechte gewähren'}
                          >
                            <Shield className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? <UserX className='h-4 w-4' /> : <UserCheck className='h-4 w-4' />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className='p-8 text-center text-muted-foreground'>
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRolesManager;
