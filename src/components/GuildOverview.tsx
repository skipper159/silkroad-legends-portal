import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { getRaceInfo, getJobIcon, RaceInfo } from '@/utils/characterUtils';
import { useTheme } from '@/context/ThemeContext';

interface GuildMember {
  CharID: number;
  CharName16: string;
  CurLevel: number;
  Race: number;
  JobClass: number; // 0 = Trader, 1 = Hunter, 2 = Thief
  JobLevel: number;
  PromotionPhase: number;
  Strength: number;
  Intellect: number;
  LastLogout?: string;
  ItemPoints?: number;
  MemberClass: number; // Guild rank/role
  GuildLevel?: number;
  Donation?: number;
  JoinDate?: string;
  Contribution?: number;
}

interface GuildInfo {
  ID: number;
  Name: string;
  Lvl: number;
  MemberCount: number;
  Alliance?: string;
  Notice?: string;
  CreatedDate?: string;
}

interface GuildOverviewData {
  guild: GuildInfo;
  members: GuildMember[];
}

const GuildOverview: React.FC = () => {
  const { currentTemplate } = useTheme();
  const { Layout } = currentTemplate.components;
  const { guildName } = useParams<{ guildName: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [guildData, setGuildData] = useState<GuildOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !guildName) {
      setError('No guild name provided or not authenticated');
      setLoading(false);
      return;
    }

    loadGuildData();
  }, [guildName, isAuthenticated]);

  const loadGuildData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get guild information and members
      const response = await fetchWithAuth(`${weburl}/api/guild/overview/${encodeURIComponent(guildName!)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGuildData(data.data);
        } else {
          setError(data.message || 'Guild not found');
        }
      } else {
        setError('Guild not found');
      }
    } catch (err) {
      console.error('Error loading guild:', err);
      setError('Failed to load guild information');
      toast({
        title: 'Error',
        description: 'Failed to load guild information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getCharacterRaceInfo = (race: number): RaceInfo => {
    return getRaceInfo(race);
  };

  const getJobName = (jobClass: number): string => {
    switch (jobClass) {
      case 0:
        return 'Trader';
      case 1:
        return 'Hunter';
      case 2:
        return 'Thief';
      default:
        return 'Trader';
    }
  };

  const getJobIcon = (jobClass: number): string => {
    switch (jobClass) {
      case 0:
        return '/images/com_job_merchant.png';
      case 1:
        return '/images/com_job_hunter.png';
      case 2:
        return '/images/com_job_thief.png';
      default:
        return '/images/com_job_merchant.png';
    }
  };

  const getGuildRankName = (memberClass: number): string => {
    switch (memberClass) {
      case 0:
        return 'Guild Master';
      case 10:
        return 'Member';
      default:
        return 'Member';
    }
  };

  const getGuildRankColor = (memberClass: number): string => {
    switch (memberClass) {
      case 0:
        return 'text-yellow-400'; // Guild Master
      case 10:
        return 'text-green-400'; // Member
      default:
        return 'text-gray-400';
    }
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (
    <TooltipProvider>
      <Layout>
        <div
          className='py-12 bg-cover bg-center'
          style={{
            backgroundImage: `url('${currentTemplate.assets.pageHeaderBackground}')`,
          }}
        >
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
              Guild <span className='text-theme-accent font-cinzel text-4xl font-bold'>Overview</span>
            </h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
              Detailed view of {guildName} guild members and information.
            </p>
          </div>
        </div>
        <hr />
        <main className='flex-1 bg-theme-surface/60'>
          <div className='container mx-auto px-4 py-8'>
            <div className='max-w-6xl mx-auto'>
              {loading ? (
                <div className='flex justify-center p-12'>
                  <div className='w-6 h-6 border-4 border-theme-primary border-t-transparent rounded-full animate-spin'></div>
                </div>
              ) : error ? (
                <Card className='bg-theme-surface/80 border-theme-primary/20'>
                  <CardContent className='p-8'>
                    <div className='text-center'>
                      <div className='text-red-400 text-lg mb-2'>{error}</div>
                      <p className='text-theme-text-muted'>
                        The guild "{guildName}" could not be found or you don't have permission to view it.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : guildData ? (
                <div className='space-y-6'>
                  {/* Guild Information Card */}
                  <Card className='border-theme-primary/20 bg-lafftale-dark/70'>
                    <CardContent className='p-6'>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='p-4 bg-theme-surface/50 rounded-lg border border-theme-primary/20'>
                          <h4 className='text-theme-accent font-bold mb-3'>Guild Info</h4>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Name:</span>
                              <span className='text-theme-primary font-bold'>{guildData.guild.Name}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Level:</span>
                              <span className='text-theme-primary'>{guildData.guild.Lvl}</span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Members:</span>
                              <span className='text-theme-primary'>{guildData.guild.MemberCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className='p-4 bg-theme-surface/50 rounded-lg border border-theme-primary/20'>
                          <h4 className='text-theme-accent font-bold mb-3'>Alliance</h4>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Alliance:</span>
                              <span className='text-theme-primary'>{guildData.guild.Alliance || 'No Alliance'}</span>
                            </div>
                          </div>
                        </div>

                        <div className='p-4 bg-theme-surface/50 rounded-lg border border-theme-primary/20'>
                          <h4 className='text-theme-accent font-bold mb-3'>Statistics</h4>
                          <div className='space-y-2'>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Online:</span>
                              <span className='text-green-400'>
                                {
                                  guildData.members.filter(
                                    (m) =>
                                      m.LastLogout &&
                                      new Date(m.LastLogout) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                                  ).length
                                }
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-theme-text-muted'>Avg Level:</span>
                              <span className='text-theme-primary'>
                                {Math.round(
                                  guildData.members.reduce((sum, m) => sum + m.CurLevel, 0) / guildData.members.length
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guild Members Table */}
                  <Card className='border-theme-primary/20 bg-theme-surface/70'>
                    <CardContent className='p-6'>
                      <h3 className='text-xl font-bold text-theme-primary mb-4'>Guild Members</h3>

                      <Table>
                        <TableHeader>
                          <TableRow className='border-b border-theme-primary/20'>
                            <TableHead className='text-theme-primary font-semibold'>Name</TableHead>
                            <TableHead className='text-theme-primary font-semibold'>Level</TableHead>
                            <TableHead className='text-theme-primary font-semibold'>Race</TableHead>
                            <TableHead className='text-theme-primary font-semibold'>Job</TableHead>
                            <TableHead className='text-theme-primary font-semibold hidden md:table-cell'>
                              Item Points
                            </TableHead>
                            <TableHead className='text-theme-primary font-semibold hidden lg:table-cell'>
                              Guild Rank
                            </TableHead>
                            <TableHead className='text-theme-primary font-semibold hidden lg:table-cell'>
                              Last Login
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {guildData.members.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={7} className='text-center py-8 text-theme-text-muted'>
                                No members found
                              </TableCell>
                            </TableRow>
                          ) : (
                            guildData.members
                              .sort((a, b) => a.MemberClass - b.MemberClass || b.CurLevel - a.CurLevel)
                              .map((member) => {
                                const raceInfo = getCharacterRaceInfo(member.Race);
                                const isOnline =
                                  member.LastLogout &&
                                  new Date(member.LastLogout) > new Date(Date.now() - 24 * 60 * 60 * 1000);

                                return (
                                  <TableRow
                                    key={member.CharID}
                                    className='border-b border-theme-primary/10 hover:bg-lafftale-gold/5'
                                  >
                                    <TableCell className='font-medium'>
                                      <Link
                                        to={`/character/${encodeURIComponent(member.CharName16)}`}
                                        className='text-theme-primary hover:text-theme-accent transition-colors'
                                      >
                                        {member.CharName16}
                                      </Link>
                                      {isOnline && (
                                        <span className='ml-2 w-2 h-2 bg-green-400 rounded-full inline-block'></span>
                                      )}
                                    </TableCell>
                                    <TableCell>{member.CurLevel}</TableCell>
                                    <TableCell>
                                      <div className='flex items-center gap-2'>
                                        <img src={raceInfo.icon} alt={raceInfo.name} className='w-4 h-4' />
                                        <span className='hidden sm:inline'>{raceInfo.name}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <div className='flex items-center gap-1'>
                                        <img
                                          src={getJobIcon(member.JobClass)}
                                          alt={getJobName(member.JobClass)}
                                          className='w-5 h-5'
                                        />
                                        <span className='font-medium text-theme-primary'>
                                          {getJobName(member.JobClass)}
                                        </span>
                                        <span className='hidden sm:inline text-theme-text-muted'>
                                          (Lv.{member.JobLevel})
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className='hidden md:table-cell'>
                                      {member.ItemPoints?.toLocaleString('de-DE') || '0'}
                                    </TableCell>
                                    <TableCell
                                      className={`hidden lg:table-cell ${getGuildRankColor(member.MemberClass)}`}
                                    >
                                      {getGuildRankName(member.MemberClass)}
                                    </TableCell>
                                    <TableCell className='hidden lg:table-cell text-sm text-theme-text-muted'>
                                      {member.LastLogout
                                        ? new Date(member.LastLogout).toLocaleDateString('de-DE')
                                        : 'Unknown'}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className='text-theme-text-muted'>Guild data not available.</p>
              )}
            </div>
          </div>
        </main>
      </Layout>
    </TooltipProvider>
  );
};

export default GuildOverview;
