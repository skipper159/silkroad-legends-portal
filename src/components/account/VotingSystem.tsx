import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, ExternalLink, Clock, Check, Coins } from "lucide-react";

interface VotingSite {
  id: string;
  name: string;
  logo: string;
  cooldown: boolean;
  lastVoted: string | null;
  reward: number;
}

const VotingSystem = () => {
  // Mock voting sites data
  const [votingSites, setVotingSites] = useState<VotingSite[]>([
    { 
      id: "xtremetop100", 
      name: "XTREMETOP100", 
      logo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200", 
      cooldown: false, 
      lastVoted: null,
      reward: 3
    },
    { 
      id: "arena", 
      name: "ARENA-TOP100", 
      logo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200", 
      cooldown: true, 
      lastVoted: "2025-04-09T10:30:00",
      reward: 3
    },
    { 
      id: "gtop100", 
      name: "GTOP100", 
      logo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200", 
      cooldown: false, 
      lastVoted: null,
      reward: 3
    },
    { 
      id: "topg", 
      name: "TOPG", 
      logo: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=200", 
      cooldown: false, 
      lastVoted: null,
      reward: 3
    }
  ]);

  const [recentVotes] = useState([
    { id: 1, site: "XTREMETOP100", date: "April 8, 2025", reward: 3 },
    { id: 2, site: "ARENA-TOP100", date: "April 7, 2025", reward: 3 },
    { id: 3, site: "GTOP100", date: "April 6, 2025", reward: 3 },
  ]);

  // Mock function to handle voting
  const handleVote = (siteId: string) => {
    console.log(`Voting for ${siteId}`);
    setVotingSites(prevSites => 
      prevSites.map(site => 
        site.id === siteId 
          ? { 
              ...site, 
              cooldown: true, 
              lastVoted: new Date().toISOString() 
            } 
          : site
      )
    );
  };

  // Calculate remaining time for cooldown (mock function)
  const getRemainingTime = (lastVoted: string) => {
    return "23h 45m"; // Placeholder for calculation
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold font-cinzel text-lafftale-gold">Voting</h3>
        <div className="flex items-center gap-2">
          <Vote size={18} className="text-lafftale-gold" />
          <span className="text-gray-300">Support our server and earn rewards</span>
        </div>
      </div>
      
      {/* Voting Sites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {votingSites.map(site => (
          <Card key={site.id} className="bg-lafftale-darkgray border border-lafftale-gold/30 overflow-hidden">
            <div className="h-16 bg-cover bg-center" style={{ backgroundImage: `url(${site.logo})` }}>
              <div className="w-full h-full bg-gradient-to-t from-lafftale-darkgray to-transparent"></div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lafftale-gold font-cinzel text-xl flex justify-between items-center">
                {site.name}
                <Badge variant="outline" className="bg-lafftale-gold/10 text-lafftale-gold border-lafftale-gold/30">
                  +{site.reward} <Coins size={12} className="ml-1" />
                </Badge>
              </CardTitle>
              <CardDescription>
                {site.cooldown ? (
                  <span className="flex items-center text-gray-400">
                    <Clock size={14} className="mr-1" /> Cooldown: {getRemainingTime(site.lastVoted!)}
                  </span>
                ) : (
                  <span className="flex items-center text-green-400">
                    <Check size={14} className="mr-1" /> Ready to vote
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className={`w-full ${!site.cooldown ? 'btn-outline' : 'opacity-50 cursor-not-allowed bg-lafftale-darkgray'}`}
                disabled={site.cooldown}
                onClick={() => !site.cooldown && handleVote(site.id)}
              >
                <ExternalLink size={16} className="mr-2" /> Vote Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent Voting History */}
      <div className="mt-8">
        <h4 className="text-xl font-cinzel text-lafftale-gold mb-4">Recent Voting Rewards</h4>
        <div className="bg-lafftale-darkgray border border-lafftale-gold/30 rounded-lg p-4">
          {recentVotes.length > 0 ? (
            <div className="divide-y divide-lafftale-gold/10">
              {recentVotes.map(vote => (
                <div key={vote.id} className="flex justify-between items-center py-3">
                  <div className="flex items-center">
                    <Vote size={16} className="text-lafftale-gold mr-3" />
                    <div>
                      <p className="text-gray-200">{vote.site}</p>
                      <p className="text-xs text-gray-400">{vote.date}</p>
                    </div>
                  </div>
                  <Badge className="bg-lafftale-gold/20 text-lafftale-gold border border-lafftale-gold/30">
                    +{vote.reward} <Coins size={12} className="ml-1" />
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400">
              <p>No recent voting history.</p>
              <p className="text-sm mt-2">Vote on any of the sites above to earn Silk!</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-lafftale-darkgray/50 border border-lafftale-gold/20 rounded-md">
        <h5 className="font-cinzel text-lafftale-gold text-lg mb-2">How Voting Works</h5>
        <p className="text-sm text-gray-300">
          Support our server by voting on popular MMO listing sites. Each vote helps us grow and rewards you with Silk, which can be used in our SilkMall.
        </p>
        <ul className="text-sm text-gray-300 list-disc list-inside mt-2">
          <li>Each vote rewards you with 3 Silk</li>
          <li>You can vote once per site every 24 hours</li>
          <li>Rewards are credited instantly to your account</li>
        </ul>
      </div>
    </div>
  );
};

export default VotingSystem;
