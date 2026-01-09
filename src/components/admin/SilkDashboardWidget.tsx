import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Coins, TrendingUp, Users, Crown, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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
  isStale?: boolean;
}

interface SilkDashboardWidgetProps {
  compact?: boolean;
}

const SilkDashboardWidget = ({ compact = false }: SilkDashboardWidgetProps) => {
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchCachedServerStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Only fetch cached stats - NO live query!
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
        // Check if data is older than 1 hour
        const lastUpdated = new Date(result.data.lastCalculated);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const isStale = lastUpdated < oneHourAgo;

        setServerStats({
          ...result.data,
          isStale,
        });
      } else {
        // Fallback to empty stats if no cached data available
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
          lastCalculated: 'Never',
          cached: false,
          isStale: true,
        });
      }
      setError(null);
    } catch (err) {
      console.error('Error loading cached Silk Stats:', err);
      setError('Error loading Silk statistics');
      // Fallback auf leere Stats
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
        lastCalculated: 'Error',
        cached: false,
        isStale: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCompactNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = Date.now();
    const diff = now - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return 'a few seconds ago';
    if (minutes < 60) return `${minutes} min. ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hrs. ago`;
    return date.toLocaleDateString('en-US');
  };

  useEffect(() => {
    fetchCachedServerStats();

    // Remove auto-refresh - only manual updates!
    // Dashboard Widget should not start automatic live queries
  }, []);

  if (loading && !serverStats) {
    return (
      <Card className='bg-theme-surface/50 border-theme-border p-4'>
        <div className='flex items-center justify-center h-20'>
          <Loader2 className='h-6 w-6 animate-spin text-theme-primary' />
          <span className='ml-2 text-theme-text-muted'>Loading Silk Statistics...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className='bg-red-900/20 border-red-500/30 p-4'>
        <div className='flex items-center justify-center h-20'>
          <span className='text-red-400 text-sm'>❌ {error}</span>
        </div>
      </Card>
    );
  }

  if (!serverStats) {
    return null;
  }

  if (compact) {
    // Compact Dashboard Version
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='bg-gradient-to-br from-theme-highlight/20 to-theme-primary/20 border-theme-primary/50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs text-theme-text-muted mb-1'>Total Silk Volume</p>
              <p className='text-xl font-bold text-theme-primary'>{formatCompactNumber(serverStats.totalSilkValue)}</p>
              <p className='text-xs text-theme-text-muted'>{formatNumber(serverStats.totalSilkValue)} Silk</p>
            </div>
            <Coins className='h-8 w-8 text-theme-primary' />
          </div>
        </Card>

        <Card className='bg-gradient-to-br from-purple-600/20 to-purple-400/20 border-purple-400/50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs text-theme-text-muted mb-1'>Premium Silk</p>
              <p className='text-xl font-bold text-purple-400'>{formatCompactNumber(serverStats.totalPremiumSilk)}</p>
              <p className='text-xs text-theme-text-muted'>
                {Math.round((serverStats.totalPremiumSilk / serverStats.totalSilkValue) * 100)}% of total
              </p>
            </div>
            <Crown className='h-8 w-8 text-purple-400' />
          </div>
        </Card>

        <Card className='bg-gradient-to-br from-green-600/20 to-green-400/20 border-green-400/50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs text-theme-text-muted mb-1'>Active Accounts</p>
              <p className='text-xl font-bold text-green-400'>{formatCompactNumber(serverStats.accountsWithSilk)}</p>
              <p className='text-xs text-theme-text-muted'>of {formatNumber(serverStats.totalAccounts)}</p>
            </div>
            <Users className='h-8 w-8 text-green-400' />
          </div>
        </Card>

        <Card className='bg-gradient-to-br from-blue-600/20 to-blue-400/20 border-blue-400/50 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs text-theme-text-muted mb-1'>Total Donations</p>
              <p className='text-xl font-bold text-blue-400'>
                ${formatCompactNumber(serverStats.donations.totalDonatedUSD)}
              </p>
              <p className='text-xs text-theme-text-muted'>
                {formatNumber(serverStats.donations.totalDonations)} Purchases
              </p>
            </div>
            <DollarSign className='h-8 w-8 text-blue-400' />
          </div>
        </Card>
      </div>
    );
  }

  // Full Dashboard Version
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold text-theme-primary'>Server Silk Overview</h2>
        <div className='flex items-center gap-4'>
          <span className='text-sm text-theme-text-muted'>
            Aktualisiert: {formatDate(serverStats.lastCalculated)}
            {serverStats.cached && ' (cached)'}
            {serverStats.isStale && <span className='ml-2 text-theme-highlight text-xs'>• Outdated (&gt;1h)</span>}
          </span>
          <button
            onClick={fetchCachedServerStats}
            disabled={loading}
            className='p-2 rounded-md border border-theme-primary/30 hover:bg-theme-primary/10 transition-colors'
            title='Reload cached statistics'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin text-theme-primary' />
            ) : (
              <RefreshCw className='h-4 w-4 text-theme-primary' />
            )}
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Main Silk Statistics */}
        <Card className='bg-gradient-to-br from-theme-highlight/20 to-theme-primary/20 border-theme-primary/50 p-6 md:col-span-2 lg:col-span-1'>
          <div className='text-center'>
            <Coins className='h-12 w-12 text-theme-primary mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-theme-primary mb-2'>Total Silk Volume</h3>
            <p className='text-4xl font-bold text-theme-text mb-2'>{formatNumber(serverStats.totalSilkValue)}</p>
            <div className='grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-theme-primary/30'>
              <div>
                <p className='text-xs text-theme-text-muted'>Premium Silk</p>
                <p className='text-lg font-bold text-purple-400'>{formatNumber(serverStats.totalPremiumSilk)}</p>
              </div>
              <div>
                <p className='text-xs text-theme-text-muted'>Regular Silk</p>
                <p className='text-lg font-bold text-green-400'>{formatNumber(serverStats.totalSilk)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Statistics */}
        <Card className='bg-gradient-to-br from-green-600/20 to-green-400/20 border-green-400/50 p-6'>
          <div className='text-center'>
            <Users className='h-12 w-12 text-green-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-green-400 mb-2'>Account Activity</h3>
            <p className='text-3xl font-bold text-theme-text mb-2'>{formatNumber(serverStats.accountsWithSilk)}</p>
            <p className='text-sm text-theme-text-muted mb-4'>Accounts with Silk</p>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-xs text-theme-text-muted'>Total Accounts:</span>
                <span className='text-sm font-semibold'>{formatNumber(serverStats.totalAccounts)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs text-theme-text-muted'>VIP Accounts:</span>
                <span className='text-sm font-semibold text-theme-highlight'>
                  {formatNumber(serverStats.vipAccounts)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Donation Statistics */}
        <Card className='bg-gradient-to-br from-blue-600/20 to-blue-400/20 border-blue-400/50 p-6'>
          <div className='text-center'>
            <DollarSign className='h-12 w-12 text-blue-400 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-blue-400 mb-2'>Donation Stats</h3>
            <p className='text-3xl font-bold text-theme-text mb-2'>
              ${formatNumber(serverStats.donations.totalDonatedUSD)}
            </p>
            <p className='text-sm text-theme-text-muted mb-4'>Total Revenue</p>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-xs text-theme-text-muted'>Donations:</span>
                <span className='text-sm font-semibold'>{formatNumber(serverStats.donations.totalDonations)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs text-theme-text-muted'>Unique Donors:</span>
                <span className='text-sm font-semibold'>{formatNumber(serverStats.donations.uniqueDonors)}</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-xs text-theme-text-muted'>Donated Silk:</span>
                <span className='text-sm font-semibold text-purple-400'>
                  {formatNumber(serverStats.donations.totalDonatedSilk)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Info */}
      {serverStats.calculationDuration && (
        <Card className='bg-theme-surface/50 border-theme-border p-4'>
          <div className='flex items-center justify-center gap-4 text-sm text-theme-text-muted'>
            <TrendingUp className='h-4 w-4' />
            <span>Statistiken berechnet in {serverStats.calculationDuration} Sekunden</span>
            {serverStats.cached && (
              <span className='px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs'>CACHED</span>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default SilkDashboardWidget;
