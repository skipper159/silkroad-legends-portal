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
  title: string;
  description: string;
  points_required: number;
  reward_type: 'silk' | 'item' | 'gold';
  reward_value: string;
  silk_reward: number;
  item_id: number | null;
  active: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface ReferralSettings {
  // Basis Referral Settings
  points_per_referral: { value: string; description: string };
  minimum_redeem_points: { value: string; description: string };
  silk_per_point: { value: string; description: string };
  referral_enabled: { value: string; description: string };

  // Anti-Cheat Settings - 8-Layer System
  anticheat_enabled?: { value: string; description: string };

  // Layer 1: IP Address Lifetime Blocking
  max_referrals_per_ip_lifetime?: { value: string; description: string };
  block_duplicate_ip_completely?: { value: string; description: string };

  // Layer 2: Browser Fingerprint Lifetime Blocking
  max_referrals_per_fingerprint_lifetime?: { value: string; description: string };
  block_duplicate_fingerprint_referrals?: { value: string; description: string };

  // Layer 5: Pattern Detection Settings
  pattern_detection_enabled?: { value: string; description: string };
  max_registrations_per_hour?: { value: string; description: string };
  min_form_fill_time_seconds?: { value: string; description: string };
  rapid_fire_window_minutes?: { value: string; description: string };

  // Layer 6: Honeypot Trap Settings
  honeypot_traps_enabled?: { value: string; description: string };
  honeypot_field_names?: { value: string; description: string };
  honeypot_auto_block?: { value: string; description: string };

  // Layer 7: Behavioral Analysis Settings
  behavioral_analysis_enabled?: { value: string; description: string };
  behavioral_similarity_threshold?: { value: string; description: string };
  mouse_movement_required?: { value: string; description: string };
  behavioral_min_events?: { value: string; description: string };

  // Layer 8: Network Analysis Settings
  network_analysis_enabled?: { value: string; description: string };
  block_vpn_registrations?: { value: string; description: string };
  block_hosting_ips?: { value: string; description: string };
  timezone_mismatch_suspicious?: { value: string; description: string };
  vpn_confidence_threshold?: { value: string; description: string };

  // Delayed Rewards Settings
  delayed_rewards_enabled?: { value: string; description: string };
  min_account_age_days?: { value: string; description: string };
  min_playtime_hours?: { value: string; description: string };
  min_character_level?: { value: string; description: string };
  min_login_days?: { value: string; description: string };
  cronjob_interval_hours?: { value: string; description: string };
  reward_grace_period_days?: { value: string; description: string };
  auto_reject_inactive_days?: { value: string; description: string };
}

