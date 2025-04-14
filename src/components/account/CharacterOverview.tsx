import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fetchWithAuth, weburl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Equipment {
  name: string;
  level: number;
  rarity: string;
  bonuses: string[];
}

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
  equipment: {
    helmet?: Equipment;
    armor?: Equipment;
    weapon?: Equipment;
    shield?: Equipment;
  };
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

  useEffect(() => {
    const loadAccountsAndCharacters = async () => {
      setIsLoading(true);
      try {
        // Hole die aktuelle BenutzerID aus dem Token
        const userId = getUserIdFromToken(token);
        if (!userId) {
          throw new Error("Benutzer-ID konnte nicht ermittelt werden");
        }
        
        // Abrufen der Game Accounts für den aktuellen Benutzer
        const gameAccountsRes = await fetchWithAuth(`${weburl}/api/characters/gameaccounts/${userId}`);
        if (!gameAccountsRes.ok) throw new Error("Fehler beim Laden der GameAccounts");
        const accounts: GameAccount[] = await gameAccountsRes.json();

        // Laden der Charaktere für jeden Game Account
        const detailedAccounts: GameAccount[] = await Promise.all(
          accounts.map(async (account) => {
            try {
              const charRes = await fetchWithAuth(`${weburl}/api/characters/characters/${account.id}`);
              const chars = charRes.ok ? await charRes.json() : [];
              
              // Bereite jeden Charakter mit Standardwerten für das Equipment vor
              const charactersWithEquipment = chars.map((char: Character) => ({
                ...char,
                equipment: {
                  helmet: undefined,
                  armor: undefined,
                  weapon: undefined,
                  shield: undefined
                }
              }));
              
              return { ...account, characters: charactersWithEquipment };
            } catch {
              return { ...account, characters: [] };
            }
          })
        );

        setGameAccounts(detailedAccounts);
        if (detailedAccounts.length > 0) {
          setSelectedAccountId(detailedAccounts[0].id);
          if (detailedAccounts[0].characters && detailedAccounts[0].characters.length > 0) {
            setSelectedCharacter(detailedAccounts[0].characters[0]);
          }
        }
      } catch (err: any) {
        toast({ title: "Fehler", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountsAndCharacters();
  }, [toast, token]);

  // Helfer-Funktion zum Extrahieren der Benutzer-ID aus dem JWT-Token
  const getUserIdFromToken = (token: string | null): number | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id;
    } catch (error) {
      console.error("Fehler beim Dekodieren des Tokens:", error);
      return null;
    }
  };

  const handleAccountChange = (value: string) => {
    const id = parseInt(value);
    const selected = gameAccounts.find(acc => acc.id === id);
    setSelectedAccountId(id);
    setSelectedCharacter(selected?.characters[0] || null);
  };

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const getRarityColorClass = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-200';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'unique': return 'text-purple-400';
      case 'legendary': return 'text-amber-400';
      default: return 'text-white';
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-lafftale-gold mb-6">Character Übersicht</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : gameAccounts.length > 0 ? (
        <div className="space-y-4">
          <div>
            <Label>Game Account auswählen</Label>
            <Select value={selectedAccountId?.toString()} onValueChange={handleAccountChange}>
              <SelectTrigger className="bg-lafftale-dark border-lafftale-gold/30">
                <SelectValue placeholder="Account auswählen" />
              </SelectTrigger>
              <SelectContent className="bg-lafftale-darkgray">
                {gameAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id.toString()}>
                    {acc.username} ({acc.characters.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAccountId && gameAccounts.find(acc => acc.id === selectedAccountId)?.characters.length ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {gameAccounts
                  .find(acc => acc.id === selectedAccountId)
                  ?.characters.map(character => (
                    <Card
                      key={character.id}
                      className={`bg-lafftale-dark/80 border-2 cursor-pointer transition-all hover:scale-105 ${
                        selectedCharacter?.id === character.id
                          ? 'border-lafftale-gold'
                          : 'border-lafftale-gold/30 hover:border-lafftale-gold/70'
                      }`}
                      onClick={() => handleCharacterSelect(character)}
                    >
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-lafftale-darkgray border-2 border-lafftale-gold/50 flex items-center justify-center mb-3">
                            <span className="text-2xl text-lafftale-gold">{character.name.substring(0, 1)}</span>
                          </div>
                          <h4 className="font-bold text-lafftale-gold">{character.name}</h4>
                          <div className="text-sm text-lafftale-bronze">Level {character.level} {character.job}</div>
                        </div>
                      </CardContent>
                    </Card>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Keine Charaktere für diesen Account gefunden.</p>
          )}

          {selectedCharacter ? (
            <Card className="border-lafftale-gold/20 bg-lafftale-dark/70">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <h3 className="text-xl font-bold text-lafftale-gold mb-4">{selectedCharacter.name}</h3>
                    {selectedCharacter.nickname && (
                      <p className="text-lafftale-bronze mb-4">Nickname: {selectedCharacter.nickname}</p>
                    )}
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Level:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.level}/{selectedCharacter.maxLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Klasse:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.job}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Gold:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.gold.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Statuspunkte:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.statPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Fertigkeitspunkte:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.skillPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Guild ID:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.GuildID || "Keine"}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 mb-4">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Charakter Attribute</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Stärke:</span>
                          <span className="text-white">{selectedCharacter.Strength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Intelligenz:</span>
                          <span className="text-white">{selectedCharacter.Intellect}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">HP:</span>
                          <span className="text-white">{selectedCharacter.HP}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">MP:</span>
                          <span className="text-white">{selectedCharacter.MP}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Job Levels</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Trader:</span>
                          <span className="text-white">{selectedCharacter.traderLevel || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Hunter:</span>
                          <span className="text-white">{selectedCharacter.hunterLevel || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Thief:</span>
                          <span className="text-white">{selectedCharacter.thiefLevel || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-2/3">
                    <h3 className="text-xl font-bold text-lafftale-gold mb-4">Ausrüstung</h3>
                    
                    <TooltipProvider>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedCharacter.equipment).map(([slot, item]) => (
                          item ? (
                            <Tooltip key={slot}>
                              <TooltipTrigger asChild>
                                <div className="bg-lafftale-dark/50 p-3 rounded border border-lafftale-gold/20 cursor-pointer hover:bg-lafftale-dark/70">
                                  <strong className="block text-sm text-lafftale-bronze mb-1 capitalize">{slot}</strong>
                                  <span className={getRarityColorClass(item.rarity)}>
                                    {item.name} (Lv. {item.level})
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="bg-lafftale-darkgray border border-lafftale-gold p-3 w-64">
                                <div className="space-y-2">
                                  <div className={`font-bold ${getRarityColorClass(item.rarity)}`}>{item.name} (Lv. {item.level})</div>
                                  <div className="text-xs text-lafftale-bronze capitalize">{item.rarity}</div>
                                  <div className="pt-2 border-t border-lafftale-gold/20">
                                    {item.bonuses.map((bonus, i) => (
                                      <div key={i} className="text-sm text-green-400">{bonus}</div>
                                    ))}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <div key={slot} className="bg-lafftale-dark/30 p-3 rounded border border-lafftale-gold/10">
                              <strong className="block text-sm text-lafftale-bronze mb-1 capitalize">{slot}</strong>
                              <span className="text-gray-400">Nicht ausgerüstet</span>
                            </div>
                          )
                        ))}
                      </div>
                    </TooltipProvider>
                    
                    <div className="mt-6 p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Position</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Region:</span>
                          <span className="text-white">{selectedCharacter.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Koordinaten:</span>
                          <span className="text-white">
                            X: {Math.round(selectedCharacter.PosX)} / 
                            Y: {Math.round(selectedCharacter.PosY)} / 
                            Z: {Math.round(selectedCharacter.PosZ)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <p className="text-gray-400">Bitte wähle einen Charakter aus.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-400">Keine GameAccounts vorhanden.</p>
      )}
    </div>
  );
};

export default CharacterOverview;
