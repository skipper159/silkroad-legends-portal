import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Vote, ExternalLink, Clock, Gift, History, Star } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { jwtDecode } from 'jwt-decode';
import { SimpleGameAccountSelector } from '@/components/common/SimpleGameAccountSelector';

interface VoteSite {
  id: number;
  name: string;
  url: string;
  logo_url?: string;
  reward_silk: number;
  cooldown_hours: number;
  is_active: boolean;
}

interface UserVoteStatus {
  site_id: number;
  site_name: string;
  can_vote: boolean;
  next_vote_at?: string;
  total_votes: number;
}

interface VoteHistory {
  id: number;
  site_name: string;
  reward_silk: number;
  ip_address: string;
  voted_at: string;
}

const UserVoting = () => {
  const [voteSites, setVoteSites] = useState<VoteSite[]>([]);
  const [voteStatus, setVoteStatus] = useState<UserVoteStatus[]>([]);
  const [voteHistory, setVoteHistory] = useState<VoteHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedAccountJid, setSelectedAccountJid] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<any>(null);
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log('Decoded token:', decoded);
        console.log('Extracted userId (id):', decoded.id);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('Loading vote sites...');
      setLoading(true);
      fetchVoteSites().finally(() => {
        // Only set loading to false if we don't need to wait for account selection
        if (!selectedAccountJid) {
          setLoading(false);
        }
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedAccountJid) {
      console.log('Loading vote status for account:', selectedAccountJid);
      setLoading(true);
      fetchVoteStatus().finally(() => setLoading(false));
    } else if (isAuthenticated) {
      // If no account selected but authenticated, we're not loading
      setLoading(false);
    }
  }, [selectedAccountJid, isAuthenticated]);

  const fetchVoteSites = async () => {
    try {
      console.log('Fetching vote sites...');
      const response = await fetchWithAuth(`${weburl}/api/vote/sites`);
      console.log('Vote sites response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const sites = await response.json();
      console.log('Vote sites data:', sites);
      console.log('Number of sites:', sites.length);
      setVoteSites(sites);
    } catch (error) {
      console.error('Error fetching vote sites:', error);
      toast({
        title: 'Error',
        description: `Vote sites could not be loaded: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const fetchVoteStatus = async () => {
    if (!selectedAccountJid) {
      console.log('No selectedAccountJid available for vote status');
      return;
    }

    try {
      console.log('Fetching vote status for account JID:', selectedAccountJid);
      const response = await fetchWithAuth(`${weburl}/api/vote/status/${selectedAccountJid}`);
      console.log('Vote status response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Vote status data:', data);
      setVoteStatus(data.sites || []);
    } catch (error) {
      console.error('Error fetching vote status:', error);
      toast({
        title: 'Error',
        description: `Vote status could not be loaded: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const fetchVoteHistory = async () => {
    if (!selectedAccountJid) return;

    try {
      setHistoryLoading(true);
      const response = await fetchWithAuth(`${weburl}/api/vote/history/${selectedAccountJid}?limit=50`);
      const history = await response.json();
      setVoteHistory(history);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching vote history:', error);
      toast({
        title: 'Error',
        description: 'Vote history could not be loaded',
        variant: 'destructive',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleVote = (site: VoteSite) => {
    // Open voting site in new tab
    window.open(site.url, '_blank', 'noopener,noreferrer');

    toast({
      title: 'Voting site opened',
      description: `You have been redirected to ${site.name}. After voting you will receive ${site.reward_silk} Silk.`,
    });

    // Refresh status after a short delay
    setTimeout(() => {
      fetchVoteStatus();
    }, 2000);
  };

  const getTimeUntilNextVote = (nextVoteAt?: string) => {
    if (!nextVoteAt) return null;

    const nextVote = new Date(nextVoteAt);
    const now = new Date();
    const diff = nextVote.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const getTotalRewardsEarned = () => {
    return voteHistory.reduce((total, vote) => total + vote.reward_silk, 0);
  };

  const getTotalVotes = () => {
    return voteStatus.reduce((total, status) => total + status.total_votes, 0);
  };

  const getAvailableVotes = () => {
    return voteStatus.filter((status) => status.can_vote).length;
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <Vote className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>Loading vote sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Game Account Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Vote className='h-5 w-5' />
            Vote for Lafftale
          </CardTitle>
          <CardDescription>Vote for our server and receive rewards on your selected game account</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleGameAccountSelector
            selectedAccountJid={selectedAccountJid}
            onAccountChange={(jid, account) => {
              setSelectedAccountJid(jid);
              setSelectedAccount(account);
            }}
            label='Target Game Account'
            placeholder='Select account to receive vote rewards...'
          />
        </CardContent>
      </Card>

      {!selectedAccountJid ? (
        <Card>
          <CardContent className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <Vote className='h-12 w-12 text-theme-text-muted mx-auto mb-4' />
              <p className='text-theme-text-muted'>Please select a game account to continue voting</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Overview */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Star className='h-5 w-5 text-theme-highlight' />
                  <div>
                    <p className='text-sm font-medium'>Available Votes</p>
                    <p className='text-2xl font-bold'>{getAvailableVotes()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Vote className='h-5 w-5 text-blue-500' />
                  <div>
                    <p className='text-sm font-medium'>Total Votes</p>
                    <p className='text-2xl font-bold'>{getTotalVotes()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <Gift className='h-5 w-5 text-green-500' />
                  <div>
                    <p className='text-sm font-medium'>Earned Silk</p>
                    <p className='text-2xl font-bold'>{getTotalRewardsEarned()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center space-x-2'>
                  <History className='h-5 w-5 text-purple-500' />
                  <div>
                    <p className='text-sm font-medium'>History</p>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={fetchVoteHistory}
                      disabled={historyLoading}
                      className='mt-1'
                    >
                      Show
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vote Sites */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Vote className='h-5 w-5' />
                Vote for us
              </CardTitle>
              <CardDescription>Vote for our server on various toplists and receive rewards!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {voteSites.map((site) => {
                  const status = voteStatus.find((s) => s.site_id === site.id);
                  const canVote = status?.can_vote ?? true;
                  const timeUntilNext = getTimeUntilNextVote(status?.next_vote_at);

                  return (
                    <Card
                      key={site.id}
                      className={`transition-all hover:shadow-md ${
                        canVote ? 'border-theme-secondary' : 'border-theme-border'
                      }`}
                    >
                      <CardContent className='p-4'>
                        <div className='flex items-start justify-between mb-3'>
                          <div className='flex items-center space-x-3'>
                            {site.logo_url && (
                              <img
                                src={site.logo_url}
                                alt={site.name}
                                className='w-10 h-10 rounded object-cover'
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3 className='font-semibold text-sm'>{site.name}</h3>
                              <p className='text-xs text-muted-foreground'>{site.reward_silk} Silk Reward</p>
                            </div>
                          </div>
                          {canVote ? (
                            <Badge
                              variant='default'
                              className='bg-theme-secondary/20 text-theme-secondary hover:bg-theme-secondary/30'
                            >
                              Available
                            </Badge>
                          ) : (
                            <Badge variant='secondary'>Cooldown</Badge>
                          )}
                        </div>

                        {!canVote && timeUntilNext && (
                          <div className='mb-3'>
                            <div className='flex items-center justify-between text-xs text-muted-foreground mb-1'>
                              <span>Next vote in:</span>
                              <span>{timeUntilNext}</span>
                            </div>
                            <Progress
                              value={Math.max(
                                0,
                                100 -
                                  ((new Date(status?.next_vote_at!).getTime() - Date.now()) /
                                    (site.cooldown_hours * 3600000)) *
                                    100
                              )}
                              className='h-1'
                            />
                          </div>
                        )}

                        <div className='flex items-center justify-between'>
                          <div className='text-xs text-muted-foreground'>
                            <Clock className='h-3 w-3 inline mr-1' />
                            {site.cooldown_hours}h Cooldown
                          </div>
                          <Button size='sm' onClick={() => handleVote(site)} disabled={!canVote} className='text-xs'>
                            <ExternalLink className='h-3 w-3 mr-1' />
                            Vote
                          </Button>
                        </div>

                        {status && status.total_votes > 0 && (
                          <div className='mt-2 pt-2 border-t text-xs text-muted-foreground'>
                            Already voted {status.total_votes}x
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vote History Dialog */}
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogContent className='max-w-4xl max-h-[80vh] overflow-y-auto'>
              <DialogHeader>
                <DialogTitle>Vote History</DialogTitle>
                <DialogDescription>Your last 50 votes with rewards</DialogDescription>
              </DialogHeader>

              {historyLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <History className='h-6 w-6 animate-spin mr-2' />
                  Loading history...
                </div>
              ) : (
                <div className='space-y-2'>
                  {voteHistory.length === 0 ? (
                    <p className='text-center text-muted-foreground py-8'>No votes yet</p>
                  ) : (
                    voteHistory.map((vote) => (
                      <div key={vote.id} className='flex items-center justify-between p-3 bg-muted rounded-lg'>
                        <div>
                          <p className='font-medium'>{vote.site_name}</p>
                          <p className='text-sm text-muted-foreground'>
                            {new Date(vote.voted_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <Badge variant='outline' className='text-green-600'>
                          +{vote.reward_silk} Silk
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

export default UserVoting;
