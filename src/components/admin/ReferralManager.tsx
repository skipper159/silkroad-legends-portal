import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import {
  Users,
  Gift,
  Star,
  Trophy,
  UserPlus,
  Award,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Settings,
  BarChart3,
} from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';

interface AdminReferral {
  id: number;
  code: string;
  name: string;
  ip: string;
  fingerprint: string;
  jid: number;
  invited_jid: number | null;
  points: number;
  reward_silk: number;
  redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
  referrer_username: string;
  referrer_email: string;
  referred_username: string;
  referred_email: string;
  // Anti-Cheat Felder
  ip_address?: string;
  is_valid?: boolean;
  cheat_reason?: string;
}

interface AntiCheatStats {
  total_stats: {
    total_referrals: number;
    valid_referrals: number;
    blocked_referrals: number;
    block_rate_percent: number;
  };
  suspicious_ips: Array<{
    ip_address: string;
    referral_count: number;
    blocked_count: number;
    unique_referrers: number;
  }>;
  cheat_reasons: Array<{
    cheat_reason: string;
    count: number;
  }>;
  daily_trends: Array<{
    date: string;
    total_referrals: number;
    valid_referrals: number;
    blocked_referrals: number;
  }>;
}

interface SuspiciousReferral {
  id: number;
  code: string;
  referrer_jid: number;
  invited_jid: number;
  points: number;
  redeemed: boolean;
  ip_address: string;
  fingerprint: string;
  is_valid: boolean;
  cheat_reason: string;
  created_at: string;
  same_ip_count: number;
  same_fingerprint_count: number;
}

interface ReferralStatistics {
  total_referrals: number;
  pending_referrals: number;
  completed_referrals: number;
  total_rewards_paid: number;
  unique_referrers: number;
}

interface ReferralReward {
  id: number;
  points_required: number;
  silk_reward: number;
  item_id: number | null;
  description: string;
  is_active: boolean;
  created_at: string;
}

interface ReferralSettings {
  // Basis Referral Settings
  points_per_referral: { value: string; description: string };
  minimum_redeem_points: { value: string; description: string };
  silk_per_point: { value: string; description: string };
  referral_enabled: { value: string; description: string };

  // Anti-Cheat Settings
  anticheat_enabled?: { value: string; description: string };
  max_referrals_per_ip_per_day?: { value: string; description: string };
  max_referrals_per_fingerprint_per_day?: { value: string; description: string };
  block_duplicate_ip_referrals?: { value: string; description: string };
  block_duplicate_fingerprint_referrals?: { value: string; description: string };
  suspicious_referral_review_required?: { value: string; description: string };
}

