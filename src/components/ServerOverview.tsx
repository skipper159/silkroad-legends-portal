import { Crown, Users, Castle, Trophy, Skull, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getPublicUrl } from '@/utils/assetUtils';
import { fetchWithAuth, weburl } from '@/lib/api';
import { getMonsterName, formatKillDate } from '@/utils/monsterNames';

interface UniqueKill {
  mobId: number;
  charId: number;
  characterName: string;
  eventDate: string;
  monsterCodeName: string;
  monsterName: string;
}

const ServerOverview = () => {
  const [topPlayer, setTopPlayer] = useState<any | null>(null);
  const [topGuild, setTopGuild] = useState<any | null>(null);
  const [playersOnline, setPlayersOnline] = useState<number | null>(null); // TODO: backend endpoint
  const [fortressOwner, setFortressOwner] = useState<any | null>(null); // TODO: backend endpoint
  const [recentKills, setRecentKills] = useState<UniqueKill[]>([]);
  const [loading, setLoading] = useState(true);
  const [killsLoading, setKillsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Get top player
        const playersResp = await apiClient.getTopPlayerRanking();
        if (mounted && playersResp && playersResp.data && playersResp.data.length > 0) {
          const p = playersResp.data[0];
          setTopPlayer({
            name: p.CharName || p.name || p.charName || '-',
            guild: p.GuildName || p.guildName || p.guild || '-',
            itemPoints: p.ItemPoints || p.itemPoints || p.itemPointsFormatted || 0,
          });
        }

        // Get top guild
        const guildsResp = await apiClient.getTopGuildRanking();
        if (mounted && guildsResp && guildsResp.data && guildsResp.data.length > 0) {
          const g = guildsResp.data[0];
          setTopGuild({
            name: g.Name || g.name || '-',
            activityPoints: g.activityPoints || g.ActivityPoints || '-',
            emblem: g.emblem || 'G',
          });
        }

        // Fortress Owner
        const fortressResp = await apiClient.getFortressOwner();
        if (mounted && fortressResp && fortressResp.data) {
          setFortressOwner({
            guild: fortressResp.data.guild?.name || '-',
            fortress: fortressResp.data.fortress || '-',
            timeHeld: fortressResp.data.heldSince || '-',
          });
        }

        // Players Online
        const onlineResp = await apiClient.getPlayersOnline();
        if (mounted && onlineResp && onlineResp.data) {
          setPlayersOnline(onlineResp.data.count ?? null);
        }
      } catch (err) {
        // swallow for now - optionally show toast
        // console.error('Failed to load ranking overview', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadRecentKills = async () => {
      setKillsLoading(true);
      try {
        const response = await fetch(`${weburl}/api/unique-kills/recent`);
        if (response.ok) {
          const data = await response.json();
          if (mounted && data.success) {
            setRecentKills(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load recent unique kills', err);
      } finally {
        if (mounted) setKillsLoading(false);
      }
    };

    load();
    loadRecentKills();

    // Auto-refresh recent kills every 30 seconds
    const interval = setInterval(loadRecentKills, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className='py-16 bg-black/20'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-center mb-12'>
          <h2 className='decorated-heading text-3xl md:text-4xl'>Server Overview</h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Top Player Card */}
          <div
            className='card border-theme-primary/30 hover:border-theme-primary/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl(
                'image/Web/top-player-bg.jpg'
              )}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-theme-primary to-amber-600 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-theme-primary/50 transition-all duration-300'>
                <Trophy size={24} className='text-theme-primary-foreground' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <h4 className='text-theme-primary text-lg font-semibold drop-shadow-lg'>Top Player</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>
                  {topPlayer?.name ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className='text-sm text-theme-text-muted/90 drop-shadow-md'>
                  <span>{topPlayer?.guild ?? '—'}</span>
                </div>
                <div className='text-xs text-theme-primary mt-1 drop-shadow-md'>
                  {topPlayer?.itemPoints ? `${topPlayer.itemPoints.toLocaleString()} Item Points` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Top Guild Card */}
          <div
            className='card border-theme-primary/30 hover:border-theme-primary/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl(
                'image/Web/top-guild-bg.jpg'
              )}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-theme-primary to-amber-600 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-theme-primary/50 transition-all duration-300'>
                <Crown size={24} className='text-theme-primary-foreground' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <h4 className='text-theme-primary text-lg font-semibold drop-shadow-lg'>Top Guild</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>
                  {topGuild?.name ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className='text-sm text-theme-text-muted/90 drop-shadow-md'>
                  {topGuild?.activityPoints ? `${topGuild.activityPoints} Activity Points` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Fortress Owner Card */}
          <div
            className='card border-theme-primary/30 hover:border-theme-primary/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl(
                'image/Web/fortress-owner-bg.jpg'
              )}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-theme-accent to-amber-700 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-theme-accent/50 transition-all duration-300'>
                <Castle size={24} className='text-theme-primary-foreground' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <h4 className='text-theme-primary text-lg font-semibold drop-shadow-lg'>Fortress Owner</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>
                  {fortressOwner?.guild ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className='text-sm text-theme-text-muted/90 drop-shadow-md'>
                  {fortressOwner?.fortress ? `${fortressOwner.fortress}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Players Online Card */}
          <div
            className='card border-theme-primary/30 hover:border-theme-primary/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl(
                'image/Web/players-online-bg.jpg'
              )}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg mr-4 relative group-hover:shadow-green-500/50 transition-all duration-300'>
                <Users size={24} className='text-white' />
                <span className='absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full animate-pulse'></span>
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <h4 className='text-theme-primary text-lg font-semibold drop-shadow-lg'>Players Online</h4>
                </div>
                <p className='font-bold text-white text-2xl drop-shadow-lg animate-pulse'>
                  {playersOnline ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className='text-sm text-green-400 drop-shadow-md'>
                  <span>Currently Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Unique Kills Live Ticker */}
        <div className='mt-12'>
          <div className='flex justify-center mb-6'>
            <h3 className='text-2xl md:text-3xl font-bold text-theme-primary'>🔥 Recent Unique Kills</h3>
          </div>

          {killsLoading ? (
            <div className='flex justify-center py-8'>
              <div className='w-8 h-8 border-2 border-theme-primary border-t-transparent rounded-full animate-spin'></div>
            </div>
          ) : recentKills.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {recentKills.map((kill, index) => (
                <div
                  key={`${kill.mobId}-${kill.charId}-${kill.eventDate}-${index}`}
                  className='p-4 bg-theme-surface/60 rounded-lg border border-theme-primary/20 hover:border-theme-primary/50 transition-all duration-300 hover:scale-[1.02]'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className='w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0 shadow-lg'>
                        <Skull size={20} className='text-white' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Link
                            to={`/character/${encodeURIComponent(kill.characterName)}`}
                            className='text-sm font-bold text-theme-primary hover:text-lafftale-bronze transition-colors truncate'
                          >
                            {kill.characterName}
                          </Link>
                          <span className='text-xs text-gray-400'>killed</span>
                        </div>
                        <div className='text-base font-semibold text-white truncate'>
                          {getMonsterName(kill.monsterCodeName)}
                        </div>
                      </div>
                    </div>
                    <div className='text-right flex-shrink-0'>
                      <div className='text-xs text-gray-400'>{formatKillDate(kill.eventDate)}</div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {new Date(kill.eventDate).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center text-gray-400 py-8 bg-theme-surface/30 rounded-lg border border-theme-primary/10'>
              <p className='text-sm'>No recent unique kills</p>
            </div>
          )}
        </div>

        <div className='mt-8 text-center'>
          <Button asChild variant='outline' className='btn-outline'>
            <Link to='/rankings'>View Full Rankings</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServerOverview;
