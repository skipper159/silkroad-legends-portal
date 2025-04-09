
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Ban, Clock, Info } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

// Mock data for game accounts
const mockGameAccounts = Array(60).fill(null).map((_, i) => ({
  id: i + 1,
  gameAccountId: `GA${1000 + i}`,
  playerNameId: `Player${2000 + i}`,
  guildId: i % 5 === 0 ? null : `Guild${500 + Math.floor(i / 3)}`,
  jobTitle: ["Warrior", "Mage", "Cleric", "Rogue", "Hunter"][i % 5],
  jobNameId: `Job${100 + (i % 5)}`
}));

const GameAccountsList = () => {
  const [accounts] = useState(mockGameAccounts);
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 50;
  
  const indexOfLastAccount = currentPage * accountsPerPage;
  const indexOfFirstAccount = indexOfLastAccount - accountsPerPage;
  const currentAccounts = accounts.slice(indexOfFirstAccount, indexOfLastAccount);
  
  const totalPages = Math.ceil(accounts.length / accountsPerPage);

  return (
    <div>
      <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Game Accounts</h2>
      
      {accounts.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-lafftale-dark">
                <TableRow className="border-b border-lafftale-gold/20">
                  <TableHead className="text-lafftale-gold">Game Account ID</TableHead>
                  <TableHead className="text-lafftale-gold">Player Name ID</TableHead>
                  <TableHead className="text-lafftale-gold">Guild ID</TableHead>
                  <TableHead className="text-lafftale-gold">Job Title</TableHead>
                  <TableHead className="text-lafftale-gold">Job Name ID</TableHead>
                  <TableHead className="text-lafftale-gold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAccounts.map((account) => (
                  <TableRow key={account.id} className="border-b border-lafftale-gold/20 hover:bg-lafftale-dark/40">
                    <TableCell className="font-medium">{account.gameAccountId}</TableCell>
                    <TableCell>{account.playerNameId}</TableCell>
                    <TableCell>{account.guildId || 'N/A'}</TableCell>
                    <TableCell>{account.jobTitle}</TableCell>
                    <TableCell>{account.jobNameId}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-lafftale-darkred text-lafftale-darkred hover:bg-lafftale-darkred hover:text-white"
                        >
                          <Ban size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white"
                        >
                          <Clock size={16} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-lafftale-gold text-lafftale-gold hover:bg-lafftale-gold hover:text-lafftale-dark"
                        >
                          <Info size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink 
                    isActive={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <p>No game accounts found.</p>
        </div>
      )}
    </div>
  );
};

export default GameAccountsList;
