
import { useState } from "react";
import { Trophy, Users, Gem, Sword, CoinsIcon, Crosshair } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Rankings = () => {
  const [activeTab, setActiveTab] = useState("players");

  // Placeholder data for demonstration
  const playersData = Array(25).fill(0).map((_, i) => ({
    rank: i + 1,
    name: `Player${i + 1}`,
    level: 100 - (i * 2),
    class: ["Hunter", "Thief", "Trader"][Math.floor(Math.random() * 5)],
    guild: ["DragonSlayers", "NightWatch", "SilkElite", "MoonGuard", "None"][Math.floor(Math.random() * 5)],
    killCount: Math.floor(Math.random() * 1000)
  }));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 decorated-heading">
          Server Rankings
        </h1>
        
        <Card className="bg-lafftale-darkgray border-lafftale-gold/30 shadow-lg">
          <CardHeader className="border-b border-lafftale-gold/20 pb-4">
            <CardTitle className="text-2xl text-center">Lafftale Champions</CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
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
                    {playersData.map((player) => (
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
      </main>
      
      <Footer />
    </div>
  );
};

export default Rankings;