const ReferralManager: React.FC = () => {
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [statistics, setStatistics] = useState<ReferralStatistics | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [antiCheatStats, setAntiCheatStats] = useState<AntiCheatStats | null>(null);
  const [suspiciousReferrals, setSuspiciousReferrals] = useState<SuspiciousReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeframe, setTimeframe] = useState('30');
  const [editingReward, setEditingReward] = useState<ReferralReward | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'rewards' | 'anticheat'>('overview');
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
    fetchStatistics();
    fetchRewards();
    fetchSettings();
    if (activeTab === 'anticheat') {
      fetchAntiCheatData();
    }
  }, [timeframe, activeTab]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals?timeframe=${timeframe}&search=${searchTerm}`);

      if (response.ok) {
        const data = await response.json();
        setReferrals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      setReferrals([]);
      toast({
        title: 'Error',
        description: 'Referrals could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/statistics?timeframe=${timeframe}`);

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics || null);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/rewards`);

      if (response.ok) {
        const data = await response.json();
        setRewards(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setRewards([]);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/settings`);

      if (response.ok) {
        const data = await response.json();
        // New API structure: data.data.settings
        setSettings(data.data?.settings || data.data || null);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettings(null);
    }
  };

  const fetchAntiCheatData = async () => {
    try {
      // Anti-cheat statistics
      const statsResponse = await fetchWithAuth(`${weburl}/api/admin/referrals/anticheat/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAntiCheatStats(statsData.data || null);
      }

      // Suspicious referrals
      const suspiciousResponse = await fetchWithAuth(`${weburl}/api/admin/referrals/anticheat/suspicious`);
      if (suspiciousResponse.ok) {
        const suspiciousData = await suspiciousResponse.json();
        setSuspiciousReferrals(suspiciousData.data || []);
      }
    } catch (error) {
      console.error('Error fetching anti-cheat data:', error);
    }
  };

  const validateSuspiciousReferral = async (referralId: number, isValid: boolean, adminNotes?: string) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/anticheat/validate/${referralId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_valid: isValid,
          admin_notes: adminNotes,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Referral was ${isValid ? 'marked as valid' : 'marked as invalid'}`,
        });

        // Reload data
        await fetchAntiCheatData();
        await fetchReferralData();
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Error validating referral:', error);
      toast({
        title: 'Error',
        description: 'Referral validation failed',
        variant: 'destructive',
      });
    }
  };

  const updateSettings = async (newSettings: Record<string, string>) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Referral settings updated',
        });
        fetchSettings(); // Reload
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Settings could not be saved',
        variant: 'destructive',
      });
    }
  };

  const handleStatusUpdate = async (referralId: number, newStatus: string) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/${referralId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: `Referral status changed to ${newStatus}`,
        });
        fetchReferralData();
        fetchStatistics();
      } else {
        toast({
          title: 'Error',
          description: 'Status could not be changed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Status could not be changed',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReward = async (rewardId: number) => {
    if (!confirm('Do you really want to delete this reward?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/rewards/${rewardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Reward was deleted',
        });
        fetchRewards();
      } else {
        toast({
          title: 'Error',
          description: 'Reward could not be deleted',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Reward could not be deleted',
        variant: 'destructive',
      });
    }
  };

  const handleEditReward = (reward: ReferralReward) => {
    setEditingReward({ ...reward });
    setShowEditModal(true);
  };

  const handleSaveReward = async () => {
    if (!editingReward) return;

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/rewards/${editingReward.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          points_required: editingReward.points_required,
          silk_reward: editingReward.silk_reward,
          item_id: editingReward.item_id,
          description: editingReward.description,
          is_active: editingReward.is_active,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Reward was updated',
        });
        setShowEditModal(false);
        setEditingReward(null);
        fetchRewards();
      } else {
        toast({
          title: 'Error',
          description: 'Reward could not be updated',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Reward could not be updated',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReferral = async (referralId: number) => {
    if (!confirm('Do you really want to delete this referral?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/${referralId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'Referral was deleted',
        });
        fetchReferralData();
        fetchStatistics();
      } else {
        toast({
          title: 'Error',
          description: 'Referral could not be deleted',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Referral could not be deleted',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      !searchTerm ||
      referral.referrer_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.referred_username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && referral.redeemed) ||
      (statusFilter === 'pending' && !referral.redeemed);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <UserPlus className='h-8 w-8 text-lafftale-gold' />
        <div>
          <h2 className='text-2xl font-bold text-lafftale-gold'>Referral Management</h2>
          <p className='text-gray-400'>Manage referrals and rewards</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-gray-700'>
        <nav className='flex space-x-8'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-lafftale-gold text-lafftale-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-lafftale-gold text-lafftale-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              System Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rewards'
                ? 'border-lafftale-gold text-lafftale-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4' />
              Manage Rewards
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anticheat')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'anticheat'
                ? 'border-lafftale-gold text-lafftale-gold'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Eye className='h-4 w-4' />
              Anti-Cheat
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className='space-y-6'>
          {/* Statistiken */}
          {statistics && (
            <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-lafftale-gold'>{statistics.total_referrals}</div>
                    <div className='text-sm text-gray-400'>Total referrals</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-yellow-500'>{statistics.pending_referrals}</div>
                    <div className='text-sm text-gray-400'>Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-500'>{statistics.completed_referrals}</div>
                    <div className='text-sm text-gray-400'>Completed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-red-500'>
                      {statistics.total_referrals - statistics.completed_referrals - statistics.pending_referrals}
                    </div>
                    <div className='text-sm text-gray-400'>Error/Other</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-500'>{statistics.total_rewards_paid}</div>
                    <div className='text-sm text-gray-400'>Rewards</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-indigo-500'>{statistics.unique_referrers}</div>
                    <div className='text-sm text-gray-400'>Active referrers</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and search */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardContent className='pt-6'>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                    <Input
                      placeholder='Search by username or code...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10'
                    />
                  </div>
                </div>
                <div className='w-48'>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                  >
                    <option value='all'>All</option>
                    <option value='pending'>Pending</option>
                    <option value='completed'>Completed</option>
                  </select>
                </div>
                <div className='w-32'>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className='w-full h-10 px-3 rounded-md border border-input bg-background text-sm'
                  >
                    <option value='7'>7 days</option>
                    <option value='30'>30 days</option>
                    <option value='90'>90 days</option>
                    <option value='365'>1 year</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Referral List */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='text-lafftale-gold'>Referral Overview</CardTitle>
              <CardDescription>
                {filteredReferrals.length} of {referrals.length} referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='text-gray-500'>Loading referrals...</div>
                </div>
              ) : filteredReferrals.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-gray-500'>No referrals found</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {filteredReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-4'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{referral.referrer_username || 'Unknown'}</span>
                            <span className='text-gray-400'>→</span>
                            <span className='font-medium'>{referral.referred_username || 'Unknown'}</span>
                          </div>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-sm text-gray-500 font-mono'>{referral.code}</span>
                            <Badge
                              className={
                                referral.redeemed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {referral.redeemed ? 'Redeemed' : 'Pending'}
                            </Badge>
                            <span className='text-sm text-gray-500'>
                              {new Date(referral.created_at).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='text-right mr-4'>
                          <div className='font-bold text-lg'>+{referral.reward_silk}</div>
                          <div className='text-sm text-gray-500'>{referral.redeemed_at ? 'Paid' : 'Pending'}</div>
                        </div>

                        {!referral.redeemed && referral.invited_jid && (
                          <>
                            <Button
                              size='sm'
                              onClick={() => handleStatusUpdate(referral.id, 'completed')}
                              className='btn-primary'
                            >
                              Payout
                            </Button>
                          </>
                        )}

                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDeleteReferral(referral.id)}
                          className='text-red-600 hover:text-red-700 hover:bg-red-50'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className='space-y-6'>
          {/* Referral Settings */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lafftale-gold'>
                <Settings className='h-5 w-5' />
                Referral System Settings
              </CardTitle>
              <CardDescription>Configure the referral system</CardDescription>
            </CardHeader>
            <CardContent>
              {settings ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label htmlFor='points_per_referral' className='text-sm font-medium'>
                      Points per referral
                    </label>
                    <Input
                      id='points_per_referral'
                      type='number'
                      value={settings.points_per_referral.value}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        newSettings.points_per_referral.value = e.target.value;
                        setSettings(newSettings);
                      }}
                      onBlur={() => {
                        updateSettings({
                          points_per_referral: settings.points_per_referral.value,
                        });
                      }}
                    />
                    <p className='text-xs text-gray-500'>{settings.points_per_referral.description}</p>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='minimum_redeem_points' className='text-sm font-medium'>
                      Minimum redeem points
                    </label>
                    <Input
                      id='minimum_redeem_points'
                      type='number'
                      value={settings.minimum_redeem_points.value}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        newSettings.minimum_redeem_points.value = e.target.value;
                        setSettings(newSettings);
                      }}
                      onBlur={() => {
                        updateSettings({
                          minimum_redeem_points: settings.minimum_redeem_points.value,
                        });
                      }}
                    />
                    <p className='text-xs text-gray-500'>{settings.minimum_redeem_points.description}</p>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='silk_per_point' className='text-sm font-medium'>
                      Silk per point
                    </label>
                    <Input
                      id='silk_per_point'
                      type='number'
                      value={settings.silk_per_point.value}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        newSettings.silk_per_point.value = e.target.value;
                        setSettings(newSettings);
                      }}
                      onBlur={() => {
                        updateSettings({
                          silk_per_point: settings.silk_per_point.value,
                        });
                      }}
                    />
                    <p className='text-xs text-gray-500'>{settings.silk_per_point.description}</p>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='referral_enabled' className='text-sm font-medium'>
                      System enabled
                    </label>
                    <select
                      id='referral_enabled'
                      className='w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      value={settings.referral_enabled.value}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        newSettings.referral_enabled.value = e.target.value;
                        setSettings(newSettings);
                        updateSettings({
                          referral_enabled: e.target.value,
                        });
                      }}
                    >
                      <option value='true'>Enabled</option>
                      <option value='false'>Disabled</option>
                    </select>
                    <p className='text-xs text-gray-500'>{settings.referral_enabled.description}</p>
                  </div>
                </div>
              ) : (
                <div className='text-center py-4 text-gray-500'>Loading settings...</div>
              )}
            </CardContent>
          </Card>

          {/* Anti-Cheat Settings */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lafftale-gold'>
                <BarChart3 className='h-5 w-5' />
                Anti-Cheat Settings
              </CardTitle>
              <CardDescription>Configure anti-cheat measures</CardDescription>
            </CardHeader>
            <CardContent>
              {settings ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Anti-cheat enabled */}
                  <div className='space-y-2'>
                    <label htmlFor='anticheat_enabled' className='text-sm font-medium'>
                      Anti-Cheat System
                    </label>
                    <select
                      id='anticheat_enabled'
                      className='w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      value={settings.anticheat_enabled?.value || 'true'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.anticheat_enabled) {
                          newSettings.anticheat_enabled = {
                            value: e.target.value,
                            description: 'Enable anti-cheat protection',
                          };
                        } else {
                          newSettings.anticheat_enabled.value = e.target.value;
                        }
                        setSettings(newSettings);
                        updateSettings({
                          anticheat_enabled: e.target.value,
                        });
                      }}
                    >
                      <option value='true'>Enabled</option>
                      <option value='false'>Disabled</option>
                    </select>
                    <p className='text-xs text-gray-500'>
                      {settings.anticheat_enabled?.description || 'Enables automatic anti-cheat detection'}
                    </p>
                  </div>

                  {/* Max Referrals pro IP */}
                  <div className='space-y-2'>
                    <label htmlFor='max_referrals_per_ip_per_day' className='text-sm font-medium'>
                      Max referrals per IP/day
                    </label>
                    <Input
                      id='max_referrals_per_ip_per_day'
                      type='number'
                      min='1'
                      max='20'
                      value={settings.max_referrals_per_ip_per_day?.value || '5'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.max_referrals_per_ip_per_day) {
                          newSettings.max_referrals_per_ip_per_day = {
                            value: e.target.value,
                            description: 'Maximum referrals per IP per day',
                          };
                        } else {
                          newSettings.max_referrals_per_ip_per_day.value = e.target.value;
                        }
                        setSettings(newSettings);
                      }}
                      onBlur={() => {
                        updateSettings({
                          max_referrals_per_ip_per_day: settings.max_referrals_per_ip_per_day?.value || '5',
                        });
                      }}
                    />
                    <p className='text-xs text-gray-500'>
                      {settings.max_referrals_per_ip_per_day?.description || 'Maximum referrals per IP address per day'}
                    </p>
                  </div>

                  {/* Max Referrals pro Fingerprint */}
                  <div className='space-y-2'>
                    <label htmlFor='max_referrals_per_fingerprint_per_day' className='text-sm font-medium'>
                      Max referrals per fingerprint/day
                    </label>
                    <Input
                      id='max_referrals_per_fingerprint_per_day'
                      type='number'
                      min='1'
                      max='10'
                      value={settings.max_referrals_per_fingerprint_per_day?.value || '3'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.max_referrals_per_fingerprint_per_day) {
                          newSettings.max_referrals_per_fingerprint_per_day = {
                            value: e.target.value,
                            description: 'Maximum referrals per browser fingerprint per day',
                          };
                        } else {
                          newSettings.max_referrals_per_fingerprint_per_day.value = e.target.value;
                        }
                        setSettings(newSettings);
                      }}
                      onBlur={() => {
                        updateSettings({
                          max_referrals_per_fingerprint_per_day:
                            settings.max_referrals_per_fingerprint_per_day?.value || '3',
                        });
                      }}
                    />
                    <p className='text-xs text-gray-500'>
                      {settings.max_referrals_per_fingerprint_per_day?.description ||
                        'Maximum referrals per browser fingerprint per day'}
                    </p>
                  </div>

                  {/* Blockiere gleiche IP */}
                  <div className='space-y-2'>
                    <label htmlFor='block_duplicate_ip_referrals' className='text-sm font-medium'>
                      Block duplicate IP
                    </label>
                    <select
                      id='block_duplicate_ip_referrals'
                      className='w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      value={settings.block_duplicate_ip_referrals?.value || 'true'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.block_duplicate_ip_referrals) {
                          newSettings.block_duplicate_ip_referrals = {
                            value: e.target.value,
                            description: 'Block referrals from same IP as referrer',
                          };
                        } else {
                          newSettings.block_duplicate_ip_referrals.value = e.target.value;
                        }
                        setSettings(newSettings);
                        updateSettings({
                          block_duplicate_ip_referrals: e.target.value,
                        });
                      }}
                    >
                      <option value='true'>Enabled</option>
                      <option value='false'>Disabled</option>
                    </select>
                    <p className='text-xs text-gray-500'>
                      {settings.block_duplicate_ip_referrals?.description ||
                        'Blocks referrals from the same IP as the referrer'}
                    </p>
                  </div>

                  {/* Blockiere gleichen Browser */}
                  <div className='space-y-2'>
                    <label htmlFor='block_duplicate_fingerprint_referrals' className='text-sm font-medium'>
                      Block duplicate browser
                    </label>
                    <select
                      id='block_duplicate_fingerprint_referrals'
                      className='w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      value={settings.block_duplicate_fingerprint_referrals?.value || 'true'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.block_duplicate_fingerprint_referrals) {
                          newSettings.block_duplicate_fingerprint_referrals = {
                            value: e.target.value,
                            description: 'Block referrals from same fingerprint as referrer',
                          };
                        } else {
                          newSettings.block_duplicate_fingerprint_referrals.value = e.target.value;
                        }
                        setSettings(newSettings);
                        updateSettings({
                          block_duplicate_fingerprint_referrals: e.target.value,
                        });
                      }}
                    >
                      <option value='true'>Enabled</option>
                      <option value='false'>Disabled</option>
                    </select>
                    <p className='text-xs text-gray-500'>
                      {settings.block_duplicate_fingerprint_referrals?.description ||
                        'Blocks referrals from the same browser fingerprint as the referrer'}
                    </p>
                  </div>

                  {/* Manual review required */}
                  <div className='space-y-2'>
                    <label htmlFor='suspicious_referral_review_required' className='text-sm font-medium'>
                      Manual review of suspicious referrals
                    </label>
                    <select
                      id='suspicious_referral_review_required'
                      className='w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      value={settings.suspicious_referral_review_required?.value || 'true'}
                      onChange={(e) => {
                        const newSettings = { ...settings };
                        if (!newSettings.suspicious_referral_review_required) {
                          newSettings.suspicious_referral_review_required = {
                            value: e.target.value,
                            description: 'Require manual admin review for suspicious referrals',
                          };
                        } else {
                          newSettings.suspicious_referral_review_required.value = e.target.value;
                        }
                        setSettings(newSettings);
                        updateSettings({
                          suspicious_referral_review_required: e.target.value,
                        });
                      }}
                    >
                      <option value='true'>Enabled</option>
                      <option value='false'>Disabled</option>
                    </select>
                    <p className='text-xs text-gray-500'>
                      {settings.suspicious_referral_review_required?.description ||
                        'Suspicious referrals require manual admin approval'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className='text-center py-4 text-gray-500'>Loading anti-cheat settings...</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className='space-y-6'>
          {/* Manage rewards */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lafftale-gold'>
                <Award className='h-5 w-5' />
                Manage rewards
              </CardTitle>
              <CardDescription>Configure available referral rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {rewards.map((reward) => (
                  <div key={reward.id} className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='font-medium'>{reward.description}</h4>
                      <Badge variant={reward.is_active ? 'default' : 'secondary'}>
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className='space-y-2 mb-3'>
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>Required points:</span> {reward.points_required}
                      </div>
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>Silk reward:</span> {reward.silk_reward}
                      </div>
                      {reward.item_id && (
                        <div className='text-sm text-gray-600'>
                          <span className='font-medium'>Item ID:</span> {reward.item_id}
                        </div>
                      )}
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='font-bold text-lafftale-gold'>{reward.points_required} points</span>
                      <div className='flex gap-2'>
                        <Button size='sm' variant='outline' onClick={() => handleEditReward(reward)}>
                          <Edit className='h-3 w-3' />
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-red-600'
                          onClick={() => handleDeleteReward(reward.id)}
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Reward Modal - Enhanced design */}
      {showEditModal && editingReward && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-gray-50 dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-700'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100'>Edit Reward</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReward(null);
                }}
                className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              >
                ×
              </Button>
            </div>

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='edit-description'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'
                >
                  Description
                </label>
                <Input
                  id='edit-description'
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  placeholder='e.g. 100 Silk for 100 points'
                  className='bg-white dark:bg-gray-800'
                />
              </div>

              <div>
                <label
                  htmlFor='edit-points'
                  className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'
                >
                  Required points
                </label>
                <Input
                  id='edit-points'
                  type='number'
                  value={editingReward.points_required}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, points_required: parseInt(e.target.value) || 0 })
                  }
                  min='1'
                  className='bg-white dark:bg-gray-800'
                />
              </div>

              <div>
                <label htmlFor='edit-silk' className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                  Silk reward
                </label>
                <Input
                  id='edit-silk'
                  type='number'
                  value={editingReward.silk_reward}
                  onChange={(e) => setEditingReward({ ...editingReward, silk_reward: parseInt(e.target.value) || 0 })}
                  min='0'
                  className='bg-white dark:bg-gray-800'
                />
              </div>

              <div>
                <label htmlFor='edit-item' className='block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300'>
                  Item ID (optional)
                </label>
                <Input
                  id='edit-item'
                  type='number'
                  value={editingReward.item_id || ''}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      item_id: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder='e.g. 12345'
                  className='bg-white dark:bg-gray-800'
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  id='edit-active'
                  type='checkbox'
                  checked={editingReward.is_active}
                  onChange={(e) => setEditingReward({ ...editingReward, is_active: e.target.checked })}
                  className='rounded text-blue-600 focus:ring-blue-500'
                />
                <label htmlFor='edit-active' className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  Reward active
                </label>
              </div>
            </div>

            <div className='flex gap-3 mt-6'>
              <Button
                variant='outline'
                className='flex-1'
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReward(null);
                }}
              >
                Cancel
              </Button>
              <Button className='flex-1 btn-primary' onClick={handleSaveReward}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Anti-Cheat Tab */}
      {activeTab === 'anticheat' && (
        <div className='space-y-6'>
          {/* Anti-Cheat Statistics */}
          {antiCheatStats && (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-400 text-sm font-medium'>Total referrals</p>
                      <p className='text-2xl font-bold text-lafftale-gold'>
                        {antiCheatStats.total_stats.total_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Users className='h-8 w-8 text-lafftale-gold' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-400 text-sm font-medium'>Valid referrals</p>
                      <p className='text-2xl font-bold text-green-500'>
                        {antiCheatStats.total_stats.valid_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Trophy className='h-8 w-8 text-green-500' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-400 text-sm font-medium'>Blocked referrals</p>
                      <p className='text-2xl font-bold text-red-500'>
                        {antiCheatStats.total_stats.blocked_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Eye className='h-8 w-8 text-red-500' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-400 text-sm font-medium'>Block rate</p>
                      <p className='text-2xl font-bold text-yellow-500'>
                        {antiCheatStats.total_stats.block_rate_percent.toFixed(1)}%
                      </p>
                    </div>
                    <BarChart3 className='h-8 w-8 text-yellow-500' />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Suspicious referrals */}
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lafftale-gold'>
                <Eye className='h-5 w-5 text-lafftale-gold' />
                Suspicious Referral Activity
              </CardTitle>
              <CardDescription>Overview of blocked and suspicious referral attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-gray-200'>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Code</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Referrer</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>IP Address</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Reason</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Duplicates</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Date</th>
                      <th className='text-left py-3 px-4 font-medium text-gray-900'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousReferrals.map((referral) => (
                      <tr key={referral.id} className='border-b border-gray-100 hover:bg-gray-50'>
                        <td className='py-3 px-4'>
                          <code className='bg-gray-100 px-2 py-1 rounded text-sm font-mono'>{referral.code}</code>
                        </td>
                        <td className='py-3 px-4'>JID: {referral.referrer_jid}</td>
                        <td className='py-3 px-4'>
                          <code className='text-sm'>{referral.ip_address}</code>
                        </td>
                        <td className='py-3 px-4'>
                          <Badge
                            variant={
                              referral.cheat_reason === 'IP_DUPLICATE'
                                ? 'destructive'
                                : referral.cheat_reason === 'FINGERPRINT_DUPLICATE'
                                ? 'destructive'
                                : referral.cheat_reason === 'RATE_LIMIT_IP'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {referral.cheat_reason === 'IP_DUPLICATE' && 'Duplicate IP'}
                            {referral.cheat_reason === 'FINGERPRINT_DUPLICATE' && 'Duplicate Browser'}
                            {referral.cheat_reason === 'RATE_LIMIT_IP' && 'Rate Limit'}
                            {referral.cheat_reason === 'ANTICHEAT_ERROR' && 'System Error'}
                            {!['IP_DUPLICATE', 'FINGERPRINT_DUPLICATE', 'RATE_LIMIT_IP', 'ANTICHEAT_ERROR'].includes(
                              referral.cheat_reason
                            ) && referral.cheat_reason}
                          </Badge>
                        </td>
                        <td className='py-3 px-4'>
                          <div className='text-sm text-gray-600'>
                            IP: {referral.same_ip_count}x, Browser: {referral.same_fingerprint_count}x
                          </div>
                        </td>
                        <td className='py-3 px-4 text-sm text-gray-600'>
                          {new Date(referral.created_at).toLocaleDateString('en-US', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className='py-3 px-4'>
                          <div className='flex gap-2'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-green-600 border-green-300 hover:bg-green-50'
                              onClick={() => validateSuspiciousReferral(referral.id, true, 'Admin validated')}
                            >
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-red-600 border-red-300 hover:bg-red-50'
                              onClick={() => validateSuspiciousReferral(referral.id, false, 'Admin rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {suspiciousReferrals.length === 0 && (
                  <div className='text-center py-8 text-gray-500'>No suspicious referral activity found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top cheat reasons */}
          {antiCheatStats && antiCheatStats.cheat_reasons.length > 0 && (
            <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
              <CardHeader>
                <CardTitle className='text-lafftale-gold'>Top cheat reasons (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {antiCheatStats.cheat_reasons.map((reason, index) => (
                    <div key={index} className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                      <span className='font-medium text-gray-900'>
                        {reason.cheat_reason === 'IP_DUPLICATE' && 'Duplicate IP Address'}
                        {reason.cheat_reason === 'FINGERPRINT_DUPLICATE' && 'Duplicate Browser Fingerprint'}
                        {reason.cheat_reason === 'RATE_LIMIT_IP' && 'IP Rate Limit Reached'}
                        {reason.cheat_reason === 'ANTICHEAT_ERROR' && 'Anti-Cheat System Error'}
                        {!['IP_DUPLICATE', 'FINGERPRINT_DUPLICATE', 'RATE_LIMIT_IP', 'ANTICHEAT_ERROR'].includes(
                          reason.cheat_reason
                        ) && reason.cheat_reason}
                      </span>
                      <Badge variant='secondary'>{reason.count} Cases</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top suspicious IPs */}
          {antiCheatStats && antiCheatStats.suspicious_ips.length > 0 && (
            <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
              <CardHeader>
                <CardTitle className='text-lafftale-gold'>Suspicious IP Addresses</CardTitle>
                <CardDescription>IPs with multiple blocked referral attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-gray-200'>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>IP Address</th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>Total Referrals</th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>Blocked</th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>Unique Referrers</th>
                        <th className='text-left py-3 px-4 font-medium text-gray-900'>Suspiciousness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {antiCheatStats.suspicious_ips.map((ip, index) => {
                        const suspiciousness = ip.blocked_count / ip.referral_count;
                        return (
                          <tr key={index} className='border-b border-gray-100'>
                            <td className='py-3 px-4'>
                              <code className='text-sm'>{ip.ip_address}</code>
                            </td>
                            <td className='py-3 px-4'>{ip.referral_count}</td>
                            <td className='py-3 px-4 text-red-600 font-medium'>{ip.blocked_count}</td>
                            <td className='py-3 px-4'>{ip.unique_referrers}</td>
                            <td className='py-3 px-4'>
                              <Badge
                                variant={
                                  suspiciousness >= 0.8
                                    ? 'destructive'
                                    : suspiciousness >= 0.5
                                    ? 'secondary'
                                    : 'outline'
                                }
                              >
                                {(suspiciousness * 100).toFixed(0)}% suspicious
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferralManager;
