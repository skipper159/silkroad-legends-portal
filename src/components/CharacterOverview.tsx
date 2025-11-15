import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCharacterItemPoints } from '@/hooks/useCharacterItemPoints';
import { EquipmentWrapper } from './account/Equipment/EquipmentWrapper';
import { getSlotNameFromId } from '@/lib/slotmapping';
import { getRaceInfo, getCharacterImage, getJobIcon, RaceInfo } from '@/utils/characterUtils';
import { CharacterInventory } from './account/CharacterInventory';
import { transformInventoryData } from '@/utils/itemUtils';
import { getMonsterName, formatKillDate } from '@/utils/monsterNames';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Use same Character interface as account version
interface Character {
  id: number;
  name: string;
  nickname?: string;
  level: number;
  maxLevel: number;
  job: string;
  currentJobClass?: number; // 0 = Trader, 1 = Hunter, 2 = Thief
  currentJobLevel?: number;
  currentPromotionPhase?: number;
  statPoints: number;
  skillPoints: number;
  gold: number;
  Strength: number;
  Intellect: number;
  HP: number;
  MP: number;
  region: number;
  PosX: number;
  PosY: number;
  PosZ: number;
  traderLevel: number;
  hunterLevel: number;
  thiefLevel: number;
  GuildID: number | null;
  GuildName?: string | null;
  CharIcon: number;
  race: string;
  equipment: Record<string, any>;
  inventory?: any[];
}

interface UniqueKill {
  mobId: number;
  eventDate: string;
  monsterCodeName: string;
  monsterName: string;
}

