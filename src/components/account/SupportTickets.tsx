
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Ticket {
  id: number;
  subject: string;
  status: string;
  date: string;
}

interface SupportTicketsProps {
  tickets: Ticket[];
}

const SupportTickets = ({ tickets }: SupportTicketsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Support Tickets</h3>
        <Button className="btn-primary">Create Support Ticket</Button>
      </div>
      
      {tickets.length > 0 ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="p-4 rounded-lg border border-lafftale-gold/20 bg-lafftale-darkgray/50 flex flex-col sm:flex-row justify-between"
            >
              <div>
                <h4 className="font-bold">#{ticket.id}: {ticket.subject}</h4>
                <p className="text-sm text-gray-400">Created on {ticket.date}</p>
              </div>
              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <Badge variant={ticket.status === "Open" ? "default" : "outline"} className={ticket.status === "Open" ? "bg-lafftale-darkred border-lafftale-darkred text-white" : ""}>
                  {ticket.status}
                </Badge>
                <Button size="sm" variant="outline" className="btn-outline">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">You don't have any support tickets yet.</p>
          <Button className="btn-primary">Create Your First Ticket</Button>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
