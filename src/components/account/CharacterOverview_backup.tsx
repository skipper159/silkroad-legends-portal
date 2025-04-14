
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Equipment {
  name: string;
  level: number;
  rarity: string;
  bonuses: string[];
}

interface Character {
  id: number;
  name: string;
  level: number;
  job: string;
  statPoints: number;
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
  characters: Character[];
}

interface CharacterOverviewProps {
  gameAccounts: GameAccount[];
}

const CharacterOverview = ({ gameAccounts }: CharacterOverviewProps) => {
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    gameAccounts.length > 0 ? gameAccounts[0].id : null
  );
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  
  const selectedAccount = gameAccounts.find(acc => acc.id === selectedAccountId);
  
  // Set first character as selected when account changes
  const handleAccountChange = (accountId: string) => {
    const accountIdNum = parseInt(accountId);
    setSelectedAccountId(accountIdNum);
    
    const account = gameAccounts.find(acc => acc.id === accountIdNum);
    if (account && account.characters.length > 0) {
      setSelectedCharacter(account.characters[0]);
    } else {
      setSelectedCharacter(null);
    }
  };

  // Get rarity color class based on item rarity
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
      <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Character Overview</h2>
      
      <div className="space-y-6">
        {gameAccounts.length > 0 ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="select-game-account">Select Game Account</Label>
              <Select
                value={selectedAccountId ? String(selectedAccountId) : ""}
                onValueChange={handleAccountChange}
              >
                <SelectTrigger className="bg-lafftale-dark/70 border-lafftale-gold/20" id="select-game-account">
                  <SelectValue placeholder="Select a game account" />
                </SelectTrigger>
                <SelectContent className="bg-lafftale-darkgray border-lafftale-gold/20">
                  {gameAccounts.map(account => (
                    <SelectItem key={account.id} value={String(account.id)}>
                      {account.username} ({account.characters.length} characters)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedAccount && selectedAccount.characters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {selectedAccount.characters.map(character => (
                  <Card 
                    key={character.id}
                    className={`bg-lafftale-dark/80 border-2 cursor-pointer transition-all hover:scale-105 ${
                      selectedCharacter?.id === character.id 
                        ? 'border-lafftale-gold' 
                        : 'border-lafftale-gold/30 hover:border-lafftale-gold/70'
                    }`}
                    onClick={() => setSelectedCharacter(character)}
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
            ) : (
              <div className="text-center py-10 text-gray-400">
                No characters found for this account
              </div>
            )}
            
            {selectedCharacter && (
              <div className="mt-8 bg-lafftale-darkgray/80 border border-lafftale-gold/30 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="lg:w-1/3">
                    <h3 className="text-xl font-bold text-lafftale-gold mb-4 font-cinzel">{selectedCharacter.name}</h3>
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Level:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Class:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.job}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Stat Points:</span>
                        <span className="text-lafftale-gold">{selectedCharacter.statPoints}</span>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20">
                      <h4 className="text-lafftale-bronze font-bold mb-3">Character Stats</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Strength:</span>
                          <span className="text-white">105</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Intelligence:</span>
                          <span className="text-white">45</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Dexterity:</span>
                          <span className="text-white">75</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Vitality:</span>
                          <span className="text-white">120</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Physical Defense:</span>
                          <span className="text-white">650</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Magical Defense:</span>
                          <span className="text-white">350</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-2/3">
                    <h3 className="text-xl font-bold text-lafftale-gold mb-4 font-cinzel">Equipment</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TooltipProvider>
                        {selectedCharacter.equipment.helmet && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 cursor-pointer hover:bg-lafftale-dark/70">
                                <h4 className="font-bold mb-1">Helmet</h4>
                                <div className={`${getRarityColorClass(selectedCharacter.equipment.helmet.rarity)}`}>
                                  {selectedCharacter.equipment.helmet.name} (Lv. {selectedCharacter.equipment.helmet.level})
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-lafftale-darkgray border border-lafftale-gold/50 p-3 w-64">
                              <div className="space-y-2">
                                <div className={`font-bold text-base ${getRarityColorClass(selectedCharacter.equipment.helmet.rarity)}`}>
                                  {selectedCharacter.equipment.helmet.name} (Lv. {selectedCharacter.equipment.helmet.level})
                                </div>
                                <div className="text-xs text-lafftale-bronze capitalize">{selectedCharacter.equipment.helmet.rarity}</div>
                                <div className="pt-2 border-t border-lafftale-gold/20">
                                  {selectedCharacter.equipment.helmet.bonuses.map((bonus, i) => (
                                    <div key={i} className="text-sm text-green-400">{bonus}</div>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {selectedCharacter.equipment.armor && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 cursor-pointer hover:bg-lafftale-dark/70">
                                <h4 className="font-bold mb-1">Armor</h4>
                                <div className={`${getRarityColorClass(selectedCharacter.equipment.armor.rarity)}`}>
                                  {selectedCharacter.equipment.armor.name} (Lv. {selectedCharacter.equipment.armor.level})
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-lafftale-darkgray border border-lafftale-gold/50 p-3 w-64">
                              <div className="space-y-2">
                                <div className={`font-bold text-base ${getRarityColorClass(selectedCharacter.equipment.armor.rarity)}`}>
                                  {selectedCharacter.equipment.armor.name} (Lv. {selectedCharacter.equipment.armor.level})
                                </div>
                                <div className="text-xs text-lafftale-bronze capitalize">{selectedCharacter.equipment.armor.rarity}</div>
                                <div className="pt-2 border-t border-lafftale-gold/20">
                                  {selectedCharacter.equipment.armor.bonuses.map((bonus, i) => (
                                    <div key={i} className="text-sm text-green-400">{bonus}</div>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {selectedCharacter.equipment.weapon && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 cursor-pointer hover:bg-lafftale-dark/70">
                                <h4 className="font-bold mb-1">Weapon</h4>
                                <div className={`${getRarityColorClass(selectedCharacter.equipment.weapon.rarity)}`}>
                                  {selectedCharacter.equipment.weapon.name} (Lv. {selectedCharacter.equipment.weapon.level})
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-lafftale-darkgray border border-lafftale-gold/50 p-3 w-64">
                              <div className="space-y-2">
                                <div className={`font-bold text-base ${getRarityColorClass(selectedCharacter.equipment.weapon.rarity)}`}>
                                  {selectedCharacter.equipment.weapon.name} (Lv. {selectedCharacter.equipment.weapon.level})
                                </div>
                                <div className="text-xs text-lafftale-bronze capitalize">{selectedCharacter.equipment.weapon.rarity}</div>
                                <div className="pt-2 border-t border-lafftale-gold/20">
                                  {selectedCharacter.equipment.weapon.bonuses.map((bonus, i) => (
                                    <div key={i} className="text-sm text-green-400">{bonus}</div>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        
                        {selectedCharacter.equipment.shield && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="p-4 bg-lafftale-dark/50 rounded-lg border border-lafftale-gold/20 cursor-pointer hover:bg-lafftale-dark/70">
                                <h4 className="font-bold mb-1">Shield</h4>
                                <div className={`${getRarityColorClass(selectedCharacter.equipment.shield.rarity)}`}>
                                  {selectedCharacter.equipment.shield.name} (Lv. {selectedCharacter.equipment.shield.level})
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-lafftale-darkgray border border-lafftale-gold/50 p-3 w-64">
                              <div className="space-y-2">
                                <div className={`font-bold text-base ${getRarityColorClass(selectedCharacter.equipment.shield.rarity)}`}>
                                  {selectedCharacter.equipment.shield.name} (Lv. {selectedCharacter.equipment.shield.level})
                                </div>
                                <div className="text-xs text-lafftale-bronze capitalize">{selectedCharacter.equipment.shield.rarity}</div>
                                <div className="pt-2 border-t border-lafftale-gold/20">
                                  {selectedCharacter.equipment.shield.bonuses.map((bonus, i) => (
                                    <div key={i} className="text-sm text-green-400">{bonus}</div>
                                  ))}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 text-gray-400">
            No game accounts found. Create a game account first.
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterOverview;