const CharacterOverview: React.FC = () => {
  const { characterName } = useParams<{ characterName: string }>();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [uniqueKills, setUniqueKills] = useState<UniqueKill[]>([]);
  const [loading, setLoading] = useState(true);
  const [uniqueKillsLoading, setUniqueKillsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Item Points Hook - Same as account version
  const { itemPoints, isLoading: itemPointsLoading } = useCharacterItemPoints(selectedCharacter?.id || null);

  useEffect(() => {
    if (!isAuthenticated || !characterName) {
      setError('No character name provided or not authenticated');
      setLoading(false);
      return;
    }

    loadCharacterData();
  }, [characterName, isAuthenticated]);

  const loadCharacterData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get public character information
      const response = await fetchWithAuth(`${weburl}/api/character/public/${encodeURIComponent(characterName!)}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const characterData = data.data;

          // Convert API data to Character interface (same as account version)
          const character: Character = {
            id: characterData.id || characterData.CharID,
            name: characterData.CharName,
            level: characterData.Level,
            maxLevel: 100, // Default max level
            job: getJobNameFromClass(characterData.JobClass || 0),
            currentJobClass: characterData.JobClass || 0,
            currentJobLevel: characterData.JobLevel || 1,
            currentPromotionPhase: characterData.PromotionPhase || 0,
            statPoints: 0, // Not available in public API
            skillPoints: 0, // Not available in public API
            gold: characterData.RemainGold || 0,
            Strength: characterData.Strength || 0,
            Intellect: characterData.Intellect || 0,
            HP: characterData.HP || 0,
            MP: characterData.MP || 0,
            region: 0, // Not available in public API
            PosX: 0,
            PosY: 0,
            PosZ: 0,
            traderLevel: 1, // Default values for public view
            hunterLevel: 1,
            thiefLevel: 1,
            GuildID: characterData.GuildName && characterData.GuildName !== '-' ? 1 : null,
            GuildName: characterData.GuildName && characterData.GuildName !== '-' ? characterData.GuildName : null,
            CharIcon: characterData.Race,
            race: characterData.Race === 1 ? 'Chinese' : 'European',
            equipment: {},
            inventory: [],
          };

          // Load equipment and inventory EXACTLY like account version
          await handleCharacterSelect(character);
        } else {
          setError(data.message || 'Character not found');
        }
      } else {
        setError('Character not found');
      }
    } catch (err) {
      console.error('Error loading character:', err);
      setError('Failed to load character information');
      toast({
        title: 'Error',
        description: 'Failed to load character information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // EXACT same function as account version
  const handleCharacterSelect = async (character: Character) => {
    try {
      // Load equipment (slots 0-12)
      const equipRes = await fetchWithAuth(`${weburl}/api/characters/inventory/${character.id}?min=0&max=12`);
      const equipmentData = await equipRes.json();

      // Transform equipment data to include icon URLs
      const transformedEquipmentData = transformInventoryData(equipmentData);

      // Map equipment items to slot-based object
      const mappedEquipment = transformedEquipmentData.reduce((acc: any, item: any) => {
        const slotName = getSlotNameFromId(item.slot);
        if (slotName) {
          acc[slotName] = item;
        }
        return acc;
      }, {});

      // Load full inventory (slots 13-108 for normal inventory)
      const inventoryRes = await fetchWithAuth(`${weburl}/api/characters/inventory/${character.id}?min=13&max=108`);
      const inventoryData = inventoryRes.ok ? await inventoryRes.json() : [];

      // Transform inventory data to include icon URLs
      const transformedInventory = transformInventoryData(inventoryData);

      setSelectedCharacter({
        ...character,
        equipment: mappedEquipment,
        inventory: transformedInventory,
      });

      // Load unique kills
      loadUniqueKills(character.name);
    } catch (error) {
      // Error loading character data - set defaults
      setSelectedCharacter({ ...character, equipment: {}, inventory: [] });
    }
  };

  const loadUniqueKills = async (charName: string) => {
    try {
      setUniqueKillsLoading(true);
      const response = await fetchWithAuth(
        `${weburl}/api/character/public/${encodeURIComponent(charName)}/unique-kills`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUniqueKills(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading unique kills:', error);
      setUniqueKills([]);
    } finally {
      setUniqueKillsLoading(false);
    }
  };

  // EXACT same function as account version
  const getGoldColorClass = (gold: number): string => {
    if (gold >= 1_000_000_000) return 'text-pink-700';
    if (gold <= 100_000_000) return 'text-pink-500';
    if (gold >= 10_000_000) return 'text-orange-500';
    if (gold >= 100_000) return 'text-yellow-300';
    return 'text-white';
  };

  // Helper function to get job name from job class
  const getJobNameFromClass = (jobClass: number): string => {
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

  // EXACT same functions as account version
  const getCharacterRaceInfo = (character: Character): RaceInfo => {
    return getRaceInfo(character.CharIcon);
  };

  const getCharacterPortrait = (character: Character): string => {
    const raceInfo = getCharacterRaceInfo(character);
    return getCharacterImage(character.CharIcon, raceInfo.name);
  };

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  return (
    <TooltipProvider>
      <div className='min-h-screen flex flex-col'>
        <Navbar />
        <div className='py-12 bg-header-bg bg-cover bg-center'>
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
              Character <span className='text-lafftale-bronze font-cinzel text-4xl font-bold'>Overview</span>
            </h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-gray-300'>
              Detailed view of {selectedCharacter?.name || characterName}'s character information, equipment, and
              inventory.
            </p>
          </div>
        </div>
        <hr />
        <main className='flex-1 bg-silkroad-darkgray/60'>
          <div className='container mx-auto px-4 py-8'>
            <div className='max-w-6xl mx-auto'>
              {loading ? (
                <div className='flex justify-center p-12'>
                  <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                </div>
              ) : error ? (
                <Card className='bg-lafftale-dark/80 border-lafftale-gold/20'>
                  <CardContent className='p-8'>
                    <div className='text-center'>
                      <div className='text-red-400 text-lg mb-2'>{error}</div>
                      <p className='text-gray-400'>
                        The character "{characterName}" could not be found or you don't have permission to view it.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : selectedCharacter ? (
                <Card className='border-lafftale-gold/20 bg-lafftale-dark/70'>
                  <CardContent className='p-6'>
                    {/* Character Header with Race - EXACT same as account version */}
                    <div className='flex items-center gap-3 mb-6'>
                      <img
                        src={getCharacterRaceInfo(selectedCharacter).icon}
                        alt={getCharacterRaceInfo(selectedCharacter).name}
                        className='w-6 h-6'
                      />
                      <div>
                        <h3 className='text-xl font-bold text-lafftale-gold'>{selectedCharacter.name}</h3>
                        <p className='text-sm text-lafftale-bronze'>{getCharacterRaceInfo(selectedCharacter).name}</p>
                      </div>
                      {selectedCharacter.nickname && (
                        <p className='text-lafftale-bronze ml-4'>Nickname: {selectedCharacter.nickname}</p>
                      )}
                    </div>

                    {/* First Row: Basic Info, Character Attributes, Job Levels - EXACT same as account version */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
                      {/* Basic Character Info */}
                      <div className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                        <h4 className='text-lafftale-bronze font-bold mb-3'>Character Info</h4>
                        <div className='space-y-2'>
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>Level:</span>
                            <span className='text-lafftale-gold'>
                              {selectedCharacter.level}/{selectedCharacter.maxLevel}
                            </span>
                          </div>
                          {/* REMOVED Gold section as requested */}
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>Stat Points:</span>
                            <span className='text-lafftale-gold'>{selectedCharacter.statPoints}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>Skill Points:</span>
                            <span className='text-lafftale-gold'>{selectedCharacter.skillPoints}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>Guild:</span>
                            {selectedCharacter.GuildName ? (
                              <Link
                                to={`/guild/${encodeURIComponent(selectedCharacter.GuildName)}`}
                                className='text-lafftale-gold hover:text-lafftale-bronze transition-colors underline'
                              >
                                {selectedCharacter.GuildName}
                              </Link>
                            ) : (
                              <span className='text-lafftale-gold'>None</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Character Attributes - EXACT same as account version */}
                      <div className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                        <h4 className='text-lafftale-bronze font-bold mb-3'>Character Attributes</h4>
                        <div className='space-y-2'>
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>STR:</span>
                            <span className='text-white'>{selectedCharacter.Strength}</span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-gray-300'>INT:</span>
                            <span className='text-white'>{selectedCharacter.Intellect}</span>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex justify-between'>
                              <span className='text-gray-300'>HP:</span>
                              <span className='text-white'>{selectedCharacter.HP}</span>
                            </div>
                            <div className='w-full bg-gray-700 rounded-full h-2'>
                              <div
                                className='bg-red-500 h-2 rounded-full transition-all duration-300'
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                          <div className='space-y-1'>
                            <div className='flex justify-between'>
                              <span className='text-gray-300'>MP:</span>
                              <span className='text-white'>{selectedCharacter.MP}</span>
                            </div>
                            <div className='w-full bg-gray-700 rounded-full h-2'>
                              <div
                                className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                                style={{ width: '100%' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Job Levels - EXACT same as account version */}
                      <div className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                        <h4 className='text-lafftale-bronze font-bold mb-3'>Job Levels</h4>
                        <div className='space-y-2'>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <img src={getJobIcon('trader')} alt='Trader' className='w-5 h-5' />
                              <span className='text-gray-300'>Trader:</span>
                            </div>
                            <span
                              className={`text-white ${
                                selectedCharacter.currentJobClass === 0 ? 'font-bold text-orange-400' : ''
                              }`}
                            >
                              {selectedCharacter.currentJobClass === 0
                                ? selectedCharacter.currentJobLevel || 1
                                : selectedCharacter.traderLevel || 0}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <img src={getJobIcon('hunter')} alt='Hunter' className='w-5 h-5' />
                              <span className='text-gray-300'>Hunter:</span>
                            </div>
                            <span
                              className={`text-white ${
                                selectedCharacter.currentJobClass === 1 ? 'font-bold text-orange-400' : ''
                              }`}
                            >
                              {selectedCharacter.currentJobClass === 1
                                ? selectedCharacter.currentJobLevel || 1
                                : selectedCharacter.hunterLevel || 0}
                            </span>
                          </div>
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <img src={getJobIcon('thief')} alt='Thief' className='w-5 h-5' />
                              <span className='text-gray-300'>Thief:</span>
                            </div>
                            <span
                              className={`text-white ${
                                selectedCharacter.currentJobClass === 2 ? 'font-bold text-orange-400' : ''
                              }`}
                            >
                              {selectedCharacter.currentJobClass === 2
                                ? selectedCharacter.currentJobLevel || 1
                                : selectedCharacter.thiefLevel || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Second Row: Equipment & Inventory - EXACT same as account version */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                      {/* Equipment */}
                      <div className='flex flex-col items-center'>
                        <h3 className='text-xl font-bold text-lafftale-gold mb-4'>Equipment</h3>

                        {/* Item Points Section - EXACT same as account version */}
                        <div className='mb-4'>
                          <div className='p-3 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 min-w-[200px]'>
                            <div className='text-center'>
                              <h4 className='text-lafftale-bronze font-bold mb-1 text-sm'>Item Points</h4>
                              <div className='text-xl font-bold text-lafftale-gold'>
                                {itemPointsLoading ? (
                                  <div className='flex justify-center'>
                                    <div className='w-4 h-4 border-2 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                                  </div>
                                ) : (
                                  itemPoints.toLocaleString('de-DE')
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* EXACT same EquipmentWrapper as account version */}
                        <div className='flex justify-center'>
                          <EquipmentWrapper selectedCharacter={selectedCharacter} />
                        </div>
                      </div>

                      {/* Inventory - EXACT same as account version */}
                      <div className='flex flex-col items-center'>
                        <h3 className='text-xl font-bold text-lafftale-gold mb-4'>Inventory</h3>
                        <div className='flex justify-center w-full'>
                          {selectedCharacter.inventory && (
                            <CharacterInventory
                              characterId={selectedCharacter.id}
                              items={selectedCharacter.inventory}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unique Kills Section - Full Width, 3 Columns */}
                    <div className='mb-6'>
                      <h3 className='text-xl font-bold text-lafftale-gold mb-4 text-center'>Unique Kills</h3>
                      {uniqueKillsLoading ? (
                        <div className='flex justify-center py-8'>
                          <div className='w-8 h-8 border-2 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
                        </div>
                      ) : uniqueKills.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                          {/* Column 1: Kills 1-5 (Newest) */}
                          <div className='space-y-2'>
                            {uniqueKills.slice(0, 5).map((kill, index) => (
                              <div
                                key={`${kill.mobId}-${kill.eventDate}-${index}`}
                                className='p-3 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 hover:border-lafftale-gold/40 transition-colors'
                              >
                                <div className='flex justify-between items-start gap-2'>
                                  <div className='flex-1 min-w-0'>
                                    <div className='text-sm font-semibold text-lafftale-gold truncate'>
                                      {getMonsterName(kill.monsterCodeName)}
                                    </div>
                                    <div className='text-xs text-gray-400 mt-1'>{formatKillDate(kill.eventDate)}</div>
                                  </div>
                                  <div className='text-xs text-gray-500 whitespace-nowrap'>
                                    {new Date(kill.eventDate).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Fill empty slots if less than 5 */}
                            {Array.from({ length: Math.max(0, 5 - uniqueKills.slice(0, 5).length) }).map((_, i) => (
                              <div
                                key={`empty-col1-${i}`}
                                className='p-3 bg-lafftale-dark/20 rounded-lg border border-lafftale-gold/10 opacity-30'
                              >
                                <div className='text-xs text-gray-600 text-center'>-</div>
                              </div>
                            ))}
                          </div>

                          {/* Column 2: Kills 6-10 */}
                          <div className='space-y-2'>
                            {uniqueKills.slice(5, 10).map((kill, index) => (
                              <div
                                key={`${kill.mobId}-${kill.eventDate}-${index + 5}`}
                                className='p-3 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 hover:border-lafftale-gold/40 transition-colors'
                              >
                                <div className='flex justify-between items-start gap-2'>
                                  <div className='flex-1 min-w-0'>
                                    <div className='text-sm font-semibold text-lafftale-gold truncate'>
                                      {getMonsterName(kill.monsterCodeName)}
                                    </div>
                                    <div className='text-xs text-gray-400 mt-1'>{formatKillDate(kill.eventDate)}</div>
                                  </div>
                                  <div className='text-xs text-gray-500 whitespace-nowrap'>
                                    {new Date(kill.eventDate).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Fill empty slots if less than 5 */}
                            {Array.from({ length: Math.max(0, 5 - uniqueKills.slice(5, 10).length) }).map((_, i) => (
                              <div
                                key={`empty-col2-${i}`}
                                className='p-3 bg-lafftale-dark/20 rounded-lg border border-lafftale-gold/10 opacity-30'
                              >
                                <div className='text-xs text-gray-600 text-center'>-</div>
                              </div>
                            ))}
                          </div>

                          {/* Column 3: Kills 11-15 (Oldest) */}
                          <div className='space-y-2'>
                            {uniqueKills.slice(10, 15).map((kill, index) => (
                              <div
                                key={`${kill.mobId}-${kill.eventDate}-${index + 10}`}
                                className='p-3 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 hover:border-lafftale-gold/40 transition-colors'
                              >
                                <div className='flex justify-between items-start gap-2'>
                                  <div className='flex-1 min-w-0'>
                                    <div className='text-sm font-semibold text-lafftale-gold truncate'>
                                      {getMonsterName(kill.monsterCodeName)}
                                    </div>
                                    <div className='text-xs text-gray-400 mt-1'>{formatKillDate(kill.eventDate)}</div>
                                  </div>
                                  <div className='text-xs text-gray-500 whitespace-nowrap'>
                                    {new Date(kill.eventDate).toLocaleDateString('de-DE', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: '2-digit',
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {/* Fill empty slots if less than 5 */}
                            {Array.from({ length: Math.max(0, 5 - uniqueKills.slice(10, 15).length) }).map((_, i) => (
                              <div
                                key={`empty-col3-${i}`}
                                className='p-3 bg-lafftale-dark/20 rounded-lg border border-lafftale-gold/10 opacity-30'
                              >
                                <div className='text-xs text-gray-600 text-center'>-</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className='text-center text-gray-400 py-8 bg-lafftale-dark/30 rounded-lg border border-lafftale-gold/10'>
                          <p className='text-sm'>No unique kills recorded</p>
                        </div>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className='mt-8 text-center text-gray-400'>
                      <p>
                        This is a public character view. For detailed character management, visit your account page.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className='text-gray-400'>Character data not available.</p>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </TooltipProvider>
  );
};

export default CharacterOverview;
