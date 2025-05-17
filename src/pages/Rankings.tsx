import { useState } from "react";
import { Trophy, Users, Gem, Sword, CoinsIcon, Crosshair, Shield, Swords, Gamepad2, Skull, Flag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const Rankings = () => {
  const [activeTab, setActiveTab] = useState("players");
  const [activeRankingType, setActiveRankingType] = useState("player");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Top Player");

  const dropdownOptions = activeRankingType === "player" 
    ? ["Top Player", "Top Guild", "Unique", "Thief", "Trader", "Hunter"]
    : ["Last Man Standing", "PVP", "Battle Arena", "Survival Arena", "Capture the Flag"];

  // Placeholder data for player rankings
  const playersData = Array(25).fill(0).map((_, i) => ({
    rank: i + 1,
    name: `Player${i + 1}`,
    level: 100 - (i * 2),
    class: ["Hunter", "Thief", "Trader"][Math.floor(Math.random() * 3)],
    guild: ["DragonSlayers", "NightWatch", "SilkElite", "MoonGuard", "None"][Math.floor(Math.random() * 5)],
    killCount: Math.floor(Math.random() * 1000)
  }));

  const filteredPlayersData = playersData.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Placeholder data for event rankings
  const eventData = Array(25).fill(0).map((_, i) => ({
    rank: i + 1,
    name: `Player${i + 1}`,
    level: 100 - (i * 2),
    class: ["Hunter", "Thief", "Trader"][Math.floor(Math.random() * 3)],
    wins: Math.floor(Math.random() * 50),
    points: Math.floor(Math.random() * 5000)
  }));

  const filteredEventData = eventData.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        <div className="py-20 bg-header2-bg bg-cover bg-top">
          <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ranking <span className="text-lafftale-bronze font-cinzel text-4xl font-bold">Lafftale</span>
            </h1>
          </div>
        </div>
        <hr></hr>
        <div className="container mx-auto py-10">
        
        <Card className="bg-lafftale-darkgray border-lafftale-gold/30 shadow-lg">
          <CardHeader className="border-b border-lafftale-gold/20 pb-4 flex flex-col sm:flex-row items-center justify-between">
            <Button 
              variant={activeRankingType === "player" ? "default" : "outline"} 
              className={`mb-2 sm:mb-0 ${activeRankingType === "player" ? "bg-lafftale-gold text-lafftale-dark" : "text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10"}`}
              onClick={() => setActiveRankingType("player")}
            >
              Player Ranking
            </Button>
            
            <CardTitle className="text-2xl text-center">Lafftale Champions</CardTitle>
            
            <Button 
              variant={activeRankingType === "event" ? "default" : "outline"} 
              className={`mt-2 sm:mt-0 ${activeRankingType === "event" ? "bg-lafftale-gold text-lafftale-dark" : "text-lafftale-gold border-lafftale-gold/50 hover:bg-lafftale-gold/10"}`}
              onClick={() => setActiveRankingType("event")}
            >
              Event Ranking
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-center gap-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-1/3 p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
              />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-1/3 p-2 border border-lafftale-gold/20 rounded bg-lafftale-dark text-lafftale-gold focus:ring-2 focus:ring-lafftale-gold focus:outline-none"
              >
                {dropdownOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {activeRankingType === "player" ? (
              <Tabs defaultValue="players" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full bg-lafftale-dark p-2 rounded-lg border border-lafftale-gold/20">
                  <TabsTrigger 
                    value="players" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Trophy size={16} /> Top Player
                  </TabsTrigger>
                  <TabsTrigger 
                    value="guilds" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Users size={16} /> Top Guild
                  </TabsTrigger>
                  <TabsTrigger 
                    value="unique" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Gem size={16} /> Unique
                  </TabsTrigger>
                  <TabsTrigger 
                    value="thief" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Sword size={16} /> Thief
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trader" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <CoinsIcon size={16} /> Trader
                  </TabsTrigger>
                  <TabsTrigger 
                    value="hunter" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Crosshair size={16} /> Hunter
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Job</TableHead>
                        <TableHead className="text-lafftale-gold hidden lg:table-cell">Guild</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Item Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlayersData.map((player) => (
                        <TableRow 
                          key={player.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${player.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {player.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                player.rank === 1 ? 'bg-yellow-500' : 
                                player.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {player.rank}
                              </span>
                            ) : (
                              player.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{player.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{player.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{player.class}</TableCell>
                          <TableCell className="hidden lg:table-cell">{player.guild}</TableCell>
                          <TableCell className="text-right">{player.killCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Tabs>
            ) : (
              <Tabs defaultValue="lastman" className="mb-6">
                <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 w-full bg-lafftale-dark p-2 rounded-lg border border-lafftale-gold/20">
                  <TabsTrigger 
                    value="lastman" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Skull size={16} /> Last Man Standing
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pvp" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Swords size={16} /> PVP
                  </TabsTrigger>
                  <TabsTrigger 
                    value="battlearena" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Shield size={16} /> Battle Arena
                  </TabsTrigger>
                  <TabsTrigger 
                    value="survival" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Gamepad2 size={16} /> Survival Arena
                  </TabsTrigger>
                  <TabsTrigger 
                    value="captureflag" 
                    className="flex items-center gap-2 data-[state=active]:bg-lafftale-gold data-[state=active]:text-lafftale-dark"
                  >
                    <Flag size={16} /> Capture the Flag
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="lastman">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Class</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Wins</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventData.map((event) => (
                        <TableRow 
                          key={event.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${event.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {event.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                event.rank === 1 ? 'bg-yellow-500' : 
                                event.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {event.rank}
                              </span>
                            ) : (
                              event.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{event.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.class}</TableCell>
                          <TableCell className="text-right">{event.wins}</TableCell>
                          <TableCell className="text-right">{event.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="pvp">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Class</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Wins</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventData.map((event) => (
                        <TableRow 
                          key={event.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${event.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {event.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                event.rank === 1 ? 'bg-yellow-500' : 
                                event.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {event.rank}
                              </span>
                            ) : (
                              event.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{event.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.class}</TableCell>
                          <TableCell className="text-right">{event.wins}</TableCell>
                          <TableCell className="text-right">{event.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="battlearena">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Class</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Wins</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventData.map((event) => (
                        <TableRow 
                          key={event.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${event.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {event.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                event.rank === 1 ? 'bg-yellow-500' : 
                                event.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {event.rank}
                              </span>
                            ) : (
                              event.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{event.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.class}</TableCell>
                          <TableCell className="text-right">{event.wins}</TableCell>
                          <TableCell className="text-right">{event.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="survival">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Class</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Wins</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventData.map((event) => (
                        <TableRow 
                          key={event.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${event.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {event.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                event.rank === 1 ? 'bg-yellow-500' : 
                                event.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {event.rank}
                              </span>
                            ) : (
                              event.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{event.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.class}</TableCell>
                          <TableCell className="text-right">{event.wins}</TableCell>
                          <TableCell className="text-right">{event.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="captureflag">
                  <Table>
                    <TableCaption>Showing results 1-25 of 100</TableCaption>
                    <TableHeader>
                      <TableRow className="border-b border-lafftale-gold/30">
                        <TableHead className="text-lafftale-gold w-16 text-center">#</TableHead>
                        <TableHead className="text-lafftale-gold">Name</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Level</TableHead>
                        <TableHead className="text-lafftale-gold hidden md:table-cell">Class</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Wins</TableHead>
                        <TableHead className="text-lafftale-gold text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEventData.map((event) => (
                        <TableRow 
                          key={event.rank} 
                          className={`border-b border-lafftale-gold/10 hover:bg-lafftale-gold/5 ${event.rank <= 3 ? 'bg-lafftale-gold/10' : ''}`}
                        >
                          <TableCell className="font-medium text-center">
                            {event.rank <= 3 ? (
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
                                event.rank === 1 ? 'bg-yellow-500' : 
                                event.rank === 2 ? 'bg-gray-400' : 
                                'bg-amber-700'
                              } text-black font-bold`}>
                                {event.rank}
                              </span>
                            ) : (
                              event.rank
                            )}
                          </TableCell>
                          <TableCell className="font-medium text-lafftale-gold">{event.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.level}</TableCell>
                          <TableCell className="hidden md:table-cell">{event.class}</TableCell>
                          <TableCell className="text-right">{event.wins}</TableCell>
                          <TableCell className="text-right">{event.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            )}
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className="text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="bg-lafftale-gold text-lafftale-dark">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" className="text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis className="text-lafftale-gold" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" className="text-lafftale-gold hover:text-lafftale-bronze hover:bg-lafftale-gold/10" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
        </div>
      </main>
      
      <Footer />
    </div>
    
  );
};

export default Rankings;
