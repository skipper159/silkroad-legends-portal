import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, RefreshCw, TrendingUp, Users, DollarSign, Gift, Crown, Coins } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface SilkAccount {
  gameJID: number;
  portalJID: number;
  username: string;
  portalUsername: string;
  nickname: string;
  gameRegDate: string;
  lastLogin: string | null;
  silkBalance: {
    premiumSilk: number;
    silk: number;
    vipLevel: number;
    errorCode: number;
  };
}

interface ServerStats {
  totalPremiumSilk: number;
  totalSilk: number;
  totalSilkValue: number;
  totalAccounts: number;
  accountsWithSilk: number;
  vipAccounts: number;
  donations: {
    totalDonations: number;
    totalDonatedUSD: number;
    totalDonatedSilk: number;
    uniqueDonors: number;
  };
  calculationDuration?: number;
  lastCalculated: string;
  cached: boolean;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  data: SilkAccount[];
  pagination: PaginationInfo;
}

const SilkAdminPanel = () => {
  const [accounts, setAccounts] = useState<SilkAccount[]>([]);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [giveAmount, setGiveAmount] = useState('');
  const [giveReason, setGiveReason] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<SilkAccount | null>(null);
  const [isGivingProcess, setIsGivingProcess] = useState(false);

  const { token } = useAuth();

  const fetchAccounts = async (page = 1, search = '') => {
    try {
      setLoading(page === 1);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        ...(search && { search }),
      });

      const response = await fetch(`${weburl}/api/admin/silk/accounts?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      setAccounts(result.data);
      setPagination(result.pagination);
      setError(null);
    } catch (err) {
      console.error('Error loading Silk Accounts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchCachedServerStats = async () => {
    try {
      setStatsLoading(true);

      // Only load cached stats - NO live calculation!
      const response = await fetch(`${weburl}/api/admin/silk/server-stats?cached=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setServerStats(result.data);
      } else {
        // No cached data available
        setServerStats({
          totalPremiumSilk: 0,
          totalSilk: 0,
          totalSilkValue: 0,
          totalAccounts: 0,
          accountsWithSilk: 0,
          vipAccounts: 0,
          donations: {
            totalDonations: 0,
            totalDonatedUSD: 0,
            totalDonatedSilk: 0,
            uniqueDonors: 0,
          },
          lastCalculated: 'Never calculated',
          cached: false,
        });
      }
    } catch (err) {
      console.error('Error loading cached Server Stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchServerStats = async (forceRefresh = false) => {
    try {
      setStatsLoading(true);
      const params = forceRefresh ? '?refresh=true' : '';

      const response = await fetch(`${weburl}/api/admin/silk/server-stats${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setServerStats(result.data);
    } catch (err) {
      console.error('Error loading Server Stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setCurrentPage(1);
    await fetchAccounts(1, searchTerm);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage);
    await fetchAccounts(newPage, searchTerm);
  };

  const handleGiveSilk = async () => {
    if (!selectedAccount || !giveAmount || parseInt(giveAmount) <= 0) {
      alert('Please select an account and enter a valid Silk amount.');
      return;
    }

    try {
      setIsGivingProcess(true);

      const response = await fetch(`${weburl}/api/admin/silk/give`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetJID: selectedAccount.portalJID,
          amount: parseInt(giveAmount),
          reason: giveReason || 'Admin Silk Gift',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        alert(`✅ ${giveAmount} Silk successfully granted to ${selectedAccount.username}!`);
        setGiveAmount('');
        setGiveReason('');
        setSelectedAccount(null);

        // Refresh data
        await fetchAccounts(currentPage, searchTerm);
        await fetchServerStats(true);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Error granting Silk:', err);
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGivingProcess(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US');
  };

  useEffect(() => {
    fetchAccounts();
    fetchCachedServerStats(); // Only load cached data, no live calculation
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading Silk Administration...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Server Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-theme-surface border-theme-border'>
          <div className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-theme-text-muted'>Total Silk Volume</p>
              <p className='text-2xl font-bold text-theme-primary mt-2'>
                {serverStats ? formatNumber(serverStats.totalSilkValue) : '---'}
              </p>
            </div>
            <div className='p-3 bg-theme-primary/10 rounded-full'>
              <Coins className='h-6 w-6 text-theme-primary' />
            </div>
          </div>
        </Card>

        <Card className='bg-theme-surface border-purple-900/50'>
          <div className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-theme-text-muted'>Premium Silk</p>
              <p className='text-2xl font-bold text-purple-400 mt-2'>
                {serverStats ? formatNumber(serverStats.totalPremiumSilk) : '---'}
              </p>
            </div>
            <div className='p-3 bg-purple-900/20 rounded-full'>
              <Crown className='h-6 w-6 text-purple-400' />
            </div>
          </div>
        </Card>

        <Card className='bg-theme-surface border-green-900/50'>
          <div className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-theme-text-muted'>Accounts with Silk</p>
              <p className='text-2xl font-bold text-green-400 mt-2'>
                {serverStats ? formatNumber(serverStats.accountsWithSilk) : '---'}
              </p>
            </div>
            <div className='p-3 bg-green-900/20 rounded-full'>
              <Users className='h-6 w-6 text-green-400' />
            </div>
          </div>
        </Card>

        <Card className='bg-theme-surface border-blue-900/50'>
          <div className='p-6 flex items-center justify-between'>
            <div>
              <p className='text-sm font-medium text-theme-text-muted'>Total Donations</p>
              <p className='text-2xl font-bold text-blue-400 mt-2'>
                ${serverStats ? formatNumber(serverStats.donations.totalDonatedUSD) : '---'}
              </p>
            </div>
            <div className='p-3 bg-blue-900/20 rounded-full'>
              <DollarSign className='h-6 w-6 text-blue-400' />
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Refresh Button */}
      <div className='flex justify-between items-center px-2'>
        <div className='text-xs text-theme-text-muted font-mono'>
          {serverStats && (
            <span>
              Last update: {formatDate(serverStats.lastCalculated)}
              {serverStats.cached && ' (cached)'}
              {serverStats.calculationDuration && ` • ${serverStats.calculationDuration}s`}
            </span>
          )}
        </div>
        <Button
          onClick={() => fetchServerStats(true)}
          disabled={statsLoading}
          variant='ghost'
          size='sm'
          className='text-theme-text-muted hover:text-theme-text hover:bg-theme-highlight/10'
        >
          {statsLoading ? <Loader2 className='h-3 w-3 animate-spin mr-2' /> : <RefreshCw className='h-3 w-3 mr-2' />}
          Update Statistics
        </Button>
      </div>

      {/* Give Silk Panel */}
      {selectedAccount && (
        <Card className='bg-theme-surface border-theme-primary/40 shadow-lg shadow-theme-primary/5 animate-in fade-in slide-in-from-top-4 duration-300'>
          <div className='p-6'>
            <div className='flex items-center gap-3 mb-6 border-b border-theme-border pb-4'>
              <div className='p-2 bg-theme-primary/20 rounded'>
                <Gift className='h-5 w-5 text-theme-primary' />
              </div>
              <div>
                <h3 className='text-lg font-bold text-theme-text'>Give Silk Reward</h3>
                <p className='text-sm text-theme-text-muted'>
                  To user: <span className='text-theme-primary'>{selectedAccount.username}</span>
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-theme-text-muted'>Amount</label>
                <div className='relative'>
                  <Coins className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-text-muted' />
                  <Input
                    type='number'
                    placeholder='e.g. 1000'
                    value={giveAmount}
                    onChange={(e) => setGiveAmount(e.target.value)}
                    className='bg-theme-surface/50 border-theme-border pl-9 focus:border-theme-primary/50'
                    min='1'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-theme-text-muted'>Reason (Optional)</label>
                <Input
                  placeholder='e.g. Event Reward'
                  value={giveReason}
                  onChange={(e) => setGiveReason(e.target.value)}
                  className='bg-theme-surface/50 border-theme-border focus:border-theme-primary/50'
                />
              </div>
              <div className='flex items-end gap-3'>
                <Button
                  onClick={handleGiveSilk}
                  disabled={isGivingProcess || !giveAmount || parseInt(giveAmount) <= 0}
                  className='bg-green-600 hover:bg-green-700 text-white flex-1'
                >
                  {isGivingProcess ? (
                    <Loader2 className='h-4 w-4 animate-spin mr-2' />
                  ) : (
                    <Gift className='h-4 w-4 mr-2' />
                  )}
                  Send Silk
                </Button>
                <Button
                  onClick={() => setSelectedAccount(null)}
                  variant='outline'
                  className='border-theme-border hover:bg-theme-surface'
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Search and Controls */}
      <div className='flex gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-muted' />
          <Input
            placeholder='Search by username...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className='pl-10 bg-theme-surface border-theme-primary/30 text-theme-text placeholder:text-theme-text-muted'
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-accent px-6'
        >
          {isSearching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
          <span className='ml-2 hidden sm:inline'>Search</span>
        </Button>
      </div>

      {/* Accounts Table */}
      <Card className='overflow-hidden border-theme-border bg-theme-surface'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm text-theme-text-muted'>
            <thead className='bg-theme-surface/50 text-theme-primary uppercase'>
              <tr>
                <th className='p-3 pl-4'>User Details</th>
                <th className='p-3'>IDs (Portal/Game)</th>
                <th className='p-3'>Premium Silk</th>
                <th className='p-3'>Normal Silk</th>
                <th className='p-3'>VIP Status</th>
                <th className='p-3'>Registered</th>
                <th className='p-3 text-right pr-4'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length > 0 ? (
                accounts.map((account) => (
                  <tr
                    key={account.portalJID}
                    className='border-b border-theme-border hover:bg-theme-surface/30 transition-colors'
                  >
                    <td className='p-3 pl-4'>
                      <div className='font-medium text-theme-text'>{account.username}</div>
                      {account.nickname && account.nickname !== account.username && (
                        <div className='text-xs text-theme-text-muted'>Nick: {account.nickname}</div>
                      )}
                    </td>
                    <td className='p-3'>
                      <div className='flex gap-2 text-xs'>
                        <span className='bg-theme-surface px-1.5 py-0.5 rounded border border-theme-border text-theme-text-muted'>
                          P: {account.portalJID}
                        </span>
                        <span className='bg-theme-surface px-1.5 py-0.5 rounded border border-theme-border text-theme-text-muted'>
                          G: {account.gameJID}
                        </span>
                      </div>
                    </td>
                    <td className='p-3'>
                      <span className='font-bold text-purple-400'>{formatNumber(account.silkBalance.premiumSilk)}</span>
                    </td>
                    <td className='p-3'>
                      <span className='font-bold text-green-400'>{formatNumber(account.silkBalance.silk)}</span>
                    </td>
                    <td className='p-3'>
                      {account.silkBalance.vipLevel > 0 ? (
                        <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-yellow-900/20 text-yellow-500 border border-yellow-900/40'>
                          VIP {account.silkBalance.vipLevel}
                        </span>
                      ) : (
                        <span className='text-theme-text-muted text-xs'>-</span>
                      )}
                    </td>
                    <td className='p-3 text-theme-text-muted text-xs'>{formatDate(account.gameRegDate)}</td>
                    <td className='p-3 pr-4 text-right'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => setSelectedAccount(account)}
                        className='h-7 text-xs border-theme-primary/30 text-theme-primary hover:bg-theme-primary/10'
                      >
                        <Gift className='h-3 w-3 mr-1.5' />
                        Give Silk
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className='p-8 text-center text-theme-text-muted'>
                    No accounts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex justify-between items-center bg-theme-surface p-4 rounded-lg border border-theme-border'>
          <div className='text-sm text-theme-text-muted'>
            Page {pagination.currentPage} of {pagination.totalPages} ({formatNumber(pagination.totalCount)} total)
          </div>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrev}
              className='text-theme-primary border-theme-primary/30 hover:bg-theme-primary/10'
            >
              Previous
            </Button>

            <div className='flex items-center gap-1'>
              {/* Simplified Pagination for now, ideally matched exact logic if needed */}
              <div className='text-xs text-theme-text-muted font-mono px-2'>
                {pagination.currentPage} / {pagination.totalPages}
              </div>
            </div>

            <Button
              size='sm'
              variant='outline'
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNext}
              className='text-theme-primary border-theme-primary/30 hover:bg-theme-primary/10'
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Card className='bg-red-900/20 border-red-500/30 p-4 animate-in fade-in slide-in-from-top-2'>
          <p className='text-red-400 flex items-center gap-2'>
            <span className='h-2 w-2 rounded-full bg-red-500 animate-pulse' />
            Error: {error}
          </p>
        </Card>
      )}
    </div>
  );
};

export default SilkAdminPanel;
