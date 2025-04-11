import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, PlusCircle, Eye } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { DialogDescription } from "@/components/ui/dialog";

interface Ticket {
  Id: number;
  Subject: string;
  Status: "open" | "closed";
  Priority: "low" | "normal" | "high";
  CreatedAt: string;
}

interface TicketMessage {
  Id: number;
  TicketId: number;
  SenderId: number;
  Message: string;
  SentAt: string;
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(false);

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
        setOpenNewModal(false);
        fetchTickets();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast({ title: "Fehler", description: "Ticket konnte nicht erstellt werden", variant: "destructive" });
    }
  };

  const fetchTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOpenDetailModal(true);
    setLoadingDetails(true);

    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/user_tickets/${ticket.Id}`);
      if (!res.ok) throw new Error("Fehler beim Laden");
      const data = await res.json();
      setMessages(data.Messages || []);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;

    try {
      await fetchWithAuth(`http://localhost:3000/api/user_tickets/${selectedTicket.Id}/message`, {
        method: "POST",
        body: JSON.stringify({ message: reply })
      });
      setReply("");
      fetchTicketDetails(selectedTicket);
    } catch {
      toast({ title: "Fehler", description: "Antwort konnte nicht gesendet werden", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-lafftale-gold">Support Tickets</h2>
        <Button onClick={() => setOpenNewModal(true)} className="flex items-center gap-2">
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
                <th className="p-3 text-center">Details</th>
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
                  <td className="p-3 text-center">
                    <Button size="sm" variant="outline" onClick={() => fetchTicketDetails(ticket)}>
                      <Eye size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal: Neues Ticket */}
      <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
        <DialogContent className="bg-lafftale-darkgray border border-lafftale-gold/20 text-gray-300">
        <DialogHeader>
          <DialogTitle className="text-lafftale-gold">Neues Ticket erstellen</DialogTitle>
          <DialogDescription>
              Bitte gib einen aussagekräftigen Betreff und deine Nachricht ein.
          </DialogDescription>
        </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Betreff" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea placeholder="Nachricht" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            <div className="flex gap-4 text-sm">
              {["low", "normal", "high"].map((lvl) => (
                <label key={lvl}>
                  <input
                    type="radio"
                    value={lvl}
                    checked={priority === lvl}
                    onChange={() => setPriority(lvl as "low" | "normal" | "high")}
                  />{" "}
                  {lvl}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button onClick={handleCreateTicket} className="btn-primary">Absenden</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ticket Details */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className="max-w-2xl bg-lafftale-darkgray border-lafftale-gold/20 text-gray-300">
        <DialogHeader>
          <DialogTitle className="text-lafftale-gold">
              Ticket #{selectedTicket?.Id} – {selectedTicket?.Subject}
          </DialogTitle>
          <DialogDescription>
            Hier siehst du den bisherigen Verlauf und kannst auf das Ticket antworten.
          </DialogDescription>
        </DialogHeader>
          {loadingDetails ? (
            <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
          ) : (
            <>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.Id} className="border-t pt-2 text-sm">
                    <p>{msg.Message}</p>
                    <p className="text-xs text-gray-500">
                      Gesendet am {new Date(msg.SentAt).toLocaleString()} von User {msg.SenderId}
                    </p>
                  </div>
                ))}
              </div>

              {selectedTicket?.Status !== "closed" && (
                <>
                  <Textarea
                    placeholder="Antwort eingeben..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="mt-4"
                  />
                  <DialogFooter className="mt-2">
                    <Button className="btn-primary" onClick={sendReply}>Antwort senden</Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupportTickets;
