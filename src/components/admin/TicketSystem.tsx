import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Eye, XCircle } from "lucide-react";
import { fetchWithAuth, weburl } from "@/lib/api";


interface Ticket {
  Id: number;
  UserId: number;
  Subject: string;
  Username: string;
  Priority: "low" | "normal" | "high";
  Status: "open" | "closed";
  CreatedAt: string;
}

interface TicketMessage {
  Id: number;
  TicketId: number;
  SenderId: number;
  SenderName: string;
  Message: string;
  SentAt: string;
  IsFromStaff: boolean;
}

const MAX_PREVIEW_LENGTH = 500;

const TicketSystem = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedMessages((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/open`);
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const data = await res.json();
      setTickets(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await fetchWithAuth(`${weburl}/api/user_tickets/${ticket.Id}`);
      if (!res.ok) throw new Error("Failed to fetch ticket messages");
      const data = await res.json();
      setMessages(data.Messages || []);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeTicket = async (id: number) => {
    await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/${id}/close`, {
      method: "PUT"
    });
    fetchTickets();
    if (selectedTicket?.Id === id) {
      setModalOpen(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    await fetchWithAuth(`${weburl}/api/user_tickets/${selectedTicket?.Id}/message`, {
      method: "POST",
      body: JSON.stringify({ message: reply })
    });
    setReply("");
    fetchTicketMessages(selectedTicket!);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-10 text-lafftale-gold"><Loader2 className="animate-spin mr-2" />Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">Error: {error}</div>;
  }

  return (
    <>
      <Card className="overflow-x-auto border-lafftale-gold/30">
        <table className="min-w-full text-left text-sm text-gray-300">
          <thead className="bg-lafftale-darkgray text-lafftale-gold uppercase">
            <tr>
              <th className="p-3">Ticket</th>
              <th className="p-3">Username</th>
              <th className="p-3">Subject</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.Id}
                className={`border-b border-lafftale-gold/30 hover:bg-lafftale-dark/20 ${
                  ticket.Status === "closed" ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                <td className="p-3">{ticket.Id}</td>
                <td className="p-3">{ticket.Username || "Unknown"}</td>
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
                <td className="p-3">{new Date(ticket.CreatedAt).toLocaleString()}</td>
                <td className="p-3 flex justify-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => fetchTicketMessages(ticket)}>
                    <Eye size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => closeTicket(ticket.Id)}>
                    <XCircle size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table> 
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-lafftale-darkgray border-lafftale-gold/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-lafftale-gold">
              Ticket #{selectedTicket?.Id} – {selectedTicket?.Subject}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Here you can view ticket details and reply.
            </DialogDescription>
          </DialogHeader>

          {loadingDetails ? (
          <div className="flex justify-center py-6"><Loader2 className="animate-spin" /></div>
          ) : (
            <>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {messages.map((msg) => {
                  const isExpanded = expandedMessages.includes(msg.Id);
                  const shortText = msg.Message.slice(0, MAX_PREVIEW_LENGTH);

                  return (
                    <div
                      key={msg.Id}
                      className={`p-3 rounded text-sm w-fit max-w-[85%] ${
                        msg.IsFromStaff
                          ? "ml-auto bg-yellow-100 text-yellow-900 text-right"
                          : "mr-auto bg-gray-800 text-white text-left"
                      }`}
                    >
                      <div className="text-xs mb-1 text-lafftale-gold">
                        {msg.SenderName} • {new Date(msg.SentAt).toLocaleString()}
                      </div>
                      <div>
                        {msg.Message.length <= MAX_PREVIEW_LENGTH ? (
                          msg.Message
                        ) : isExpanded ? (
                          <>
                            {msg.Message}
                            <Button variant="link" className="text-xs p-0 ml-2" onClick={() => toggleExpand(msg.Id)}>Read less</Button>
                          </>
                        ) : (
                          <>
                            {shortText}...
                            <Button variant="link" className="text-xs p-0 ml-2" onClick={() => toggleExpand(msg.Id)}>Read more</Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTicket?.Status !== "closed" && (
                <>
                  <Textarea
                    placeholder="Type a reply..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="mt-4"
                  />
                  <DialogFooter className="flex justify-between mt-2">
                    <Button variant="destructive" onClick={() => closeTicket(selectedTicket!.Id)}>
                      Close Ticket
                    </Button>
                    <Button className="btn-primary" onClick={sendReply}>Send Reply</Button>
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

export default TicketSystem;
