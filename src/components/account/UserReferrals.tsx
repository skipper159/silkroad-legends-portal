import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { useToast } from '@/hooks/use-toast';
import { Users, Gift, Star, Trophy, Copy, Share2, UserPlus, Award } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Referral {
  id: number;
  code: string;
  name: string;
  jid: number;
  invited_jid: number | null;
  points: number;
  reward_silk: number;
  redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
  referred_username?: string;
}

interface ReferralStats {
  total_referrals: number;
  approved_referrals: number;
  pending_referrals: number;
  rejected_referrals: number;
  total_points_earned: number;
  available_points: number;
}

interface ReferralReward {
  id: number;
  title: string;
  description: string;
  points_required: number;
  reward_type: 'silk' | 'item' | 'gold';
  reward_value: string;
  active: boolean;
}

const UserReferrals: React.FC = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchReferralData();
      fetchRewards();
    }
  }, [isAuthenticated]);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      console.log('Fetching referral data...');

      const [referralsRes, statsRes] = await Promise.all([
        fetchWithAuth(`${weburl}/api/referrals/my-referrals`),
        fetchWithAuth(`${weburl}/api/referrals/my-stats`),
      ]);

      console.log('Referrals API response status:', referralsRes.status);
      console.log('Stats API response status:', statsRes?.status || 'N/A');

      if (referralsRes.ok) {
        const referralsData = await referralsRes.json();
        console.log('Referrals API response data:', referralsData);

        if (referralsData.success) {
          console.log('Setting referrals:', referralsData.data.referrals);
          console.log('Setting referral code:', referralsData.data.referral_code);

          setReferrals(referralsData.data.referrals || []);
          setReferralCode(referralsData.data.referral_code || '');
        } else {
          console.log('Referrals API returned success: false');
        }
      } else {
        console.log('Referrals API request failed with status:', referralsRes.status);
        const errorText = await referralsRes.text();
        console.log('Error response:', errorText);
      }

      if (statsRes && statsRes.ok) {
        const statsData = await statsRes.json();
        console.log('Stats API response data:', statsData);

        if (statsData.success) {
          console.log('Setting stats:', statsData.data.stats);
          setStats(statsData.data.stats || null);
        } else {
          console.log('Stats API returned success: false');
        }
      } else {
        console.log('Stats API request failed with status:', statsRes?.status);
        if (statsRes) {
          const errorText = await statsRes.text();
          console.log('Stats error response:', errorText);
        }
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/referrals/rewards`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRewards(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleRedeemPoints = async () => {
    console.log('Redeem button clicked');
    console.log('Current stats:', stats);
    console.log('Available points:', stats?.available_points);

    if (!stats || stats.available_points < 100) {
      console.log('Not enough points for redemption');
      toast({
        title: 'Fehler',
        description: 'Du benötigst mindestens 100 Punkte zum Einlösen',
        variant: 'destructive',
      });
      return;
    }

    setRedeemLoading(true);
    try {
      console.log('Sending redeem request with points:', stats.available_points);

      const response = await fetchWithAuth(`${weburl}/api/referrals/redeem`, {
        method: 'POST',
        body: JSON.stringify({
          points: stats.available_points,
        }),
      });

      console.log('Redeem API response status:', response.status);
      const data = await response.json();
      console.log('Redeem API response data:', data);

      if (data.success) {
        toast({
          title: 'Erfolgreich!',
          description: data.message || `${stats.available_points} Punkte wurden erfolgreich eingelöst!`,
        });
        fetchReferralData(); // Daten neu laden
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Punkte konnten nicht eingelöst werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Redeem error:', error);
      toast({
        title: 'Fehler',
        description: 'Punkte konnten nicht eingelöst werden. Bitte versuche es erneut.',
        variant: 'destructive',
      });
    } finally {
      setRedeemLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: 'Kopiert!',
        description: 'Referral-Code wurde in die Zwischenablage kopiert',
      });
    }
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Link kopiert!',
      description: 'Referral-Link wurde in die Zwischenablage kopiert',
    });
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'silk':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'item':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className='text-center py-8'>
        <div className='text-gray-400'>Lade Referral-Daten...</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <UserPlus className='h-8 w-8 text-lafftale-gold' />
        <div>
          <h2 className='text-2xl font-bold text-gray-100'>Referral System</h2>
          <p className='text-gray-400'>Lade Freunde ein und erhalte Belohnungen</p>
        </div>
      </div>

      {/* Referral Code */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold'>Dein Referral-Code</CardTitle>
          <CardDescription className='text-gray-400'>
            Teile diesen Code mit deinen Freunden bei der Registrierung
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='flex-1 p-3 bg-lafftale-dark rounded-lg border border-lafftale-gold/30'>
                <span className='font-mono text-lafftale-gold text-lg'>{referralCode || 'Wird generiert...'}</span>
              </div>
              <Button
                onClick={copyReferralCode}
                size='sm'
                variant='outline'
                className='border-lafftale-gold/30 text-lafftale-gold hover:bg-lafftale-gold hover:text-lafftale-dark'
                disabled={!referralCode}
              >
                <Copy className='h-4 w-4' />
              </Button>
            </div>
            <Button
              onClick={shareReferralLink}
              className='w-full bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
              disabled={!referralCode}
            >
              <Share2 className='h-4 w-4 mr-2' />
              Referral-Link teilen
            </Button>
            <p className='text-xs text-gray-500 text-center'>
              Freunde müssen diesen Code bei der Registrierung eingeben
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistiken und Punkte einlösen */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold'>Statistiken</CardTitle>
            <CardDescription className='text-gray-400'>Deine Referral-Übersicht</CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Gesamt Referrals:</span>
                  <span className='text-lafftale-gold font-bold'>{stats.total_referrals}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Bestätigt:</span>
                  <span className='text-green-400 font-bold'>{stats.approved_referrals}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-400'>Wartend:</span>
                  <span className='text-yellow-400 font-bold'>{stats.pending_referrals}</span>
                </div>
                <div className='flex justify-between border-t border-lafftale-gold/30 pt-3'>
                  <span className='text-gray-400'>Verfügbare Punkte:</span>
                  <span className='text-lafftale-gold font-bold text-lg'>{stats.available_points}</span>
                </div>
              </div>
            ) : (
              <div className='text-center text-gray-400'>Keine Statistiken verfügbar</div>
            )}
          </CardContent>
        </Card>

        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold'>Punkte einlösen</CardTitle>
            <CardDescription className='text-gray-400'>Tausche Punkte gegen Silk ein</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-lafftale-gold'>{stats?.available_points || 0}</div>
                <div className='text-sm text-gray-400'>Verfügbare Punkte</div>
              </div>
              <Button
                onClick={handleRedeemPoints}
                className='w-full bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
                disabled={!stats || stats.available_points < 100 || redeemLoading}
              >
                {redeemLoading ? (
                  'Wird eingelöst...'
                ) : (
                  <>
                    <Gift className='h-4 w-4 mr-2' />
                    Alle Punkte einlösen
                  </>
                )}
              </Button>
              {stats && stats.available_points < 100 && (
                <p className='text-xs text-gray-500 text-center'>Mindestens 100 Punkte erforderlich</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Liste */}
      <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-lafftale-gold'>Deine Referrals</CardTitle>
          <CardDescription className='text-gray-400'>Übersicht über deine geworbenen Spieler</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className='text-center py-8'>
              <Users className='h-12 w-12 text-gray-500 mx-auto mb-4' />
              <p className='text-gray-400'>Du hast noch keine Referrals</p>
              <p className='text-gray-500 text-sm'>Teile deinen Referral-Code mit Freunden</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className='flex items-center justify-between p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'
                >
                  <div className='flex items-center gap-3'>
                    <Users className='h-5 w-5 text-lafftale-gold' />
                    <div>
                      <div className='font-medium text-gray-100'>
                        {referral.referred_username || `Spieler ${referral.invited_jid || 'Unbekannt'}`}
                      </div>
                      <div className='text-sm text-gray-400'>
                        {new Date(referral.created_at).toLocaleDateString('de-DE')}
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      className={
                        referral.invited_jid
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }
                    >
                      {referral.invited_jid ? 'Verwendet' : 'Wartend'}
                    </Badge>
                    <div className='text-right'>
                      <div className='text-sm font-bold text-lafftale-gold'>+{referral.points}</div>
                      <div className='text-xs text-gray-400'>Punkte</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verfügbare Belohnungen */}
      {rewards.length > 0 && (
        <Card className='bg-lafftale-darkgray border-lafftale-gold/30'>
          <CardHeader>
            <CardTitle className='text-lafftale-gold flex items-center gap-2'>
              <Award className='h-5 w-5' />
              Verfügbare Belohnungen
            </CardTitle>
            <CardDescription className='text-gray-400'>
              Tausche deine Referral-Punkte gegen Belohnungen ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {rewards.map((reward) => (
                <div key={reward.id} className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-gray-100'>{reward.title}</h4>
                    <Badge className={getRewardTypeColor(reward.reward_type)}>{reward.reward_type}</Badge>
                  </div>
                  <p className='text-sm text-gray-400 mb-3'>{reward.description}</p>
                  <div className='flex justify-between items-center'>
                    <span className='text-lafftale-gold font-bold'>{reward.points_required} Punkte</span>
                    <Button
                      size='sm'
                      disabled={!stats || stats.available_points < reward.points_required}
                      className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-gold/90'
                    >
                      Einlösen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserReferrals;
