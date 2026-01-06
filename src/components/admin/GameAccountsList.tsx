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
    <div className='space-y-6'>
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        placeholder='Search by username...'
      />

      <Card className='overflow-hidden border-lafftale-gold/30 bg-lafftale-dark'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm text-gray-300'>
            <thead className='bg-lafftale-darkgray text-lafftale-gold uppercase'>
              <tr>
                <th className='p-3'>ID</th>
                <th className='p-3'>Username</th>
                <th className='p-3'>Character Info</th>
                <th className='p-3'>Guild</th>
                <th className='p-3'>Stats</th>
                <th className='p-3'>Status</th>
                <th className='p-3 text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr
                    key={acc.GameAccountId}
                    className='border-b border-lafftale-gold/10 hover:bg-lafftale-darkgray/30'
                  >
                    <td className='p-3 text-gray-500'>#{acc.GameAccountId}</td>
                    <td className='p-3'>
                      <div className='font-medium text-white'>{acc.Username}</div>
                      <div className='text-xs text-gray-500'>IP: {acc.REG_IP || '—'}</div>
                    </td>
                    <td className='p-3'>
                      <div className='text-white'>{acc.CharName16 || '—'}</div>
                      <div className='text-xs text-gray-500'>{acc.JobName || 'No Job'}</div>
                    </td>
                    <td className='p-3 text-gray-300'>{acc.GuildName || '—'}</td>
                    <td className='p-3 text-xs'>
                      <div className='text-gray-400'>
                        Reg: {acc.RegTime ? new Date(acc.RegTime).toLocaleDateString() : '—'}
                      </div>
                      <div className='text-gray-500'>PlayTime: {acc.AccPlayTime || '0'}m</div>
                    </td>
                    <td className='p-3'>
                      <div className='flex flex-col gap-1'>
                        {acc.IsBanned ? (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-900/50'>
                            Banned
                          </span>
                        ) : (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50'>
                            Active
                          </span>
                        )}
                        {acc.TimeoutUntil && (
                          <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/30 text-yellow-400 border border-yellow-900/50'>
                            Timeout: {new Date(acc.TimeoutUntil).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className='p-3 flex gap-2 justify-center'>
                      <Button
                        size='sm'
                        variant='destructive'
                        className='h-8 w-8 p-0'
                        onClick={() => banAccount(acc.GameAccountId)}
                        title='Ban Account'
                      >
                        <Ban size={14} />
                      </Button>
                      <Button
                        size='sm'
                        variant='secondary'
                        className='h-8 w-8 p-0 bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/40'
                        onClick={() => timeoutAccount(acc.GameAccountId)}
                        title='Timeout'
                      >
                        <TimerReset size={14} />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-8 w-8 p-0 border-gray-700 text-blue-400 hover:bg-blue-900/20'
                        title='Info'
                      >
                        <Info size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className='p-8 text-center text-gray-500'>
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-between items-center bg-lafftale-dark p-4 rounded-lg border border-lafftale-gold/20'>
          <div className='text-sm text-gray-400'>
            Showing {accounts.length} of {pagination.totalCount} results
          </div>
          <div className='flex gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={!pagination.hasPrev || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              className='text-lafftale-gold border-lafftale-gold/30 hover:bg-lafftale-gold/10'
            >
              Previous
            </Button>

            <div className='flex items-center gap-1'>
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
                    size='sm'
                    variant={page === currentPage ? 'default' : 'ghost'}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[32px] h-8 ${
                      page === currentPage
                        ? 'bg-lafftale-gold text-black hover:bg-lafftale-bronze'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant='outline'
              size='sm'
              disabled={!pagination.hasNext || loading}
              onClick={() => handlePageChange(currentPage + 1)}
              className='text-lafftale-gold border-lafftale-gold/30 hover:bg-lafftale-gold/10'
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameAccountsList;
