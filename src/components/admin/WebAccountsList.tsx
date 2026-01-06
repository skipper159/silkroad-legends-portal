import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { weburl } from '@/lib/api';
import SearchBar from './SearchBar';
import { Button } from '@/components/ui/button';
import { Shield, ShieldAlert, BadgeCheck, ShieldBan } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface WebAccount {
  Id: number;
  Username: string;
  Email: string;
  RegisteredAt: string;
  LastLogin: string;
  totp_enabled: boolean;
}

const WebAccountsList = () => {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<WebAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<WebAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await fetch(`${weburl}/api/admin/webaccounts`);
        if (!res.ok) throw new Error('Failed to fetch accounts');
        const data = await res.json();
        setAccounts(data);
        setFilteredAccounts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleReset2FA = async (userId: number, username: string) => {
    if (!confirm(`Are you sure you want to disable 2FA for user ${username}?`)) return;

    try {
      const res = await fetch(`${weburl}/api/admin/users/${userId}/reset-2fa`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to reset 2FA');
      }

      const result = await res.json();
      alert(result.message);

      // Update local state
      setAccounts(
        accounts.map((acc) => {
          if (acc.Id === userId) {
            return { ...acc, totp_enabled: false };
          }
          return acc;
        })
      );
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
  if (loading) {
    return (
      <div className='flex justify-center py-10 text-lafftale-gold'>
        <Loader2 className='animate-spin mr-2' />
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 text-center py-4'>Error: {error}</div>;
  }

  return (
    <>
      <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder='Search by username or email...' />{' '}
      <Card className='overflow-x-auto border-lafftale-gold/30'>
        <table className='min-w-full text-left text-sm text-gray-300'>
          <thead className='bg-lafftale-darkgray text-lafftale-gold uppercase'>
            <tr>
              <th className='p-3'>ID</th>
              <th className='p-3'>Username</th>
              <th className='p-3'>Email</th>
              <th className='p-3'>Registered</th>
              <th className='p-3'>Last Login</th>
              <th className='p-3'>2FA</th>
              <th className='p-3'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <tr key={acc.Id} className='border-b border-lafftale-gold/30 hover:bg-lafftale-dark/20'>
                  <td className='p-3'>{acc.Id}</td>
                  <td className='p-3'>{acc.Username}</td>
                  <td className='p-3'>{acc.Email}</td>
                  <td className='p-3'>{new Date(acc.RegisteredAt).toLocaleString()}</td>
                  <td className='p-3'>{new Date(acc.LastLogin).toLocaleString()}</td>
                  <td className='p-3'>
                    {acc.totp_enabled ? (
                      <div className='flex items-center text-green-500 gap-1'>
                        <BadgeCheck className='w-4 h-4' />
                        <span className='text-xs'>Enabled</span>
                      </div>
                    ) : (
                      <div className='flex items-center text-gray-500 gap-1'>
                        <ShieldAlert className='w-4 h-4' />
                        <span className='text-xs'>Disabled</span>
                      </div>
                    )}
                  </td>
                  <td className='p-3'>
                    {acc.totp_enabled && (
                      <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => handleReset2FA(acc.Id, acc.Username)}
                        className='h-7 text-xs'
                      >
                        <ShieldBan className='w-3 h-3 mr-1' />
                        Reset 2FA
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className='p-4 text-center text-gray-400'>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
};

export default WebAccountsList;
