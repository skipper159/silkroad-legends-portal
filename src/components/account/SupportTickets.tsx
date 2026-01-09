import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Loader2, PlusCircle, Eye } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { DialogDescription } from '@/components/ui/dialog';

interface Ticket {
  Id: number;
  Subject: string;
  Status: 'open' | 'closed';
  Priority: 'low' | 'normal' | 'high';
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

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [openNewModal, setOpenNewModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);

  const toggleExpand = (id: number) => {
    setExpandedMessages((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
  };

  const { toast } = useToast();

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth(`${weburl}/api/user_tickets/my`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch {
      toast({ title: 'Error', description: 'Could not load tickets', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !message.trim()) return;

    try {
      const res = await fetchWithAuth(`${weburl}/api/user_tickets`, {
        method: 'POST',
        body: JSON.stringify({ subject, message, priority }),
      });

      if (res.ok) {
        toast({ title: 'Ticket created', description: 'Support will answer shortly.' });
        setSubject('');
        setMessage('');
        setOpenNewModal(false);
        fetchTickets();
      } else {
        throw new Error();
      }
    } catch {
      toast({ title: 'Error', description: 'Only one open ticket allowed', variant: 'destructive' });
    }
  };

  const fetchTicketDetails = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setOpenDetailModal(true);
    setLoadingDetails(true);

    try {
      const res = await fetchWithAuth(`${weburl}/api/user_tickets/${ticket.Id}`);
      if (!res.ok) throw new Error('Fail to load ticket');
      const data = await res.json();
      setMessages(data.Messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;

    try {
      await fetchWithAuth(`${weburl}/api/user_tickets/${selectedTicket.Id}/message`, {
        method: 'POST',
        body: JSON.stringify({ message: reply }),
      });
      setReply('');
      fetchTicketDetails(selectedTicket);
    } catch {
      toast({ title: 'Error', description: 'Could not send answer', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-xl font-bold text-theme-primary'>Support Tickets</h2>
        <Button
          onClick={() => setOpenNewModal(true)}
          className='flex items-center gap-2 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
        >
          <PlusCircle size={16} />
          New Ticket
        </Button>
      </div>

      {loading ? (
        <div className='flex justify-center py-6 text-theme-primary'>
          <Loader2 className='animate-spin mr-2' />
          Loading tickets...
        </div>
      ) : (
        <Card className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm text-theme-text-muted'>
            <thead className='bg-theme-surface/80 text-theme-primary uppercase'>
              <tr>
                <th className='p-3'>Subject</th>
                <th className='p-3'>Priority</th>
                <th className='p-3'>Status</th>
                <th className='p-3'>Created</th>
                <th className='p-3 text-center'>Details</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket.Id} className='border-b border-theme-primary/10 hover:bg-theme-surface/20'>
                    <td className='p-3'>{ticket.Subject}</td>
                    <td className='p-3 font-semibold'>
                      <span
                        className={
                          ticket.Priority === 'high'
                            ? 'text-red-400'
                            : ticket.Priority === 'normal'
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }
                      >
                        {ticket.Priority}
                      </span>
                    </td>
                    <td className='p-3'>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          ticket.Status === 'open'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-theme-surface text-theme-text-muted border border-theme-border'
                        }`}
                      >
                        {ticket.Status}
                      </span>
                    </td>
                    <td className='p-3'>{new Date(ticket.CreatedAt).toLocaleString()}</td>
                    <td className='p-3 text-center'>
                      <Button size='sm' variant='outline' onClick={() => fetchTicketDetails(ticket)}>
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className='p-8 text-center text-theme-text-muted'>
                    <div className='space-y-2'>
                      <div>No support tickets found</div>
                      <div className='text-sm'>Create your first ticket if you need help!</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal: Create Ticket */}
      <Dialog open={openNewModal} onOpenChange={setOpenNewModal}>
        <DialogContent className='bg-theme-surface border border-theme-primary/20 text-theme-text-muted'>
          <DialogHeader>
            <DialogTitle className='text-theme-primary'>Create new Ticket</DialogTitle>
            <DialogDescription>Please describe your issue. One open ticket at a time is allowed.</DialogDescription>
          </DialogHeader>
          <div className='space-y-4'>
            <Input placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea
              placeholder='Your message...'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <div className='flex gap-4 text-sm'>
              {['low', 'normal', 'high'].map((lvl) => (
                <label key={lvl}>
                  <input
                    type='radio'
                    value={lvl}
                    checked={priority === lvl}
                    onChange={() => setPriority(lvl as 'low' | 'normal' | 'high')}
                  />{' '}
                  {lvl}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter className='mt-4'>
            <Button onClick={handleCreateTicket} className='btn-primary'>
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Ticket Details */}
      <Dialog open={openDetailModal} onOpenChange={setOpenDetailModal}>
        <DialogContent className='max-w-2xl bg-theme-surface border-theme-primary/20 text-theme-text-muted'>
          <DialogHeader>
            <DialogTitle className='text-theme-primary'>
              Ticket #{selectedTicket?.Id} – {selectedTicket?.Subject}
            </DialogTitle>
            <DialogDescription>Below is your conversation history.</DialogDescription>
          </DialogHeader>
          {loadingDetails ? (
            <div className='flex justify-center py-6'>
              <Loader2 className='animate-spin' />
            </div>
          ) : (
            <>
              <div className='space-y-3 max-h-[70vh] overflow-y-auto'>
                {messages.map((msg) => {
                  const isExpanded = expandedMessages.includes(msg.Id);
                  const shortText = msg.Message.slice(0, MAX_PREVIEW_LENGTH);

                  return (
                    <div
                      key={msg.Id}
                      className={`p-3 rounded text-sm w-fit max-w-[85%] ${
                        msg.IsFromStaff
                          ? 'ml-auto bg-theme-primary/20 text-theme-primary text-right border border-theme-primary/30'
                          : 'mr-auto bg-theme-surface text-theme-text text-left border border-theme-border'
                      }`}
                    >
                      <div className='text-xs mb-1 text-theme-primary'>
                        {msg.SenderName} • {new Date(msg.SentAt).toLocaleString()}
                      </div>
                      <div>
                        {msg.Message.length <= MAX_PREVIEW_LENGTH ? (
                          msg.Message
                        ) : isExpanded ? (
                          <>
                            {msg.Message}
                            <Button variant='link' className='text-xs p-0 ml-2' onClick={() => toggleExpand(msg.Id)}>
                              Read less
                            </Button>
                          </>
                        ) : (
                          <>
                            {shortText}...
                            <Button variant='link' className='text-xs p-0 ml-2' onClick={() => toggleExpand(msg.Id)}>
                              Read more
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTicket?.Status !== 'closed' && (
                <>
                  <Textarea
                    placeholder='Write a reply...'
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className='mt-4'
                  />
                  <DialogFooter className='mt-2'>
                    <Button className='btn-primary' onClick={sendReply}>
                      Reply
                    </Button>
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
