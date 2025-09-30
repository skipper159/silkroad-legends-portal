import { Crown, Users, Castle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { getPublicUrl } from '@/utils/assetUtils';

const ServerOverview = () => {
  const [topPlayer, setTopPlayer] = useState<any | null>(null);
  const [topGuild, setTopGuild] = useState<any | null>(null);
  const [playersOnline, setPlayersOnline] = useState<number | null>(null); // TODO: backend endpoint
  const [fortressOwner, setFortressOwner] = useState<any | null>(null); // TODO: backend endpoint
  const [loading, setLoading] = useState(true);

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

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className='py-16 bg-lafftale-dark/90'>
      <div className='container mx-auto px-4'>
        <h2 className='decorated-heading text-3xl md:text-4xl text-center mb-12'>Server Overview</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {/* Top Player Card */}
          <div 
            className='card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl('image/Web/top-player-bg.jpg')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-lafftale-gold to-amber-600 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-lafftale-gold/50 transition-all duration-300'>
                <Trophy size={24} className='text-lafftale-dark' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <Trophy size={16} className='text-lafftale-gold mr-2 group-hover:scale-110 transition-transform duration-300' />
                  <h4 className='text-lafftale-gold text-lg font-semibold drop-shadow-lg'>Top Player</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>{topPlayer?.name ?? (loading ? 'Loading...' : '—')}</p>
                <div className='text-sm text-lafftale-beige/90 drop-shadow-md'>
                  <span>{topPlayer?.guild ?? '—'}</span>
                </div>
                <div className='text-xs text-lafftale-gold mt-1 drop-shadow-md'>
                  {topPlayer?.itemPoints ? `${topPlayer.itemPoints.toLocaleString()} Item Points` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Top Guild Card */}
          <div 
            className='card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl('image/Web/top-guild-bg.jpg')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-lafftale-gold to-amber-600 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-lafftale-gold/50 transition-all duration-300'>
                <Crown size={24} className='text-lafftale-dark' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <Crown size={16} className='text-lafftale-gold mr-2 group-hover:scale-110 transition-transform duration-300' />
                  <h4 className='text-lafftale-gold text-lg font-semibold drop-shadow-lg'>Top Guild</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>{topGuild?.name ?? (loading ? 'Loading...' : '—')}</p>
                <div className='text-sm text-lafftale-beige/90 drop-shadow-md'>
                  {topGuild?.activityPoints ? `${topGuild.activityPoints} Activity Points` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Fortress Owner Card */}
          <div 
            className='card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl('image/Web/fortress-owner-bg.jpg')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className='relative z-10 flex items-start'>
              <div className='w-12 h-12 rounded-full bg-gradient-to-br from-lafftale-bronze to-amber-700 flex items-center justify-center shadow-lg mr-4 group-hover:shadow-lafftale-bronze/50 transition-all duration-300'>
                <Castle size={24} className='text-lafftale-dark' />
              </div>
              <div>
                <div className='flex items-center mb-1'>
                  <Castle size={16} className='text-lafftale-gold mr-2 group-hover:scale-110 transition-transform duration-300' />
                  <h4 className='text-lafftale-gold text-lg font-semibold drop-shadow-lg'>Fortress Owner</h4>
                </div>
                <p className='font-bold text-white drop-shadow-lg text-lg'>
                  {fortressOwner?.guild ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className='text-sm text-lafftale-beige/90 drop-shadow-md'>
                  {fortressOwner?.fortress ? `${fortressOwner.fortress}` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Players Online Card */}
          <div 
            className='card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all duration-300 relative overflow-hidden group hover:scale-105'
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.4)), url('${getPublicUrl('image/Web/players-online-bg.jpg')}')`,
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
                  <Users size={16} className='text-lafftale-gold mr-2 group-hover:scale-110 transition-transform duration-300' />
                  <h4 className='text-lafftale-gold text-lg font-semibold drop-shadow-lg'>Players Online</h4>
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
