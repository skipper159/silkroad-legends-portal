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
      console.error('Fehler beim Laden der Silk Accounts:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchCachedServerStats = async () => {
    try {
      setStatsLoading(true);

      // Nur cached Stats laden - KEINE Live-Berechnung!
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
        // Keine cached Daten verfügbar
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
          lastCalculated: 'Nie berechnet',
          cached: false,
        });
      }
    } catch (err) {
      console.error('Fehler beim Laden der cached Server Stats:', err);
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
      console.error('Fehler beim Laden der Server Stats:', err);
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
      alert('Bitte wählen Sie einen Account und geben Sie eine gültige Silk Menge ein.');
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
        alert(`✅ ${giveAmount} Silk erfolgreich an ${selectedAccount.username} vergeben!`);
        setGiveAmount('');
        setGiveReason('');
        setSelectedAccount(null);

        // Refresh data
        await fetchAccounts(currentPage, searchTerm);
        await fetchServerStats(true);
      } else {
        throw new Error(result.error || 'Unbekannter Fehler');
      }
    } catch (err) {
      console.error('Fehler beim Vergeben von Silk:', err);
      alert(`❌ Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`);
    } finally {
      setIsGivingProcess(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  useEffect(() => {
    fetchAccounts();
    fetchCachedServerStats(); // Nur cached Daten laden, keine Live-Berechnung
  }, []);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Lade Silk Administration...</span>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Server Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>Total Silk Volumen</p>
              <p className='text-2xl font-bold text-lafftale-gold'>
                {serverStats ? formatNumber(serverStats.totalSilkValue) : '---'}
              </p>
            </div>
            <Coins className='h-8 w-8 text-lafftale-gold' />
          </div>
        </Card>

        <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>Premium Silk</p>
              <p className='text-2xl font-bold text-purple-400'>
                {serverStats ? formatNumber(serverStats.totalPremiumSilk) : '---'}
              </p>
            </div>
            <Crown className='h-8 w-8 text-purple-400' />
          </div>
        </Card>

        <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>Accounts mit Silk</p>
              <p className='text-2xl font-bold text-green-400'>
                {serverStats ? formatNumber(serverStats.accountsWithSilk) : '---'}
              </p>
            </div>
            <Users className='h-8 w-8 text-green-400' />
          </div>
        </Card>

        <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-400'>Total Donations</p>
              <p className='text-2xl font-bold text-blue-400'>
                ${serverStats ? formatNumber(serverStats.donations.totalDonatedUSD) : '---'}
              </p>
            </div>
            <DollarSign className='h-8 w-8 text-blue-400' />
          </div>
        </Card>
      </div>

      {/* Stats Refresh Button */}
      <div className='flex justify-between items-center'>
        <div className='text-sm text-gray-400'>
          {serverStats && (
            <span>
              Letzte Aktualisierung: {formatDate(serverStats.lastCalculated)}
              {serverStats.cached && ' (cached)'}
              {serverStats.calculationDuration && ` - ${serverStats.calculationDuration}s`}
            </span>
          )}
        </div>
        <Button onClick={() => fetchServerStats(true)} disabled={statsLoading} variant='outline' size='sm'>
          {statsLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <RefreshCw className='h-4 w-4' />}
          <span className='ml-2'>Statistiken aktualisieren</span>
        </Button>
      </div>

      {/* Search and Controls */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Suche nach Username...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className='pl-10 bg-lafftale-dark border-lafftale-gold/30'
              />
            </div>
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/80'
          >
            {isSearching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
            <span className='ml-2'>Suchen</span>
          </Button>
        </div>
      </Card>

      {/* Give Silk Panel */}
      {selectedAccount && (
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30 p-4'>
          <h3 className='text-lg font-bold mb-4 text-lafftale-gold'>Silk vergeben an: {selectedAccount.username}</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm text-gray-400 mb-2'>Silk Menge</label>
              <Input
                type='number'
                placeholder='z.B. 1000'
                value={giveAmount}
                onChange={(e) => setGiveAmount(e.target.value)}
                className='bg-lafftale-dark border-lafftale-gold/30'
                min='1'
              />
            </div>
            <div>
              <label className='block text-sm text-gray-400 mb-2'>Grund (optional)</label>
              <Input
                placeholder='z.B. Event Belohnung'
                value={giveReason}
                onChange={(e) => setGiveReason(e.target.value)}
                className='bg-lafftale-dark border-lafftale-gold/30'
              />
            </div>
            <div className='flex items-end gap-2'>
              <Button
                onClick={handleGiveSilk}
                disabled={isGivingProcess || !giveAmount || parseInt(giveAmount) <= 0}
                className='bg-green-600 hover:bg-green-700'
              >
                {isGivingProcess ? <Loader2 className='h-4 w-4 animate-spin' /> : <Gift className='h-4 w-4' />}
                <span className='ml-2'>Vergeben</span>
              </Button>
              <Button onClick={() => setSelectedAccount(null)} variant='outline'>
                Abbrechen
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Accounts Table */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-lafftale-gold/30'>
                <th className='text-left p-4 text-lafftale-gold'>Username</th>
                <th className='text-left p-4 text-lafftale-gold'>Portal JID</th>
                <th className='text-left p-4 text-lafftale-gold'>Game JID</th>
                <th className='text-left p-4 text-lafftale-gold'>Premium Silk</th>
                <th className='text-left p-4 text-lafftale-gold'>Silk</th>
                <th className='text-left p-4 text-lafftale-gold'>VIP Level</th>
                <th className='text-left p-4 text-lafftale-gold'>Reg. Datum</th>
                <th className='text-left p-4 text-lafftale-gold'>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.portalJID} className='border-b border-gray-700 hover:bg-lafftale-dark/30'>
                  <td className='p-4'>
                    <div>
                      <div className='font-medium'>{account.username}</div>
                      {account.nickname && account.nickname !== account.username && (
                        <div className='text-xs text-gray-400'>{account.nickname}</div>
                      )}
                    </div>
                  </td>
                  <td className='p-4 text-gray-300'>{account.portalJID}</td>
                  <td className='p-4 text-gray-300'>{account.gameJID}</td>
                  <td className='p-4 text-purple-400 font-bold'>{formatNumber(account.silkBalance.premiumSilk)}</td>
                  <td className='p-4 text-green-400 font-bold'>{formatNumber(account.silkBalance.silk)}</td>
                  <td className='p-4'>
                    {account.silkBalance.vipLevel > 0 ? (
                      <span className='text-yellow-400 font-bold'>VIP {account.silkBalance.vipLevel}</span>
                    ) : (
                      <span className='text-gray-400'>-</span>
                    )}
                  </td>
                  <td className='p-4 text-gray-400'>{formatDate(account.gameRegDate)}</td>
                  <td className='p-4'>
                    <Button size='sm' variant='outline' onClick={() => setSelectedAccount(account)} className='text-xs'>
                      <Gift className='h-3 w-3 mr-1' />
                      Silk geben
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className='p-4 border-t border-lafftale-gold/30 flex items-center justify-between'>
            <div className='text-sm text-gray-400'>
              Seite {pagination.currentPage} von {pagination.totalPages}({formatNumber(pagination.totalCount)} Accounts
              gesamt)
            </div>
            <div className='flex gap-2'>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Zurück
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Weiter
              </Button>
            </div>
          </div>
        )}
      </Card>

      {error && (
        <Card className='bg-red-900/20 border-red-500/30 p-4'>
          <p className='text-red-400'>❌ Fehler: {error}</p>
        </Card>
      )}
    </div>
  );
};

export default SilkAdminPanel;
