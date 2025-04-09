
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Mock data for tickets
const mockTickets = [
  { 
    id: 101, 
    createdAt: "2025-04-01T10:15:00", 
    username: "DragonSlayer99", 
    subject: "Missing item after server crash", 
    status: "open" 
  },
  { 
    id: 102, 
    createdAt: "2025-04-02T15:30:00", 
    username: "SilkWarrior", 
    subject: "Guild creation problems", 
    status: "answered" 
  },
  { 
    id: 103, 
    createdAt: "2025-04-03T09:45:00", 
    username: "MagicCaster42", 
    subject: "Skill points reset needed", 
    status: "closed" 
  },
  { 
    id: 104, 
    createdAt: "2025-04-04T14:20:00", 
    username: "RogueNinja", 
    subject: "Account security concern", 
    status: "open" 
  }
];

// Mock data for ticket messages
const mockTicketMessages = {
  101: [
    { id: 1, message: "My item disappeared after the server crashed. Can you help me recover it?", isAdmin: false, sentAt: "2025-04-01T10:15:00" }
  ],
  102: [
    { id: 1, message: "I can't create a guild even though I have enough gold and requirements.", isAdmin: false, sentAt: "2025-04-02T15:30:00" },
    { id: 2, message: "Please make sure you have at least 3 guild members online and 1,000,000 gold.", isAdmin: true, sentAt: "2025-04-02T16:15:00" }
  ],
  103: [
    { id: 1, message: "I accidentally allocated my skill points wrong. Can I get a reset?", isAdmin: false, sentAt: "2025-04-03T09:45:00" },
    { id: 2, message: "Yes, we can do that. Please log in tomorrow at 10:00 server time.", isAdmin: true, sentAt: "2025-04-03T10:30:00" },
    { id: 3, message: "Thank you! I'll be online at that time.", isAdmin: false, sentAt: "2025-04-03T11:15:00" }
  ],
  104: [
    { id: 1, message: "I think someone tried to access my account yesterday. Can you check the logs?", isAdmin: false, sentAt: "2025-04-04T14:20:00" }
  ]
};

const TicketSystem = () => {
  const [tickets, setTickets] = useState(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [reply, setReply] = useState("");
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${formatDistanceToNow(date, { addSuffix: true })} (${date.toLocaleDateString()})`;
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "open":
        return <Badge variant="default" className="bg-lafftale-darkred border-lafftale-darkred text-white">Open</Badge>;
      case "answered":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Answered</Badge>;
      case "closed":
        return <Badge variant="outline" className="border-green-500 text-green-500">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSendReply = () => {
    if (!reply.trim() || !selectedTicket) return;

    // In a real app, this would be an API call
    // For now, we'll just update our local state
    toast({
      title: "Reply sent",
      description: "Your response has been sent to the user"
    });

    // Update ticket status to "answered" if it was "open"
    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket && ticket.status === "open" 
        ? { ...ticket, status: "answered" } 
        : ticket
    ));

    setReply("");
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;

    // In a real app, this would be an API call
    // For now, we'll just update our local state
    toast({
      title: "Ticket closed",
      description: "The ticket has been marked as resolved"
    });

    setTickets(tickets.map(ticket => 
      ticket.id === selectedTicket 
        ? { ...ticket, status: "closed" } 
        : ticket
    ));

    setSelectedTicket(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold font-cinzel text-lafftale-gold mb-6">Support Tickets</h2>
      
      {tickets.length > 0 ? (
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-lafftale-dark">
              <TableRow className="border-b border-lafftale-gold/20">
                <TableHead className="text-lafftale-gold">ID</TableHead>
                <TableHead className="text-lafftale-gold">Created</TableHead>
                <TableHead className="text-lafftale-gold">Username</TableHead>
                <TableHead className="text-lafftale-gold">Subject</TableHead>
                <TableHead className="text-lafftale-gold">Status</TableHead>
                <TableHead className="text-lafftale-gold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id} className="border-b border-lafftale-gold/20 hover:bg-lafftale-dark/40">
                  <TableCell>#{ticket.id}</TableCell>
                  <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="font-medium">{ticket.username}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-lafftale-gold text-lafftale-gold hover:bg-lafftale-gold hover:text-lafftale-dark"
                      onClick={() => setSelectedTicket(ticket.id)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center p-8 text-gray-400">
          <p>No support tickets found.</p>
        </div>
      )}
      
      <Dialog open={selectedTicket !== null} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="bg-lafftale-darkgray border-lafftale-gold text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-lafftale-gold text-xl">
              Ticket #{selectedTicket} - {tickets.find(t => t.id === selectedTicket)?.subject}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Submitted by {tickets.find(t => t.id === selectedTicket)?.username} • 
              {selectedTicket && formatDate(tickets.find(t => t.id === selectedTicket)?.createdAt || "")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-80 overflow-y-auto my-4 pr-2">
            {selectedTicket && mockTicketMessages[selectedTicket as keyof typeof mockTicketMessages]?.map(msg => (
              <div 
                key={msg.id} 
                className={`p-4 rounded-lg ${msg.isAdmin 
                  ? 'bg-lafftale-gold/10 border border-lafftale-gold/20 ml-8' 
                  : 'bg-lafftale-dark/50 border border-lafftale-gold/10 mr-8'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`font-medium ${msg.isAdmin ? 'text-lafftale-gold' : 'text-white'}`}>
                    {msg.isAdmin ? 'Admin' : tickets.find(t => t.id === selectedTicket)?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(msg.sentAt)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
              </div>
            ))}
          </div>
          
          {selectedTicket && tickets.find(t => t.id === selectedTicket)?.status !== 'closed' && (
            <div className="space-y-4">
              <Textarea 
                placeholder="Type your reply here..."
                className="bg-lafftale-dark/70 border-lafftale-gold/20 min-h-[100px]"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              
              <DialogFooter className="flex justify-between items-center sm:space-x-2">
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500/20"
                  onClick={handleCloseTicket}
                >
                  Close Ticket
                </Button>
                <Button 
                  className="bg-lafftale-gold hover:bg-amber-500 text-lafftale-dark"
                  onClick={handleSendReply}
                >
                  Send Reply
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {selectedTicket && tickets.find(t => t.id === selectedTicket)?.status === 'closed' && (
            <div className="text-center p-4 text-gray-400 border border-lafftale-gold/20 rounded-lg">
              This ticket is closed. No further replies can be added.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketSystem;
