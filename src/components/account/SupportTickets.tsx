import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, PlusCircle } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  Id: number;
  Subject: string;
  Status: "open" | "closed";
  Priority: "low" | "normal" | "high";
  CreatedAt: string;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth("http://localhost:3000/api/user_tickets/my");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      toast({ title: "Fehler", description: "Konnte Tickets nicht laden", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;

    try {
      const res = await fetchWithAuth("http://localhost:3000/api/user_tickets", {
        method: "POST",
        body: JSON.stringify({ subject, message, priority })
      });

      if (res.ok) {
        toast({ title: "Ticket erstellt", description: "Support wird sich melden." });
        setSubject("");
        setMessage("");
        setOpenModal(false);
        fetchTickets();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast({ title: "Fehler", description: "Ticket konnte nicht erstellt werden", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lafftale-gold">Support Tickets</h2>
        <Button onClick={() => setOpenModal(true)} className="flex items-center gap-2">
          <PlusCircle size={16} />
          Neues Ticket
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6 text-lafftale-gold">
          <Loader2 className="animate-spin mr-2" />Lade Tickets...
        </div>
      ) : (
        <Card className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-300">
            <thead className="bg-lafftale-darkgray text-lafftale-gold uppercase">
              <tr>
                <th className="p-3">Betreff</th>
                <th className="p-3">Priorität</th>
                <th className="p-3">Status</th>
                <th className="p-3">Erstellt</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.Id} className="border-b border-lafftale-gold/10 hover:bg-lafftale-dark/20">
                  <td className="p-3">{ticket.Subject}</td>
                  <td className="p-3 font-semibold">
                    <span className={
                      ticket.Priority === "high" ? "text-red-500" :
                      ticket.Priority === "normal" ? "text-yellow-400" :
                      "text-green-400"
                    }>
                      {ticket.Priority}
                    </span>
                  </td>
                  <td className="p-3">{ticket.Status}</td>
                  <td className="p-3">{new Date(ticket.CreatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="bg-lafftale-darkgray border border-lafftale-gold/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-lafftale-gold">Neues Ticket erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Betreff"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <Textarea
              placeholder="Nachricht"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className="flex gap-4 text-sm">
              <label>
                <input
                  type="radio"
                  value="low"
                  checked={priority === "low"}
                  onChange={() => setPriority("low")}
                />{" "}
                Gering
              </label>
              <label>
                <input
                  type="radio"
                  value="normal"
                  checked={priority === "normal"}
                  onChange={() => setPriority("normal")}
                />{" "}
                Normal
              </label>
              <label>
                <input
                  type="radio"
                  value="high"
                  checked={priority === "high"}
                  onChange={() => setPriority("high")}
                />{" "}
                Hoch
              </label>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleCreateTicket} className="btn-primary">Absenden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportTickets;
