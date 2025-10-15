import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, CheckCircle, XCircle, Clock, History } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { SimpleGameAccountSelector } from '@/components/common/SimpleGameAccountSelector';

interface VoucherUsage {
  id: number;
  voucher_code: string;
  type: string;
  value: number;
  redeemed_at: string;
  status: string;
  max_uses?: number;
  used_count?: number;
  game_account_jid?: number;
  game_account_name?: string;
}

const UserVouchers: React.FC = () => {
  const [redeemCode, setRedeemCode] = useState('');
  const [selectedAccountJid, setSelectedAccountJid] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const [historyFilterJid, setHistoryFilterJid] = useState<number | null>(null); // Separate filter for history
  const [historyFilterAccount, setHistoryFilterAccount] = useState<any>(null);
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [voucherHistory, setVoucherHistory] = useState<VoucherUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchGameAccounts();
      fetchVoucherHistory();
    }
  }, [isAuthenticated, historyFilterJid]); // Refetch when filter changes

  const fetchGameAccounts = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/characters/gameaccounts/my`);
      if (response.ok) {
        const data = await response.json();
        setAvailableAccounts(data);
      }
    } catch (error) {
      console.error('Error fetching game accounts:', error);
    }
  };

  const fetchVoucherHistory = async () => {
    try {
      setLoading(true);
      let url = `${weburl}/api/vouchers/history`;
      if (historyFilterJid) {
        url += `?gameAccountJid=${historyFilterJid}`;
      }

      const response = await fetchWithAuth(url);

      if (response.ok) {
        const data = await response.json();
        setVoucherHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching voucher history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemVoucher = async () => {
    if (!redeemCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a voucher code',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAccountJid) {
      toast({
        title: 'Error',
        description: 'Please select a game account to receive the rewards',
        variant: 'destructive',
      });
      return;
    }

    setRedeeming(true);
    try {
      const response = await fetchWithAuth(`${weburl}/api/vouchers/redeem`, {
        method: 'POST',
        body: JSON.stringify({
          code: redeemCode.trim(),
          targetJid: selectedAccountJid,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success!',
          description: data.message || 'Voucher redeemed successfully',
        });
        setRedeemCode('');
        // Reload history to show the new voucher
        fetchVoucherHistory();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Voucher could not be redeemed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Voucher could not be redeemed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRedeeming(false);
    }
  };

  const getTypeString = (type: number | string): string => {
    // Convert numeric type to string
    if (typeof type === 'number') {
      switch (type) {
        case 1:
          return 'silk';
        case 2:
          return 'gold';
        case 3:
          return 'experience';
        case 4:
          return 'item';
        default:
          return 'unknown';
      }
    }
    return typeof type === 'string' ? type : 'unknown';
  };

  const getTypeColor = (type: number | string) => {
    const typeString = getTypeString(type);
    switch (typeString.toLowerCase()) {
      case 'silk':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'experience':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'item':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: number | string) => {
    const typeString = getTypeString(type);
    switch (typeString.toLowerCase()) {
      case 'silk':
        return '🔮';
      case 'gold':
        return '🪙';
      case 'experience':
        return '⭐';
      case 'item':
        return '🎁';
      default:
        return '🎁';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'redeemed':
      case 'success':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'failed':
      case 'error':
        return <XCircle className='h-4 w-4 text-red-500' />;
      case 'pending':
        return <Clock className='h-4 w-4 text-yellow-500' />;
      default:
        return <CheckCircle className='h-4 w-4 text-green-500' />;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Gift className='h-8 w-8 text-lafftale-gold' />
        <div>
          <h2 className='text-2xl font-bold text-gray-100'>Voucher System</h2>
          <p className='text-gray-400'>Redeem voucher codes and receive rewards</p>
        </div>
      </div>

      {/* Redeem Voucher */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold'>Redeem Voucher</CardTitle>
          <CardDescription className='text-gray-400'>Enter a voucher code to receive your reward</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <SimpleGameAccountSelector
              selectedAccountJid={selectedAccountJid}
              onAccountChange={(jid, account) => {
                setSelectedAccountJid(jid);
                setSelectedAccount(account);
              }}
              label='Target Game Account'
              placeholder='Select account to receive rewards...'
            />

            <div className='flex gap-4'>
              <div className='flex-1'>
                <Label htmlFor='voucher-code' className='text-gray-300'>
                  Voucher Code
                </Label>
                <Input
                  id='voucher-code'
                  type='text'
                  placeholder='Enter voucher code...'
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className='mt-1 bg-lafftale-dark border-lafftale-gold/30 text-gray-100'
                  disabled={redeeming}
                />
              </div>
              <div className='flex items-end'>
                <Button
                  onClick={handleRedeemVoucher}
                  disabled={redeeming || !redeemCode.trim() || !selectedAccountJid}
                  className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
                >
                  {redeeming ? 'Redeeming...' : 'Redeem'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voucher History */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold flex items-center gap-2'>
            <History className='h-5 w-5' />
            Voucher History
          </CardTitle>
          <CardDescription className='text-gray-400'>Overview of your redeemed vouchers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4'>
            <div className='space-y-2'>
              <Label className='text-gray-300'>Filter by Game Account</Label>
              <Select
                value={historyFilterJid?.toString() || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    setHistoryFilterJid(null);
                    setHistoryFilterAccount(null);
                  } else {
                    const jid = parseInt(value);
                    const account = availableAccounts.find((acc) => acc.id === jid);
                    setHistoryFilterJid(jid);
                    setHistoryFilterAccount(account);
                  }
                }}
              >
                <SelectTrigger className='bg-lafftale-dark border-lafftale-gold/30'>
                  <SelectValue placeholder='Show all accounts...' />
                </SelectTrigger>
                <SelectContent className='bg-lafftale-darkgray'>
                  <SelectItem value='all'>All Accounts</SelectItem>
                  {availableAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      {account.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className='text-center py-8'>
              <div className='text-gray-400'>Loading voucher history...</div>
            </div>
          ) : voucherHistory.length === 0 ? (
            <div className='text-center py-8'>
              <Gift className='h-12 w-12 text-gray-500 mx-auto mb-4' />
              <p className='text-gray-400'>
                {historyFilterJid
                  ? `No vouchers found for ${historyFilterAccount?.StrUserID || 'selected account'}`
                  : "You haven't redeemed any vouchers yet"}
              </p>
              <p className='text-gray-500 text-sm'>Your redeemed vouchers will be displayed here</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {voucherHistory.map((voucher) => (
                <div
                  key={voucher.id}
                  className='flex items-center justify-between p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'
                >
                  <div className='flex items-center gap-3'>
                    <div className='text-2xl'>{getTypeIcon(voucher.type)}</div>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-mono text-sm text-lafftale-gold'>{voucher.voucher_code}</span>
                        {getStatusIcon(voucher.status)}
                      </div>
                      <div className='flex items-center gap-2 mt-1'>
                        <Badge className={getTypeColor(voucher.type)}>{getTypeString(voucher.type)}</Badge>
                        {voucher.max_uses > 1 && (
                          <Badge variant='outline' className='text-xs text-blue-400 border-blue-400'>
                            {voucher.used_count}/{voucher.max_uses} used
                          </Badge>
                        )}
                        {voucher.game_account_name && !historyFilterJid && (
                          <Badge variant='outline' className='text-xs text-purple-400 border-purple-400'>
                            {voucher.game_account_name}
                          </Badge>
                        )}
                        <span className='text-sm text-gray-400'>
                          {new Date(voucher.redeemed_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='text-lg font-bold text-lafftale-gold'>+{voucher.value}</div>
                    <div className='text-xs text-gray-400 uppercase'>{getTypeString(voucher.type)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserVouchers;
