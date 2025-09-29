
import { Crown, Users, Castle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

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
    <section className="py-16 bg-lafftale-dark/90">
      <div className="container mx-auto px-4">
        <h2 className="decorated-heading text-3xl md:text-4xl text-center mb-12">Server Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Top Player Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-darkred flex items-center justify-center text-lafftale-gold text-xl font-bold mr-4">
                <Trophy size={24} className="text-lafftale-gold" />
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Trophy size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Top Player</h4>
                </div>
                <p className="font-bold text-lafftale-beige">{topPlayer?.name ?? (loading ? 'Loading...' : '—')}</p>
                <div className="text-sm text-gray-400">
                  <span>{topPlayer?.guild ?? '—'}</span>
                </div>
                <div className="text-xs text-lafftale-gold mt-1">
                  {topPlayer?.itemPoints ? `${topPlayer.itemPoints.toLocaleString()} Item Points` : ''}
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Guild Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-darkred flex items-center justify-center text-lafftale-gold text-xl font-bold mr-4">
                <Crown size={24} className="text-lafftale-gold" />
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Crown size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Top Guild</h4>
                </div>
                <p className="font-bold text-lafftale-beige">{topGuild?.name ?? (loading ? 'Loading...' : '—')}</p>
              </div>
            </div>
          </div>
          
          {/* Fortress Owner Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-bronze/80 flex items-center justify-center text-lafftale-dark text-xl font-bold mr-4">
                <Castle size={24} className="text-lafftale-dark" />
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Castle size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Fortress Owner</h4>
                </div>
                <p className="font-bold text-lafftale-beige">{fortressOwner?.guild ?? (loading ? 'Loading...' : '—')}</p>
              </div>
            </div>
          </div>
          
          {/* Players Online Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-gold/20 flex items-center justify-center text-lafftale-gold mr-4 relative">
                <Users size={24} className="text-lafftale-gold" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-pulse-subtle"></span>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Users size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Players Online</h4>
                </div>
                <p className="font-bold text-lafftale-beige text-2xl animate-pulse-subtle">
                  {playersOnline ?? (loading ? 'Loading...' : '—')}
                </p>
                <div className="text-sm text-green-500">
                  <span>Currently Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="btn-outline">
            <Link to="/rankings">View Full Rankings</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServerOverview;
