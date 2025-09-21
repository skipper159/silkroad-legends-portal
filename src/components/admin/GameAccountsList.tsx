import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Ban, TimerReset, Info } from 'lucide-react';
import { weburl } from '@/lib/api';
import SearchBar from './SearchBar';

interface GameAccount {
  GameAccountId: number;
  Username: string;
  CharName16: string;
  CharID: number;
  GuildID: number;
  GuildName: string;
  JobType: number;
  JobName: string;
  REG_IP: string;
  RegTime: string;
  AccPlayTime: string;
  IsBanned: boolean;
  TimeoutUntil: string | null;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  data: GameAccount[];
  pagination: PaginationInfo;
}

const GameAccountsList = () => {
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const fetchAccounts = async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '100',
      });

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`${weburl}/api/admin/gameaccounts?${params}`);
      if (!res.ok) throw new Error('Failed to fetch game accounts');
      const response: ApiResponse = await res.json();

      setAccounts(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchTerm.trim()) {
      setIsSearching(true);
      await fetchAccounts(1, searchTerm);
      setIsSearching(false);
    } else {
      await fetchAccounts(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      fetchAccounts(newPage, searchTerm);
    }
  };

  const banAccount = async (id: number) => {
    await fetch(`${weburl}/api/admin/gameaccounts/${id}/ban`, { method: 'PUT' });
    fetchAccounts(currentPage, searchTerm);
  };

  const timeoutAccount = async (id: number) => {
    await fetch(`${weburl}/api/admin/gameaccounts/${id}/timeout`, { method: 'PUT' });
    fetchAccounts(currentPage, searchTerm);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
      <div className='mb-4 flex gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder='Search by username...'
          className='flex-1 px-3 py-2 border border-lafftale-gold/30 bg-lafftale-dark text-white rounded-md'
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className='bg-lafftale-gold text-black hover:bg-lafftale-gold/80'
        >
          {isSearching ? <Loader2 className='animate-spin' size={16} /> : 'Search'}
        </Button>
      </div>

      <Card className='overflow-x-auto border-lafftale-gold/30'>
        <table className='min-w-full text-left text-sm text-gray-300'>
          <thead className='bg-lafftale-darkgray text-lafftale-gold uppercase'>
            <tr>
              <th className='p-3'>ID</th>
              <th className='p-3'>Username</th>
              <th className='p-3'>Character</th>
              <th className='p-3'>Guild</th>
              <th className='p-3'>Job</th>
              <th className='p-3'>REG IP</th>
              <th className='p-3'>Reg Time</th>
              <th className='p-3'>Play Time</th>
              <th className='p-3'>Banned</th>
              <th className='p-3'>Timeout</th>
              <th className='p-3 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? (
              accounts.map((acc) => (
                <tr key={acc.GameAccountId} className='border-b border-lafftale-gold/30 hover:bg-lafftale-dark/20'>
                  <td className='p-3'>{acc.GameAccountId}</td>
                  <td className='p-3'>{acc.Username}</td>
                  <td className='p-3'>{acc.CharName16 || '—'}</td>
                  <td className='p-3'>{acc.GuildName || '—'}</td>
                  <td className='p-3'>{acc.JobName || acc.JobType || '—'}</td>
                  <td className='p-3'>{acc.REG_IP || '—'}</td>
                  <td className='p-3'>{acc.RegTime ? new Date(acc.RegTime).toLocaleString() : '—'}</td>
                  <td className='p-3'>{acc.AccPlayTime || '—'}</td>
                  <td className='p-3'>{acc.IsBanned ? '✅' : '❌'}</td>
                  <td className='p-3'>{acc.TimeoutUntil ? new Date(acc.TimeoutUntil).toLocaleString() : '—'}</td>
                  <td className='p-3 flex gap-2 justify-center'>
                    <Button size='sm' variant='destructive' onClick={() => banAccount(acc.GameAccountId)}>
                      <Ban size={16} />
                    </Button>
                    <Button size='sm' variant='secondary' onClick={() => timeoutAccount(acc.GameAccountId)}>
                      <TimerReset size={16} />
                    </Button>
                    <Button size='sm' variant='outline'>
                      <Info size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className='p-4 text-center text-gray-400'>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='mt-4 flex justify-between items-center'>
          <div className='text-sm text-gray-400'>
            Showing {accounts.length} of {pagination.totalCount} results
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              disabled={!pagination.hasPrev || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className='text-lafftale-gold border-lafftale-gold/30'
            >
              Previous
            </Button>

            <div className='flex items-center gap-2'>
              {/* Show page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let page;
                if (pagination.totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= pagination.totalPages - 2) {
                  page = pagination.totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'default' : 'outline'}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[40px] ${
                      page === currentPage
                        ? 'bg-lafftale-gold text-black'
                        : 'text-lafftale-gold border-lafftale-gold/30'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant='outline'
              disabled={!pagination.hasNext || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className='text-lafftale-gold border-lafftale-gold/30'
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default GameAccountsList;
