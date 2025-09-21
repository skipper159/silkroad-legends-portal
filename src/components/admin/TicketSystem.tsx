import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Eye, XCircle, MessageCircle, RefreshCw } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Ticket {
  Id: number;
  UserId: number;
  Subject: string;
  username: string;
  Priority: 'low' | 'normal' | 'high';
  Status: 'open' | 'closed';
  CreatedAt: string;
  ClosedAt?: string;
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

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse {
  data: Ticket[];
  pagination: PaginationInfo;
}

const MAX_PREVIEW_LENGTH = 500;

const TicketSystem = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [reply, setReply] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedMessages((prev) => (prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]));
  };

  const fetchTickets = async (page = 1, status = statusFilter, search = searchTerm) => {
    try {
      setLoading(page === 1);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetchWithAuth(`${weburl}/api/admin_tickets/tickets?${params}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');

      const response: ApiResponse = await res.json();
      setTickets(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsSearching(true);
    await fetchTickets(1, statusFilter, searchTerm);
    setIsSearching(false);
  };

  const handleStatusFilter = async (status: string) => {
    setStatusFilter(status);
    await fetchTickets(1, status, searchTerm);
  };

  const fetchTicketMessages = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/${ticket.Id}`);
      if (!res.ok) throw new Error('Failed to fetch ticket messages');
      const data = await res.json();
      setMessages(data.Messages || []);
    } catch (err) {
      setMessages([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeTicket = async (id: number) => {
    try {
      await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/${id}/close`, {
        method: 'PUT',
      });
      await fetchTickets(currentPage, statusFilter, searchTerm);
      if (selectedTicket?.Id === id) {
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Error closing ticket:', err);
    }
  };

  const reopenTicket = async (id: number) => {
    try {
      await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/${id}/reopen`, {
        method: 'PUT',
      });
      await fetchTickets(currentPage, statusFilter, searchTerm);
      if (selectedTicket?.Id === id) {
        setModalOpen(false);
      }
    } catch (err) {
      console.error('Error reopening ticket:', err);
    }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    try {
      await fetchWithAuth(`${weburl}/api/admin_tickets/tickets/${selectedTicket.Id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ message: reply }),
      });
      setReply('');
      await fetchTicketMessages(selectedTicket);
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center py-10 text-lafftale-gold'>
        <Loader2 className='animate-spin mr-2' />
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className='text-red-500 text-center py-4'>Error: {error}</div>;
  }

  return (
    <>
      {/* Search and Filter Controls */}
      <div className='mb-4 flex flex-col gap-4 md:flex-row'>
        <div className='flex-1'>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder='Search by username or subject...'
            className='w-full px-3 py-2 border border-lafftale-gold/30 bg-lafftale-dark text-white rounded-md'
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className='w-40 border-lafftale-gold/30 bg-lafftale-dark text-white'>
            <SelectValue placeholder='Status' />
          </SelectTrigger>
          <SelectContent className='bg-lafftale-dark border-lafftale-gold/30'>
            <SelectItem value='all'>All Tickets</SelectItem>
            <SelectItem value='open'>Open</SelectItem>
            <SelectItem value='closed'>Closed</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className='bg-lafftale-gold text-black hover:bg-lafftale-gold/80'
        >
          {isSearching ? <Loader2 className='animate-spin' size={16} /> : 'Search'}
        </Button>
      </div>

      <Card className='overflow-x-auto border-lafftale-gold/30'>
        <table className='min-w-full text-left text-sm text-gray-300'>
          <thead className='bg-lafftale-darkgray text-lafftale-gold uppercase'>
            <tr>
              <th className='p-3'>Ticket</th>
              <th className='p-3'>Username</th>
              <th className='p-3'>Subject</th>
              <th className='p-3'>Priority</th>
              <th className='p-3'>Created</th>
              <th className='p-3 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr
                  key={ticket.Id}
                  className={`border-b border-lafftale-gold/30 hover:bg-lafftale-dark/20 ${
                    ticket.Status === 'closed' ? 'opacity-60' : ''
                  }`}
                >
                  <td className='p-3'>#{ticket.Id}</td>
                  <td className='p-3'>{ticket.username || 'Unknown'}</td>
                  <td className='p-3'>{ticket.Subject}</td>
                  <td className='p-3 font-semibold'>
                    <span
                      className={
                        ticket.Priority === 'high'
                          ? 'text-red-500'
                          : ticket.Priority === 'normal'
                          ? 'text-yellow-400'
                          : 'text-green-400'
                      }
                    >
                      {ticket.Priority.toUpperCase()}
                    </span>
                  </td>
                  <td className='p-3'>{new Date(ticket.CreatedAt).toLocaleString()}</td>
                  <td className='p-3 flex justify-center gap-2'>
                    <Button size='sm' variant='outline' onClick={() => fetchTicketMessages(ticket)}>
                      <Eye size={16} />
                    </Button>
                    <Button size='sm' variant='destructive' onClick={() => closeTicket(ticket.Id)}>
                      <XCircle size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className='p-4 text-center text-gray-400'>
                  No results found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-between bg-lafftale-darkgray p-4 rounded-lg border border-lafftale-gold/20'>
          <p className='text-sm text-gray-400'>
            Showing {(pagination.currentPage - 1) * 10 + 1} to{' '}
            {Math.min(pagination.currentPage * 10, pagination.totalCount)} of {pagination.totalCount} tickets
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(1)}
              disabled={pagination.currentPage === 1}
            >
              First
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <span className='text-sm text-gray-300 px-3'>
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className='max-w-2xl bg-lafftale-darkgray border-lafftale-gold/20 text-gray-300'>
          <DialogHeader>
            <DialogTitle className='text-lafftale-gold'>
              Ticket #{selectedTicket?.Id} – {selectedTicket?.Subject}
            </DialogTitle>
            <DialogDescription className='text-gray-400'>Here you can view ticket details and reply.</DialogDescription>
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
                          ? 'ml-auto bg-yellow-100 text-yellow-900 text-right'
                          : 'mr-auto bg-gray-800 text-white text-left'
                      }`}
                    >
                      <div className='text-xs mb-1 text-lafftale-gold'>
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
                    placeholder='Type a reply...'
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className='mt-4'
                  />
                  <DialogFooter className='flex justify-between mt-2'>
                    <Button variant='destructive' onClick={() => closeTicket(selectedTicket!.Id)}>
                      Close Ticket
                    </Button>
                    <Button className='btn-primary' onClick={sendReply}>
                      Send Reply
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

export default TicketSystem;
