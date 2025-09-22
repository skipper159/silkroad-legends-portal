import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useCharacterItemPoints } from '@/hooks/useCharacterItemPoints';
import { EquipmentWrapper } from './Equipment/EquipmentWrapper';
import { getSlotNameFromId } from '@/lib/slotmapping';
import { getRaceInfo, getCharacterImage, getJobIcon, RaceInfo } from '@/utils/characterUtils';
import { CharacterInventory } from './CharacterInventory';
import { transformInventoryData } from '@/utils/itemUtils';

interface Character {
  id: number;
  name: string;
  nickname?: string;
  level: number;
  maxLevel: number;
  job: string;
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
  CharIcon: number;
  race: string;
  equipment: Record<string, any>;
  inventory?: any[];
}

interface GameAccount {
  id: number;
  username: string;
  regTime?: string;
  regIp?: string;
  characters: Character[];
}

const CharacterOverview = () => {
  const [gameAccounts, setGameAccounts] = useState<GameAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { token } = useAuth();

  // Item Points Hook
  const { itemPoints, isLoading: itemPointsLoading } = useCharacterItemPoints(selectedCharacter?.id || null);

  useEffect(() => {
    const loadAccountsAndCharacters = async () => {
      setIsLoading(true);
      try {
        // Get game accounts for the current user
        const gameAccountsRes = await fetchWithAuth(`${weburl}/api/characters/gameaccounts/my`);
        if (!gameAccountsRes.ok) throw new Error('Error loading game accounts');
        const accounts: GameAccount[] = await gameAccountsRes.json();

        // Loading characters for each game account
        const detailedAccounts: GameAccount[] = await Promise.all(
          accounts.map(async (account) => {
            try {
              const charRes = await fetchWithAuth(`${weburl}/api/characters/characters/${account.id}`);
              const chars = charRes.ok ? await charRes.json() : [];

              // Prepare each character with default values for equipment
              const charactersWithEquipment = chars.map((char: Character) => ({
                ...char,
              }));

              return { ...account, characters: charactersWithEquipment };
            } catch {
              return { ...account, characters: [] };
            }
          })
        );

        setGameAccounts(detailedAccounts);
        if (detailedAccounts.length > 0 && detailedAccounts[0].characters.length > 0) {
          setSelectedAccountId(detailedAccounts[0].id);
          // Ersten Charakter direkt vollständig laden (inkl. Ausrüstung)
          await handleCharacterSelect(detailedAccounts[0].characters[0]);
        }
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountsAndCharacters();
  }, [toast, token]);

  const handleAccountChange = (value: string) => {
    const id = parseInt(value);
    const selected = gameAccounts.find((acc) => acc.id === id);
    setSelectedAccountId(id);
    setSelectedCharacter(selected?.characters[0] || null);
  };

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
    } catch (error) {
      // Error loading character data - set defaults
      setSelectedCharacter({ ...character, equipment: {}, inventory: [] });
    }
  };

  const getGoldColorClass = (gold: number): string => {
    if (gold >= 1_000_000_000) return 'text-pink-700';
    if (gold <= 100_000_000) return 'text-pink-500';
    if (gold >= 10_000_000) return 'text-orange-500';
    if (gold >= 100_000) return 'text-yellow-300';
    return 'text-white';
  };

  // Character Race and Image helpers
  const getCharacterRaceInfo = (character: Character): RaceInfo => {
    return getRaceInfo(character.CharIcon);
  };

  const getCharacterPortrait = (character: Character): string => {
    const raceInfo = getCharacterRaceInfo(character);
    return getCharacterImage(character.CharIcon, raceInfo.name);
  };

  return (
    <TooltipProvider>
      <div>
        <h2 className='text-2xl font-bold text-lafftale-gold mb-6'>Character Overview</h2>

        {isLoading ? (
          <div className='flex justify-center p-12'>
            <div className='w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : gameAccounts.length > 0 ? (
          <div className='space-y-4'>
            <div>
              <Label>Choose Game Account</Label>
              <Select value={selectedAccountId?.toString()} onValueChange={handleAccountChange}>
                <SelectTrigger className='bg-lafftale-dark border-lafftale-gold/30'>
                  <SelectValue placeholder='Choose Account' />
                </SelectTrigger>
                <SelectContent className='bg-lafftale-darkgray'>
                  {gameAccounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id.toString()}>
                      {acc.username} ({acc.characters.length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedAccountId && gameAccounts.find((acc) => acc.id === selectedAccountId)?.characters.length ? (
              <div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                  {gameAccounts
                    .find((acc) => acc.id === selectedAccountId)
                    ?.characters.map((character) => {
                      const raceInfo = getCharacterRaceInfo(character);
                      const portrait = getCharacterPortrait(character);

                      return (
                        <Card
                          key={character.id}
                          className={`bg-lafftale-dark/80 border-2 cursor-pointer transition-all hover:scale-105 ${
                            selectedCharacter?.id === character.id
                              ? 'border-lafftale-gold'
                              : 'border-lafftale-gold/30 hover:border-lafftale-gold/70'
                          }`}
                          onClick={() => handleCharacterSelect(character)}
                        >
                          <CardContent className='p-4'>
                            <div className='flex flex-col items-center'>
                              {/* Character Portrait */}
                              <div className='w-16 h-16 rounded-full overflow-hidden border-2 border-lafftale-gold/50 mb-2'>
                                <img
                                  src={portrait}
                                  alt={`${character.name} Portrait`}
                                  className='w-full h-full object-cover'
                                  onError={(e) => {
                                    e.currentTarget.src = '/images/icon_default.png';
                                  }}
                                />
                              </div>

                              {/* Character Name */}
                              <h4 className='font-bold text-lafftale-gold'>{character.name}</h4>

                              {/* Race with Icon */}
                              <div className='flex items-center gap-1 mb-1'>
                                <img
                                  src={raceInfo.icon}
                                  alt={raceInfo.name}
                                  className='w-4 h-4'
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <span className='text-xs text-lafftale-bronze'>{raceInfo.name}</span>
                              </div>

                              {/* Level */}
                              <div className='text-sm text-lafftale-bronze'>Level {character.level}</div>

                              {/* Job Levels */}
                              <div className='flex gap-2 mt-2'>
                                {character.traderLevel > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className='flex items-center gap-1'>
                                        <img src={getJobIcon('trader')} alt='Trader' className='w-4 h-4' />
                                        <span className='text-xs text-blue-400'>{character.traderLevel}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Trader Level: {character.traderLevel}</TooltipContent>
                                  </Tooltip>
                                )}
                                {character.hunterLevel > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className='flex items-center gap-1'>
                                        <img src={getJobIcon('hunter')} alt='Hunter' className='w-4 h-4' />
                                        <span className='text-xs text-green-400'>{character.hunterLevel}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Hunter Level: {character.hunterLevel}</TooltipContent>
                                  </Tooltip>
                                )}
                                {character.thiefLevel > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <div className='flex items-center gap-1'>
                                        <img src={getJobIcon('thief')} alt='Thief' className='w-4 h-4' />
                                        <span className='text-xs text-red-400'>{character.thiefLevel}</span>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Thief Level: {character.thiefLevel}</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </div>
            ) : (
              <p className='text-gray-400'>No Characters found for this Account.</p>
            )}

            {selectedCharacter ? (
              <Card className='border-lafftale-gold/20 bg-lafftale-dark/70'>
                <CardContent className='p-6'>
                  {/* Character Header with Race */}
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

                  {/* First Row: Basic Info, Character Attributes, Job Levels */}
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
                        <div className='flex justify-between'>
                          <span className='text-gray-300'>Gold:</span>
                          <span className={getGoldColorClass(selectedCharacter.gold)}>
                            {Number(selectedCharacter.gold).toLocaleString('de-DE')}
                          </span>
                        </div>
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
                          <span className='text-lafftale-gold'>{selectedCharacter.GuildID || 'None'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Character Attributes */}
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

                    {/* Job Levels */}
                    <div className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                      <h4 className='text-lafftale-bronze font-bold mb-3'>Job Levels</h4>
                      <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <img src={getJobIcon('trader')} alt='Trader' className='w-5 h-5' />
                            <span className='text-gray-300'>Trader:</span>
                          </div>
                          <span className='text-white'>{selectedCharacter.traderLevel || 0}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <img src={getJobIcon('hunter')} alt='Hunter' className='w-5 h-5' />
                            <span className='text-gray-300'>Hunter:</span>
                          </div>
                          <span className='text-white'>{selectedCharacter.hunterLevel || 0}</span>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <img src={getJobIcon('thief')} alt='Thief' className='w-5 h-5' />
                            <span className='text-gray-300'>Thief:</span>
                          </div>
                          <span className='text-white'>{selectedCharacter.thiefLevel || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Second Row: Equipment & Inventory */}
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                    {/* Equipment */}
                    <div className='flex flex-col items-center'>
                      <h3 className='text-xl font-bold text-lafftale-gold mb-4'>Equipment</h3>

                      {/* Item Points Section - direkt unter Equipment Überschrift */}
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

                      <div className='flex justify-center'>
                        <EquipmentWrapper selectedCharacter={selectedCharacter} />
                      </div>
                    </div>

                    {/* Inventory */}
                    <div className='flex flex-col items-center'>
                      <h3 className='text-xl font-bold text-lafftale-gold mb-4'>Inventory</h3>
                      <div className='flex justify-center w-full'>
                        {selectedCharacter.inventory && (
                          <CharacterInventory characterId={selectedCharacter.id} items={selectedCharacter.inventory} />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Third Row: Position Info */}
                  <div className='p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20'>
                    <h4 className='text-lafftale-bronze font-bold mb-3'>Position</h4>
                    <div className='space-y-2'>
                      <div className='flex justify-between'>
                        <span className='text-gray-300'>Region:</span>
                        <span className='text-white'>{selectedCharacter.region}</span>
                      </div>
                      <div className='flex justify-between'>
                        <span className='text-gray-300'>Coordinates:</span>
                        <span className='text-white'>
                          X: {Math.round(selectedCharacter.PosX)} / Y: {Math.round(selectedCharacter.PosY)} / Z:{' '}
                          {Math.round(selectedCharacter.PosZ)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className='text-gray-400'>Please Choose a Character.</p>
            )}
          </div>
        ) : (
          <p className='text-gray-400'>No Game Accounts available.</p>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CharacterOverview;
