
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Character {
  id: number;
  name: string;
  level: number;
  guild: string;
  online: boolean;
  class: string;
  lastActive: string;
}

interface CharactersListProps {
  characters: Character[];
}

const CharactersList = ({ characters }: CharactersListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold mb-6">My Characters</h3>
      
      {characters.map((character) => (
        <div 
          key={character.id} 
          className="p-4 rounded-lg border border-lafftale-gold/20 bg-lafftale-darkgray/50 flex flex-col sm:flex-row justify-between"
        >
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 rounded-full bg-lafftale-dark flex items-center justify-center">
              <span className="text-lg font-bold text-lafftale-gold">
                {character.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg">{character.name}</h4>
                <Badge variant={character.online ? "default" : "outline"} className={character.online ? "bg-lafftale-darkred border-lafftale-darkred text-white" : ""}>
                  {character.online ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex gap-3 text-sm text-gray-400">
                <span>Level {character.level}</span>
                <span>•</span>
                <span>{character.class}</span>
                <span>•</span>
                <span>{character.guild}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button size="sm" variant="outline" className="btn-outline">
              Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CharactersList;