const ReferralManager: React.FC = () => {
  // Dark select classes mit lafftale Design-Farben
  const darkSelectClass =
    'w-full p-2 border rounded-md bg-theme-surface text-theme-text-muted border-theme-border focus:border-theme-primary focus:ring-1 focus:ring-theme-primary/50 outline-none [&>option]:bg-theme-surface [&>option]:text-theme-text-muted';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState<Partial<ReferralReward>>({
    title: '',
    description: '',
    points_required: 100,
    reward_type: 'silk',
    reward_value: '',
    silk_reward: 0,
    item_id: null,
    active: true,
    is_active: true,
  });
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
          title: editingReward.title,
          description: editingReward.description,
          points_required: editingReward.points_required,
          reward_type: editingReward.reward_type,
          reward_value: editingReward.reward_value,
          silk_reward: editingReward.silk_reward,
          item_id: editingReward.item_id,
          active: editingReward.active,
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

  const handleAddReward = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/referrals/rewards`, {
        method: 'POST',
        body: JSON.stringify({
          title: newReward.title,
          description: newReward.description,
          points_required: newReward.points_required,
          reward_type: newReward.reward_type,
          reward_value: newReward.reward_value,
          silk_reward: newReward.silk_reward || 0,
          item_id: newReward.item_id,
          active: newReward.active,
          is_active: newReward.is_active,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success!',
          description: 'New reward was created',
        });
        setShowAddModal(false);
        setNewReward({
          title: '',
          description: '',
          points_required: 100,
          reward_type: 'silk',
          reward_value: '',
          silk_reward: 0,
          item_id: null,
          active: true,
          is_active: true,
        });
        fetchRewards();
      } else {
        toast({
          title: 'Error',
          description: 'Reward could not be created',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Reward could not be created',
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
        return 'bg-green-500/20 text-green-500 border border-green-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border border-amber-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-500 border border-red-500/30';
      default:
        return 'bg-theme-surface text-theme-text-muted border border-theme-border';
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
        <UserPlus className='h-8 w-8 text-theme-primary' />
        <div>
          <h2 className='text-2xl font-bold text-theme-primary'>Referral Management</h2>
          <p className='text-theme-text-muted'>Manage referrals and rewards</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className='border-b border-theme-border'>
        <nav className='flex space-x-8'>
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-white hover:border-theme-border'
            }`}
          >
            <div className='flex items-center gap-2'>
              <BarChart3 className='h-4 w-4' />
              Overview
            </div>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-white hover:border-theme-border'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Settings className='h-4 w-4' />
              System Settings
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'rewards'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-white hover:border-theme-border'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4' />
              Manage Rewards
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anticheat')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'anticheat'
                ? 'border-theme-primary text-theme-primary'
                : 'border-transparent text-theme-text-muted hover:text-white hover:border-theme-border'
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
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-theme-primary'>{statistics.total_referrals}</div>
                    <div className='text-sm text-theme-text-muted'>Total referrals</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-yellow-500'>{statistics.pending_referrals}</div>
                    <div className='text-sm text-theme-text-muted'>Pending</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-green-500'>{statistics.completed_referrals}</div>
                    <div className='text-sm text-theme-text-muted'>Completed</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-red-500'>
                      {statistics.total_referrals - statistics.completed_referrals - statistics.pending_referrals}
                    </div>
                    <div className='text-sm text-theme-text-muted'>Error/Other</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-purple-500'>{statistics.total_rewards_paid}</div>
                    <div className='text-sm text-theme-text-muted'>Rewards</div>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='pt-6'>
                  <div className='text-center'>
                    <div className='text-2xl font-bold text-indigo-500'>{statistics.unique_referrers}</div>
                    <div className='text-sm text-theme-text-muted'>Active referrers</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and search */}
          <Card className='bg-theme-surface border-theme-border'>
            <CardContent className='pt-6'>
              <div className='flex gap-4'>
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted h-4 w-4' />
                    <Input
                      placeholder='Search by username or code...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='pl-10 bg-theme-surface border-theme-border text-theme-text'
                    />
                  </div>
                </div>
                <div className='w-48'>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={darkSelectClass}
                  >
                    <option value='all'>All</option>
                    <option value='pending'>Pending</option>
                    <option value='completed'>Completed</option>
                  </select>
                </div>
                <div className='w-32'>
                  <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)} className={darkSelectClass}>
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
          <Card className='bg-theme-surface border-theme-border'>
            <CardHeader>
              <CardTitle className='text-theme-primary'>Referral Overview</CardTitle>
              <CardDescription>
                {filteredReferrals.length} of {referrals.length} referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>
                  <div className='text-theme-text-muted'>Loading referrals...</div>
                </div>
              ) : filteredReferrals.length === 0 ? (
                <div className='text-center py-8'>
                  <Users className='h-12 w-12 text-theme-text-muted mx-auto mb-4' />
                  <p className='text-theme-text-muted'>No referrals found</p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {filteredReferrals.map((referral) => (
                    <div
                      key={referral.id}
                      className='flex items-center justify-between p-4 border border-theme-border rounded-lg bg-theme-surface/50 hover:bg-theme-surface transition-colors'
                    >
                      <div className='flex items-center gap-4'>
                        <div>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>{referral.referrer_username || 'Unknown'}</span>
                            <span className='text-theme-text-muted'>→</span>
                            <span className='font-medium'>{referral.referred_username || 'Unknown'}</span>
                          </div>
                          <div className='flex items-center gap-2 mt-1'>
                            <span className='text-sm text-theme-text-muted font-mono'>{referral.code}</span>
                            <Badge
                              className={
                                referral.redeemed
                                  ? 'bg-green-500/20 text-green-500 border-green-500/30'
                                  : 'bg-amber-500/20 text-amber-500 border-amber-500/30'
                              }
                            >
                              {referral.redeemed ? 'Redeemed' : 'Pending'}
                            </Badge>
                            <span className='text-sm text-theme-text-muted'>
                              {new Date(referral.created_at).toLocaleDateString('en-US')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <div className='text-right mr-4'>
                          <div className='font-bold text-lg'>+{referral.reward_silk}</div>
                          <div className='text-sm text-theme-text-muted'>
                            {referral.redeemed_at ? 'Paid' : 'Pending'}
                          </div>
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
                          className='text-red-500 hover:text-red-600 hover:bg-red-500/10'
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
          <Card className='bg-theme-surface border-theme-border'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-theme-primary'>
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
                    <p className='text-xs text-theme-text-muted'>{settings.points_per_referral.description}</p>
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
                    <p className='text-xs text-theme-text-muted'>{settings.minimum_redeem_points.description}</p>
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
                    <p className='text-xs text-theme-text-muted'>{settings.silk_per_point.description}</p>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='referral_enabled' className='text-sm font-medium'>
                      System enabled
                    </label>
                    <select
                      id='referral_enabled'
                      className={darkSelectClass}
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
                    <p className='text-xs text-theme-text-muted'>{settings.referral_enabled.description}</p>
                  </div>
                </div>
              ) : (
                <div className='text-center py-4 text-theme-text-muted'>Loading settings...</div>
              )}
            </CardContent>
          </Card>

          {/* 8-Layer Anti-Cheat System - Chronologisch organisiert */}
          {settings && (
            <>
              {/* Layer 1: IP Address Lifetime Blocking */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    🛡️ Layer 1: IP Address Lifetime Blocking
                  </CardTitle>
                  <CardDescription>Prevent multiple registrations from the same IP address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Anti-Cheat System Master Toggle */}
                    <div className='space-y-2'>
                      <label htmlFor='anticheat_enabled' className='text-sm font-medium'>
                        Anti-Cheat System
                      </label>
                      <select
                        id='anticheat_enabled'
                        className={darkSelectClass}
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
                      <p className='text-xs text-theme-text-muted'>
                        {settings.anticheat_enabled?.description || 'Master toggle for all anti-cheat features'}
                      </p>
                    </div>

                    {/* IP Lifetime Limit */}
                    <div className='space-y-2'>
                      <label htmlFor='max_referrals_per_ip_lifetime' className='text-sm font-medium'>
                        Max referrals per IP (lifetime)
                      </label>
                      <Input
                        id='max_referrals_per_ip_lifetime'
                        type='number'
                        min='1'
                        max='5'
                        value={settings.max_referrals_per_ip_lifetime?.value || '1'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.max_referrals_per_ip_lifetime) {
                            newSettings.max_referrals_per_ip_lifetime = {
                              value: e.target.value,
                              description: 'Maximum referrals per IP address for lifetime',
                            };
                          } else {
                            newSettings.max_referrals_per_ip_lifetime.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            max_referrals_per_ip_lifetime: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.max_referrals_per_ip_lifetime?.description || 'Lifetime limit per IP address'}
                      </p>
                    </div>

                    {/* Complete IP Blocking */}
                    <div className='space-y-2'>
                      <label htmlFor='block_duplicate_ip_completely' className='text-sm font-medium'>
                        Block duplicate IPs completely
                      </label>
                      <select
                        id='block_duplicate_ip_completely'
                        className={darkSelectClass}
                        value={settings.block_duplicate_ip_completely?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.block_duplicate_ip_completely) {
                            newSettings.block_duplicate_ip_completely = {
                              value: e.target.value,
                              description: 'Completely block any duplicate IP usage',
                            };
                          } else {
                            newSettings.block_duplicate_ip_completely.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            block_duplicate_ip_completely: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-theme-text-muted'>
                        {settings.block_duplicate_ip_completely?.description ||
                          'Prevents any IP from being used more than once'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 2: Browser Fingerprint Lifetime Blocking */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    🔍 Layer 2: Browser Fingerprint Lifetime Blocking
                  </CardTitle>
                  <CardDescription>Prevent multiple registrations from the same browser</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Fingerprint Lifetime Limit */}
                    <div className='space-y-2'>
                      <label htmlFor='max_referrals_per_fingerprint_lifetime' className='text-sm font-medium'>
                        Max referrals per fingerprint (lifetime)
                      </label>
                      <Input
                        id='max_referrals_per_fingerprint_lifetime'
                        type='number'
                        min='1'
                        max='5'
                        value={settings.max_referrals_per_fingerprint_lifetime?.value || '1'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.max_referrals_per_fingerprint_lifetime) {
                            newSettings.max_referrals_per_fingerprint_lifetime = {
                              value: e.target.value,
                              description: 'Maximum referrals per browser fingerprint for lifetime',
                            };
                          } else {
                            newSettings.max_referrals_per_fingerprint_lifetime.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            max_referrals_per_fingerprint_lifetime: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.max_referrals_per_fingerprint_lifetime?.description ||
                          'Lifetime limit per browser fingerprint'}
                      </p>
                    </div>

                    {/* Block Duplicate Fingerprints */}
                    <div className='space-y-2'>
                      <label htmlFor='block_duplicate_fingerprint_referrals' className='text-sm font-medium'>
                        Block duplicate fingerprints
                      </label>
                      <select
                        id='block_duplicate_fingerprint_referrals'
                        className={darkSelectClass}
                        value={settings.block_duplicate_fingerprint_referrals?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.block_duplicate_fingerprint_referrals) {
                            newSettings.block_duplicate_fingerprint_referrals = {
                              value: e.target.value,
                              description: 'Block referrals from duplicate browser fingerprints',
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
                          'Prevents duplicate browser usage'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 5: Pattern Detection */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    ⚡ Layer 5: Pattern Detection
                  </CardTitle>
                  <CardDescription>Bot detection and rapid-fire protection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Pattern Detection Enabled */}
                    <div className='space-y-2'>
                      <label htmlFor='pattern_detection_enabled' className='text-sm font-medium'>
                        Pattern Detection
                      </label>
                      <select
                        id='pattern_detection_enabled'
                        className={darkSelectClass}
                        value={settings.pattern_detection_enabled?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.pattern_detection_enabled) {
                            newSettings.pattern_detection_enabled = {
                              value: e.target.value,
                              description: 'Enable rapid-fire and time-based pattern detection',
                            };
                          } else {
                            newSettings.pattern_detection_enabled.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            pattern_detection_enabled: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.pattern_detection_enabled?.description || 'Detects suspicious registration patterns'}
                      </p>
                    </div>

                    {/* Max Registrations per Hour */}
                    <div className='space-y-2'>
                      <label htmlFor='max_registrations_per_hour' className='text-sm font-medium'>
                        Max registrations per hour
                      </label>
                      <Input
                        id='max_registrations_per_hour'
                        type='number'
                        min='1'
                        max='10'
                        value={settings.max_registrations_per_hour?.value || '3'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.max_registrations_per_hour) {
                            newSettings.max_registrations_per_hour = {
                              value: e.target.value,
                              description: 'Maximum registrations allowed per hour from any source',
                            };
                          } else {
                            newSettings.max_registrations_per_hour.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            max_registrations_per_hour: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.max_registrations_per_hour?.description || 'Hourly registration limit'}
                      </p>
                    </div>

                    {/* Min Form Fill Time */}
                    <div className='space-y-2'>
                      <label htmlFor='min_form_fill_time_seconds' className='text-sm font-medium'>
                        Min form fill time (seconds)
                      </label>
                      <Input
                        id='min_form_fill_time_seconds'
                        type='number'
                        min='1'
                        max='30'
                        value={settings.min_form_fill_time_seconds?.value || '3'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.min_form_fill_time_seconds) {
                            newSettings.min_form_fill_time_seconds = {
                              value: e.target.value,
                              description: 'Minimum time required to fill registration form (bot detection)',
                            };
                          } else {
                            newSettings.min_form_fill_time_seconds.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            min_form_fill_time_seconds: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.min_form_fill_time_seconds?.description || 'Prevents form automation'}
                      </p>
                    </div>

                    {/* Rapid Fire Window */}
                    <div className='space-y-2'>
                      <label htmlFor='rapid_fire_window_minutes' className='text-sm font-medium'>
                        Rapid fire window (minutes)
                      </label>
                      <Input
                        id='rapid_fire_window_minutes'
                        type='number'
                        min='1'
                        max='60'
                        value={settings.rapid_fire_window_minutes?.value || '5'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.rapid_fire_window_minutes) {
                            newSettings.rapid_fire_window_minutes = {
                              value: e.target.value,
                              description: 'Time window for rapid-fire detection',
                            };
                          } else {
                            newSettings.rapid_fire_window_minutes.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            rapid_fire_window_minutes: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.rapid_fire_window_minutes?.description || 'Detection time window'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 6: Honeypot Traps */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    🍯 Layer 6: Honeypot Traps
                  </CardTitle>
                  <CardDescription>Hidden form fields to catch bots</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Honeypot Enabled */}
                    <div className='space-y-2'>
                      <label htmlFor='honeypot_traps_enabled' className='text-sm font-medium'>
                        Honeypot Traps
                      </label>
                      <select
                        id='honeypot_traps_enabled'
                        className={darkSelectClass}
                        value={settings.honeypot_traps_enabled?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.honeypot_traps_enabled) {
                            newSettings.honeypot_traps_enabled = {
                              value: e.target.value,
                              description: 'Enable honeypot form fields for bot detection',
                            };
                          } else {
                            newSettings.honeypot_traps_enabled.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            honeypot_traps_enabled: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.honeypot_traps_enabled?.description || 'Hidden fields to catch automated bots'}
                      </p>
                    </div>

                    {/* Honeypot Field Names */}
                    <div className='space-y-2'>
                      <label htmlFor='honeypot_field_names' className='text-sm font-medium'>
                        Honeypot field names
                      </label>
                      <Input
                        id='honeypot_field_names'
                        type='text'
                        value={settings.honeypot_field_names?.value || 'phone,address,website,company'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.honeypot_field_names) {
                            newSettings.honeypot_field_names = {
                              value: e.target.value,
                              description: 'Comma-separated honeypot field names',
                            };
                          } else {
                            newSettings.honeypot_field_names.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            honeypot_field_names: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.honeypot_field_names?.description || 'Field names used for bot detection'}
                      </p>
                    </div>

                    {/* Auto Block */}
                    <div className='space-y-2'>
                      <label htmlFor='honeypot_auto_block' className='text-sm font-medium'>
                        Auto-block honeypot triggers
                      </label>
                      <select
                        id='honeypot_auto_block'
                        className={darkSelectClass}
                        value={settings.honeypot_auto_block?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.honeypot_auto_block) {
                            newSettings.honeypot_auto_block = {
                              value: e.target.value,
                              description: 'Automatically block if honeypot field is filled',
                            };
                          } else {
                            newSettings.honeypot_auto_block.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            honeypot_auto_block: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.honeypot_auto_block?.description || 'Automatic blocking on honeypot trigger'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 7: Behavioral Analysis */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    🧠 Layer 7: Behavioral Analysis
                  </CardTitle>
                  <CardDescription>Mouse and scroll pattern analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Behavioral Analysis Enabled */}
                    <div className='space-y-2'>
                      <label htmlFor='behavioral_analysis_enabled' className='text-sm font-medium'>
                        Behavioral Analysis
                      </label>
                      <select
                        id='behavioral_analysis_enabled'
                        className={darkSelectClass}
                        value={settings.behavioral_analysis_enabled?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.behavioral_analysis_enabled) {
                            newSettings.behavioral_analysis_enabled = {
                              value: e.target.value,
                              description: 'Enable mouse/scroll behavioral fingerprinting',
                            };
                          } else {
                            newSettings.behavioral_analysis_enabled.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            behavioral_analysis_enabled: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.behavioral_analysis_enabled?.description || 'Analyzes user behavior patterns'}
                      </p>
                    </div>

                    {/* Similarity Threshold */}
                    <div className='space-y-2'>
                      <label htmlFor='behavioral_similarity_threshold' className='text-sm font-medium'>
                        Similarity threshold
                      </label>
                      <Input
                        id='behavioral_similarity_threshold'
                        type='number'
                        min='0.1'
                        max='1.0'
                        step='0.05'
                        value={settings.behavioral_similarity_threshold?.value || '0.85'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.behavioral_similarity_threshold) {
                            newSettings.behavioral_similarity_threshold = {
                              value: e.target.value,
                              description: 'Threshold for behavioral pattern similarity (0.0-1.0)',
                            };
                          } else {
                            newSettings.behavioral_similarity_threshold.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            behavioral_similarity_threshold: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.behavioral_similarity_threshold?.description || 'Pattern matching sensitivity'}
                      </p>
                    </div>

                    {/* Mouse Movement Required */}
                    <div className='space-y-2'>
                      <label htmlFor='mouse_movement_required' className='text-sm font-medium'>
                        Require mouse movement
                      </label>
                      <select
                        id='mouse_movement_required'
                        className={darkSelectClass}
                        value={settings.mouse_movement_required?.value || 'false'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.mouse_movement_required) {
                            newSettings.mouse_movement_required = {
                              value: e.target.value,
                              description: 'Require mouse movement data for registration',
                            };
                          } else {
                            newSettings.mouse_movement_required.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            mouse_movement_required: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Required</option>
                        <option value='false'>Optional</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.mouse_movement_required?.description || 'Force mouse interaction tracking'}
                      </p>
                    </div>

                    {/* Min Events */}
                    <div className='space-y-2'>
                      <label htmlFor='behavioral_min_events' className='text-sm font-medium'>
                        Minimum events required
                      </label>
                      <Input
                        id='behavioral_min_events'
                        type='number'
                        min='1'
                        max='50'
                        value={settings.behavioral_min_events?.value || '5'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.behavioral_min_events) {
                            newSettings.behavioral_min_events = {
                              value: e.target.value,
                              description: 'Minimum mouse/scroll events required',
                            };
                          } else {
                            newSettings.behavioral_min_events.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            behavioral_min_events: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.behavioral_min_events?.description || 'Required interaction events'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Layer 8: Network Analysis */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    🌐 Layer 8: Network Analysis
                  </CardTitle>
                  <CardDescription>VPN, Proxy and hosting detection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Network Analysis Enabled */}
                    <div className='space-y-2'>
                      <label htmlFor='network_analysis_enabled' className='text-sm font-medium'>
                        Network Analysis
                      </label>
                      <select
                        id='network_analysis_enabled'
                        className={darkSelectClass}
                        value={settings.network_analysis_enabled?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.network_analysis_enabled) {
                            newSettings.network_analysis_enabled = {
                              value: e.target.value,
                              description: 'Enable VPN/Proxy/Hosting detection',
                            };
                          } else {
                            newSettings.network_analysis_enabled.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            network_analysis_enabled: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.network_analysis_enabled?.description || 'Detects suspicious network usage'}
                      </p>
                    </div>

                    {/* Block VPN */}
                    <div className='space-y-2'>
                      <label htmlFor='block_vpn_registrations' className='text-sm font-medium'>
                        Block VPN registrations
                      </label>
                      <select
                        id='block_vpn_registrations'
                        className={darkSelectClass}
                        value={settings.block_vpn_registrations?.value || 'false'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.block_vpn_registrations) {
                            newSettings.block_vpn_registrations = {
                              value: e.target.value,
                              description: 'Automatically block known VPN IPs',
                            };
                          } else {
                            newSettings.block_vpn_registrations.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            block_vpn_registrations: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Block</option>
                        <option value='false'>Log only</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.block_vpn_registrations?.description || 'VPN blocking policy'}
                      </p>
                    </div>

                    {/* Block Hosting */}
                    <div className='space-y-2'>
                      <label htmlFor='block_hosting_ips' className='text-sm font-medium'>
                        Block hosting IPs
                      </label>
                      <select
                        id='block_hosting_ips'
                        className={darkSelectClass}
                        value={settings.block_hosting_ips?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.block_hosting_ips) {
                            newSettings.block_hosting_ips = {
                              value: e.target.value,
                              description: 'Block data center/hosting provider IPs',
                            };
                          } else {
                            newSettings.block_hosting_ips.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            block_hosting_ips: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Block</option>
                        <option value='false'>Allow</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.block_hosting_ips?.description || 'Data center blocking policy'}
                      </p>
                    </div>

                    {/* VPN Confidence Threshold */}
                    <div className='space-y-2'>
                      <label htmlFor='vpn_confidence_threshold' className='text-sm font-medium'>
                        VPN confidence threshold
                      </label>
                      <Input
                        id='vpn_confidence_threshold'
                        type='number'
                        min='0.1'
                        max='1.0'
                        step='0.1'
                        value={settings.vpn_confidence_threshold?.value || '0.8'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.vpn_confidence_threshold) {
                            newSettings.vpn_confidence_threshold = {
                              value: e.target.value,
                              description: 'Confidence threshold for VPN detection',
                            };
                          } else {
                            newSettings.vpn_confidence_threshold.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            vpn_confidence_threshold: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.vpn_confidence_threshold?.description || 'VPN detection sensitivity'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delayed Rewards Settings */}
              <Card className='bg-theme-surface border-theme-border'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>⏰ Delayed Reward System</CardTitle>
                  <CardDescription>PENDING → ACTIVE → REJECTED workflow configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Delayed Rewards Enabled */}
                    <div className='space-y-2'>
                      <label htmlFor='delayed_rewards_enabled' className='text-sm font-medium'>
                        Delayed Rewards System
                      </label>
                      <select
                        id='delayed_rewards_enabled'
                        className={darkSelectClass}
                        value={settings.delayed_rewards_enabled?.value || 'true'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.delayed_rewards_enabled) {
                            newSettings.delayed_rewards_enabled = {
                              value: e.target.value,
                              description: 'Enable delayed reward system (PENDING → ACTIVE workflow)',
                            };
                          } else {
                            newSettings.delayed_rewards_enabled.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            delayed_rewards_enabled: e.target.value,
                          });
                        }}
                      >
                        <option value='true'>Enabled</option>
                        <option value='false'>Disabled</option>
                      </select>
                      <p className='text-xs text-gray-500'>
                        {settings.delayed_rewards_enabled?.description ||
                          'Enables the delayed reward validation system'}
                      </p>
                    </div>

                    {/* Min Account Age */}
                    <div className='space-y-2'>
                      <label htmlFor='min_account_age_days' className='text-sm font-medium'>
                        Min account age (days)
                      </label>
                      <Input
                        id='min_account_age_days'
                        type='number'
                        min='1'
                        max='90'
                        value={settings.min_account_age_days?.value || '14'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.min_account_age_days) {
                            newSettings.min_account_age_days = {
                              value: e.target.value,
                              description: 'Minimum account age in days before reward activation',
                            };
                          } else {
                            newSettings.min_account_age_days.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            min_account_age_days: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.min_account_age_days?.description || 'Required account maturity period'}
                      </p>
                    </div>

                    {/* Min Playtime Hours */}
                    <div className='space-y-2'>
                      <label htmlFor='min_playtime_hours' className='text-sm font-medium'>
                        Min playtime (hours)
                      </label>
                      <Input
                        id='min_playtime_hours'
                        type='number'
                        min='1'
                        max='168'
                        value={settings.min_playtime_hours?.value || '24'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.min_playtime_hours) {
                            newSettings.min_playtime_hours = {
                              value: e.target.value,
                              description: 'Minimum total playtime hours required',
                            };
                          } else {
                            newSettings.min_playtime_hours.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            min_playtime_hours: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.min_playtime_hours?.description || 'Required game engagement time'}
                      </p>
                    </div>

                    {/* Min Character Level */}
                    <div className='space-y-2'>
                      <label htmlFor='min_character_level' className='text-sm font-medium'>
                        Min character level
                      </label>
                      <Input
                        id='min_character_level'
                        type='number'
                        min='1'
                        max='120'
                        value={settings.min_character_level?.value || '20'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.min_character_level) {
                            newSettings.min_character_level = {
                              value: e.target.value,
                              description: 'Minimum character level required',
                            };
                          } else {
                            newSettings.min_character_level.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            min_character_level: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.min_character_level?.description || 'Character progression requirement'}
                      </p>
                    </div>

                    {/* Min Login Days */}
                    <div className='space-y-2'>
                      <label htmlFor='min_login_days' className='text-sm font-medium'>
                        Min login days
                      </label>
                      <Input
                        id='min_login_days'
                        type='number'
                        min='1'
                        max='30'
                        value={settings.min_login_days?.value || '7'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.min_login_days) {
                            newSettings.min_login_days = {
                              value: e.target.value,
                              description: 'Minimum distinct login days required',
                            };
                          } else {
                            newSettings.min_login_days.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            min_login_days: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.min_login_days?.description || 'Regular activity requirement'}
                      </p>
                    </div>

                    {/* Cronjob Interval */}
                    <div className='space-y-2'>
                      <label htmlFor='cronjob_interval_hours' className='text-sm font-medium'>
                        Validation interval (hours)
                      </label>
                      <Input
                        id='cronjob_interval_hours'
                        type='number'
                        min='1'
                        max='24'
                        value={settings.cronjob_interval_hours?.value || '6'}
                        onChange={(e) => {
                          const newSettings = { ...settings };
                          if (!newSettings.cronjob_interval_hours) {
                            newSettings.cronjob_interval_hours = {
                              value: e.target.value,
                              description: 'How often to check pending rewards (hours)',
                            };
                          } else {
                            newSettings.cronjob_interval_hours.value = e.target.value;
                          }
                          setSettings(newSettings);
                          updateSettings({
                            cronjob_interval_hours: e.target.value,
                          });
                        }}
                      />
                      <p className='text-xs text-gray-500'>
                        {settings.cronjob_interval_hours?.description || 'Automated validation frequency'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className='space-y-6'>
          {/* Manage rewards */}
          <Card className='bg-theme-surface border-theme-border'>
            <CardHeader>
              <div className='flex justify-between items-center'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-theme-primary'>
                    <Award className='h-5 w-5' />
                    Manage rewards
                  </CardTitle>
                  <CardDescription>Configure available referral rewards</CardDescription>
                </div>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                >
                  <UserPlus className='h-4 w-4 mr-2' />
                  Add Reward
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {rewards.map((reward) => (
                  <div key={reward.id} className='p-4 border rounded-lg'>
                    <div className='flex justify-between items-start mb-2'>
                      <h4 className='font-medium'>{reward.title || reward.description}</h4>
                      <Badge variant={reward.active || reward.is_active ? 'default' : 'secondary'}>
                        {reward.active || reward.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className='space-y-2 mb-3'>
                      {reward.description && (
                        <div className='text-sm text-theme-text-muted'>
                          <span className='font-medium'>Description:</span> {reward.description}
                        </div>
                      )}
                      <div className='text-sm text-theme-text-muted'>
                        <span className='font-medium'>Required points:</span> {reward.points_required}
                      </div>
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>Type:</span> {reward.reward_type || 'silk'}
                      </div>
                      <div className='text-sm text-gray-600'>
                        <span className='font-medium'>Reward:</span>{' '}
                        {reward.reward_value || `${reward.silk_reward} Silk`}
                      </div>
                      {reward.item_id && (
                        <div className='text-sm text-gray-600'>
                          <span className='font-medium'>Item ID:</span> {reward.item_id}
                        </div>
                      )}
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='font-bold text-theme-primary'>{reward.points_required} points</span>
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

      {showEditModal && editingReward && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-theme-surface rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-theme-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-theme-text'>Edit Reward</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReward(null);
                }}
                className='text-theme-text-muted hover:text-theme-text'
              >
                ×
              </Button>
            </div>

            <div className='space-y-4'>
              <div>
                <label htmlFor='edit-description' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Description
                </label>
                <Input
                  id='edit-description'
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  placeholder='e.g. 100 Silk for 100 points'
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='edit-points' className='block text-sm font-medium mb-1 text-theme-text-muted'>
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
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='edit-silk' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Silk reward
                </label>
                <Input
                  id='edit-silk'
                  type='number'
                  value={editingReward.silk_reward}
                  onChange={(e) => setEditingReward({ ...editingReward, silk_reward: parseInt(e.target.value) || 0 })}
                  min='0'
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='edit-item' className='block text-sm font-medium mb-1 text-theme-text-muted'>
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
                  className='bg-theme-surface border-theme-border text-theme-text'
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
              <Card className='bg-theme-surface border-theme-border'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-theme-text-muted text-sm font-medium'>Total referrals</p>
                      <p className='text-2xl font-bold text-theme-primary'>
                        {antiCheatStats.total_stats.total_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Users className='h-8 w-8 text-theme-primary' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-theme-surface/50 border-theme-primary/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-theme-text-muted text-sm font-medium'>Valid referrals</p>
                      <p className='text-2xl font-bold text-green-500'>
                        {antiCheatStats.total_stats.valid_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Trophy className='h-8 w-8 text-green-500' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-theme-surface/50 border-theme-primary/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-theme-text-muted text-sm font-medium'>Blocked referrals</p>
                      <p className='text-2xl font-bold text-red-500'>
                        {antiCheatStats.total_stats.blocked_referrals.toLocaleString()}
                      </p>
                    </div>
                    <Eye className='h-8 w-8 text-red-500' />
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-theme-surface/50 border-theme-primary/20'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-theme-text-muted text-sm font-medium'>Block rate</p>
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
          <Card className='bg-theme-surface border-theme-border'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-theme-primary'>
                <Eye className='h-5 w-5 text-theme-primary' />
                Suspicious Referral Activity
              </CardTitle>
              <CardDescription>Overview of blocked and suspicious referral attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='border-b border-theme-border'>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Code</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Referrer</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>IP Address</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Reason</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Duplicates</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Date</th>
                      <th className='text-left py-3 px-4 font-medium text-theme-primary'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suspiciousReferrals.map((referral) => (
                      <tr key={referral.id} className='border-b border-theme-border hover:bg-theme-surface/50'>
                        <td className='py-3 px-4'>
                          <code className='bg-theme-surface/50 px-2 py-1 rounded text-sm font-mono'>
                            {referral.code}
                          </code>
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
                          <div className='text-sm text-theme-text-muted'>
                            IP: {referral.same_ip_count}x, Browser: {referral.same_fingerprint_count}x
                          </div>
                        </td>
                        <td className='py-3 px-4 text-sm text-theme-text-muted'>
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
                              className='text-green-500 border-green-500/30 hover:bg-green-500/10'
                              onClick={() => validateSuspiciousReferral(referral.id, true, 'Admin validated')}
                            >
                              Approve
                            </Button>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-red-500 border-red-500/30 hover:bg-red-500/10'
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
                  <div className='text-center py-8 text-theme-text-muted'>No suspicious referral activity found</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top cheat reasons */}
          {antiCheatStats && antiCheatStats.cheat_reasons.length > 0 && (
            <Card className='bg-theme-surface border-theme-border'>
              <CardHeader>
                <CardTitle className='text-theme-primary'>Top cheat reasons (last 30 days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {antiCheatStats.cheat_reasons.map((reason, index) => (
                    <div key={index} className='flex items-center justify-between p-3 bg-theme-surface/50 rounded'>
                      <span className='font-medium text-theme-text'>
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
            <Card className='bg-theme-surface border-theme-border'>
              <CardHeader>
                <CardTitle className='text-theme-primary'>Suspicious IP Addresses</CardTitle>
                <CardDescription>IPs with multiple blocked referral attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b border-theme-border'>
                        <th className='text-left py-3 px-4 font-medium text-theme-primary'>IP Address</th>
                        <th className='text-left py-3 px-4 font-medium text-theme-primary'>Total Referrals</th>
                        <th className='text-left py-3 px-4 font-medium text-theme-primary'>Blocked</th>
                        <th className='text-left py-3 px-4 font-medium text-theme-primary'>Unique Referrers</th>
                        <th className='text-left py-3 px-4 font-medium text-theme-primary'>Suspiciousness</th>
                      </tr>
                    </thead>
                    <tbody>
                      {antiCheatStats.suspicious_ips.map((ip, index) => {
                        const suspiciousness = ip.blocked_count / ip.referral_count;
                        return (
                          <tr key={index} className='border-b border-theme-border'>
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

      {/* Add Reward Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-theme-surface rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-theme-border'>
            <div className='flex justify-between items-center mb-4'>
              <h3 className='text-lg font-semibold text-theme-text'>Add New Reward</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setShowAddModal(false);
                  setNewReward({
                    title: '',
                    description: '',
                    points_required: 100,
                    reward_type: 'silk',
                    reward_value: '',
                    silk_reward: 0,
                    item_id: null,
                    active: true,
                    is_active: true,
                  });
                }}
                className='text-theme-text-muted hover:text-theme-text'
              >
                ×
              </Button>
            </div>

            <div className='space-y-4'>
              <div>
                <label htmlFor='add-title' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Title
                </label>
                <Input
                  id='add-title'
                  value={newReward.title || ''}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder='e.g. 100 Silk Reward'
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='add-description' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Description
                </label>
                <Input
                  id='add-description'
                  value={newReward.description || ''}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder='e.g. Receive 100 Silk for completing referral'
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='add-points' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Required Points
                </label>
                <Input
                  id='add-points'
                  type='number'
                  value={newReward.points_required || 0}
                  onChange={(e) => setNewReward({ ...newReward, points_required: parseInt(e.target.value) || 0 })}
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              <div>
                <label htmlFor='add-reward-type' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Reward Type
                </label>
                <select
                  id='add-reward-type'
                  value={newReward.reward_type || 'silk'}
                  onChange={(e) =>
                    setNewReward({ ...newReward, reward_type: e.target.value as 'silk' | 'item' | 'gold' })
                  }
                  className={darkSelectClass}
                >
                  <option value='silk'>Silk</option>
                  <option value='item'>Item</option>
                  <option value='gold'>Gold</option>
                </select>
              </div>

              <div>
                <label htmlFor='add-reward-value' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                  Reward Value
                </label>
                <Input
                  id='add-reward-value'
                  value={newReward.reward_value || ''}
                  onChange={(e) => setNewReward({ ...newReward, reward_value: e.target.value })}
                  placeholder='e.g. 100 for silk, Item Name for items'
                  className='bg-theme-surface border-theme-border text-theme-text'
                />
              </div>

              {newReward.reward_type === 'silk' && (
                <div>
                  <label htmlFor='add-silk-amount' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                    Silk Amount (Legacy)
                  </label>
                  <Input
                    id='add-silk-amount'
                    type='number'
                    value={newReward.silk_reward || 0}
                    onChange={(e) => setNewReward({ ...newReward, silk_reward: parseInt(e.target.value) || 0 })}
                    className='bg-theme-surface border-theme-border text-theme-text'
                  />
                </div>
              )}

              {newReward.reward_type === 'item' && (
                <div>
                  <label htmlFor='add-item-id' className='block text-sm font-medium mb-1 text-theme-text-muted'>
                    Item ID (Optional)
                  </label>
                  <Input
                    id='add-item-id'
                    type='number'
                    value={newReward.item_id || ''}
                    onChange={(e) => setNewReward({ ...newReward, item_id: parseInt(e.target.value) || null })}
                    placeholder='Game item ID'
                    className='bg-theme-surface border-theme-border text-theme-text'
                  />
                </div>
              )}

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='add-active'
                  checked={newReward.active}
                  onChange={(e) =>
                    setNewReward({ ...newReward, active: e.target.checked, is_active: e.target.checked })
                  }
                  className='rounded'
                />
                <label htmlFor='add-active' className='text-sm text-theme-text-muted'>
                  Active
                </label>
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-6'>
              <Button
                variant='ghost'
                onClick={() => {
                  setShowAddModal(false);
                  setNewReward({
                    title: '',
                    description: '',
                    points_required: 100,
                    reward_type: 'silk',
                    reward_value: '',
                    silk_reward: 0,
                    item_id: null,
                    active: true,
                    is_active: true,
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddReward}
                className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
              >
                Add Reward
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralManager;
