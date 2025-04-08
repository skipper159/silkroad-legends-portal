
import { Crown, Users, Castle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Mock server data
const serverData = {
  topPlayer: {
    name: "AncientSage",
    class: "Shaman",
    level: 120,
    avatar: "S"
  },
  topGuild: {
    name: "Obsidian Brotherhood",
    activityPoints: 12750,
    emblem: "O"
  },
  fortressOwner: {
    guild: "Dragon Dynasty",
    fortress: "Jangan Fortress",
    timeHeld: "5 days"
  },
  playersOnline: 237
};

const ServerOverview = () => {
  return (
    <section className="py-16 bg-lafftale-dark/90">
      <div className="container mx-auto px-4">
        <h2 className="decorated-heading text-3xl md:text-4xl text-center mb-12">Server Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Top Player Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-darkred flex items-center justify-center text-lafftale-gold text-xl font-bold mr-4">
                {serverData.topPlayer.avatar}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Trophy size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Top Player</h4>
                </div>
                <p className="font-bold text-lafftale-beige">{serverData.topPlayer.name}</p>
                <div className="text-sm text-gray-400">
                  <span>Level {serverData.topPlayer.level}</span>
                  <span className="mx-1">•</span>
                  <span>{serverData.topPlayer.class}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Top Guild Card */}
          <div className="card border-lafftale-gold/30 hover:border-lafftale-gold/60 transition-all">
            <div className="flex items-start">
              <div className="w-12 h-12 rounded-full bg-lafftale-darkred flex items-center justify-center text-lafftale-gold text-xl font-bold mr-4">
                {serverData.topGuild.emblem}
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <Crown size={16} className="text-lafftale-gold mr-2" />
                  <h4 className="text-lafftale-gold text-lg">Top Guild</h4>
                </div>
                <p className="font-bold text-lafftale-beige">{serverData.topGuild.name}</p>
                <div className="text-sm text-gray-400">
                  <span>{serverData.topGuild.activityPoints.toLocaleString()} Activity Points</span>
                </div>
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
                <p className="font-bold text-lafftale-beige">{serverData.fortressOwner.guild}</p>
                <div className="text-sm text-gray-400">
                  <span>{serverData.fortressOwner.fortress}</span>
                  <span className="mx-1">•</span>
                  <span>Held for {serverData.fortressOwner.timeHeld}</span>
                </div>
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
                  {serverData.playersOnline}
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
