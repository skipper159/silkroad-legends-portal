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
import { EquipmentWrapper } from "./Equipment/EquipmentWrapper";
import { getSlotNameFromId } from "@/lib/slotmapping";

//interface Equipment {
//  name: string;
//  level: number;
//  rarity: string;
//  bonuses: string[];
//}

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
  equipment: {
    //helmet?: Equipment;
    //armor?: Equipment;
    //weapon?: Equipment;
    //shield?: Equipment;
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
              //  equipment: {
              //    helmet: undefined,
              //    armor: undefined,
              //    weapon: undefined,
              //    shield: undefined
              //  }
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

  const handleCharacterSelect = async (character: Character) => {
    try {
      const equipRes = await fetchWithAuth(`${weburl}/api/inventory/${character.id}`);
      const equipmentData = await equipRes.json();
  
      // Mappe die Items zu einem Slot-basierten Objekt
      const mappedEquipment = equipmentData.reduce((acc: any, item: any) => {
        const slotName = getSlotNameFromId(item.slot); // eigene Zuordnungsfunktion
        if (slotName) {
          acc[slotName] = item;
        }
        return acc;
      }, {});
  
      setSelectedCharacter({ ...character, equipment: mappedEquipment });
    } catch (error) {
      console.error("Fehler beim Laden der Ausrüstung:", error);
      setSelectedCharacter({ ...character, equipment: {} });
    }
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

  const getGoldColorClass = (gold: number): string => {
    if (gold >= 1_000_000_000) return "text-pink-700";
    if (gold <= 100_000_000) return "text-pink-500";
    if (gold >= 10_000_000) return "text-orange-500";
    if (gold >= 100_000) return "text-yellow-300";
    return "text-white";
  };
  return (
    <div>
      <h2 className="text-2xl font-bold text-lafftale-gold mb-6">Character Overview</h2>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-6 h-6 border-4 border-lafftale-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : gameAccounts.length > 0 ? (
        <div className="space-y-4">
          <div>
            <Label>Choose Game Account</Label>
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
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-lafftale-gold/50 mb-3">
                  <img
                    src={`/public/image/sro/chars/${character.CharIcon}.gif`}
                    alt={`${character.name} Avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/public/image/sro/chars/default.gif";
                    }}
                  />
                </div>
                <h4 className="font-bold text-lafftale-gold">{character.name}</h4>
                <div className="text-sm text-lafftale-bronze">
                  Level {character.level}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  </div>
) : (
            <p className="text-gray-400">No Charakters found for these Account.</p>
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
                        <span className="text-gray-300">Race:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.race}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-300">Gold:</span>
                        <span className={getGoldColorClass(selectedCharacter.gold)}>
                          {Number(selectedCharacter.gold).toLocaleString("de-DE")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Stat Points:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.statPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Skill Points:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.skillPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Guild:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.GuildID || "Keine"}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 mb-4">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Charakter Attribute</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">STR:</span>
                          <span className="text-white">{selectedCharacter.Strength}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">INT:</span>
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
                  
                  {/* Inventory Modul */}     
                           
                  <div className="lg:w-2/3">
                    <h3 className="text-xl font-bold text-lafftale-gold mb-4">Equipment</h3>
                      <div className="flex">
                        <div className="hidden lg:block w-1/3 flex justify-center">
                        <EquipmentWrapper selectedCharacter={selectedCharacter} />
                        </div>
                    
                      {/* Andere Inhalte (Charaktermodell, etc.) */}
                      </div>

                   

                    
                    <div className="mt-6 p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Position</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Region:</span>
                          <span className="text-white">{selectedCharacter.region}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Coordinates:</span>
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
            <p className="text-gray-400">Please Choose a Character.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-400">No GameAccounts available.</p>
      )}
    </div>
  );
};

export default CharacterOverview;
