import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Vote, Plus, Edit, Trash2, Search, Loader2, ExternalLink } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface VoteSite {
  id: number;
  title: string;
  url: string;
  site: string;
  image: string;
  ip: string;
  param: string;
  reward: number;
  timeout: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

const VotesManager = () => {
  const [votes, setVotes] = useState<VoteSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVote, setEditingVote] = useState<VoteSite | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    site: '',
    image: '',
    ip: '',
    param: '',
    reward: 0,
    timeout: 12,
    active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVotes();
  }, [searchTerm]);

  const fetchVotes = async () => {
    try {
      const url = `http://localhost:3000/api/vote/admin/sites`;

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const text = await response.text();
        console.log('Error response text:', text);
        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
      }

      const data = await response.json();

      if (data.success) {
        setVotes(data.data || []);
      } else {
        toast({
          title: 'Fehler',
          description: 'Vote-Sites konnten nicht geladen werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: 'Fehler',
        description: `Verbindungsfehler beim Laden der Vote-Sites: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingVote
        ? `http://localhost:3000/api/vote/admin/sites/${editingVote.id}`
        : `http://localhost:3000/api/vote/admin/sites`;

      const method = editingVote ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolgreich',
          description: `Vote-Site wurde ${editingVote ? 'aktualisiert' : 'erstellt'}`,
        });

        setModalOpen(false);
        resetForm();
        fetchVotes();
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Ein Fehler ist aufgetreten',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVote = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Vote-Site löschen möchten?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`http://localhost:3000/api/vote/admin/sites/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolgreich',
          description: 'Vote-Site wurde gelöscht',
        });
        fetchVotes();
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Löschen fehlgeschlagen',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting vote:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler beim Löschen',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetchWithAuth(`http://localhost:3000/api/vote/admin/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolgreich',
          description: `Vote-Site wurde ${!currentActive ? 'aktiviert' : 'deaktiviert'}`,
        });
        fetchVotes();
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Aktualisierung fehlgeschlagen',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling vote status:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (vote: VoteSite) => {
    setEditingVote(vote);
    setFormData({
      title: vote.title,
      url: vote.url,
      site: vote.site,
      image: vote.image,
      ip: vote.ip,
      param: vote.param,
      reward: vote.reward,
      timeout: vote.timeout,
      active: vote.active,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingVote(null);
    setFormData({
      title: '',
      url: '',
      site: '',
      image: '',
      ip: '',
      param: '',
      reward: 0,
      timeout: 12,
      active: true,
    });
  };

  const filteredVotes = votes.filter(
    (vote) =>
      vote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && votes.length === 0) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center h-64'>
          <Loader2 className='h-8 w-8 animate-spin' />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Vote className='h-5 w-5' />
            Vote System verwalten
          </CardTitle>
          <CardDescription>Verwalten Sie Vote-Sites und Belohnungen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Vote-Sites durchsuchen...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Vote-Site hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>{editingVote ? 'Vote-Site bearbeiten' : 'Neue Vote-Site hinzufügen'}</DialogTitle>
                  <DialogDescription>
                    {editingVote ? 'Bearbeiten Sie die Vote-Site-Details' : 'Fügen Sie eine neue Vote-Site hinzu'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='title'>Titel</Label>
                      <Input
                        id='title'
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='site'>Site Name</Label>
                      <Input
                        id='site'
                        value={formData.site}
                        onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='url'>Vote URL</Label>
                    <Input
                      id='url'
                      type='url'
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='image'>Bild URL</Label>
                    <Input
                      id='image'
                      type='url'
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='ip'>IP Parameter</Label>
                      <Input
                        id='ip'
                        value={formData.ip}
                        onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor='param'>Parameter</Label>
                      <Input
                        id='param'
                        value={formData.param}
                        onChange={(e) => setFormData({ ...formData, param: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='reward'>Belohnung (Punkte)</Label>
                      <Input
                        id='reward'
                        type='number'
                        min='0'
                        value={formData.reward}
                        onChange={(e) => setFormData({ ...formData, reward: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor='timeout'>Timeout (Stunden)</Label>
                      <Input
                        id='timeout'
                        type='number'
                        min='1'
                        value={formData.timeout}
                        onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 12 })}
                        required
                      />
                    </div>
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='active'
                      checked={formData.active}
                      onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                    />
                    <Label htmlFor='active'>Aktiv</Label>
                  </div>

                  <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => setModalOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type='submit' disabled={loading}>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                      {editingVote ? 'Aktualisieren' : 'Hinzufügen'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='border rounded-lg'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b bg-muted/50'>
                    <th className='text-left p-4 font-medium'>Site</th>
                    <th className='text-left p-4 font-medium'>Titel</th>
                    <th className='text-left p-4 font-medium'>Belohnung</th>
                    <th className='text-left p-4 font-medium'>Timeout</th>
                    <th className='text-left p-4 font-medium'>Status</th>
                    <th className='text-left p-4 font-medium'>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center p-8 text-muted-foreground'>
                        {searchTerm ? 'Keine Vote-Sites gefunden' : 'Noch keine Vote-Sites vorhanden'}
                      </td>
                    </tr>
                  ) : (
                    filteredVotes.map((vote) => (
                      <tr key={vote.id} className='border-b hover:bg-muted/50'>
                        <td className='p-4'>
                          <div className='flex items-center gap-3'>
                            {vote.image && <img src={vote.image} alt={vote.site} className='w-8 h-8 rounded' />}
                            <div>
                              <div className='font-medium'>{vote.site}</div>
                              <div className='text-sm text-muted-foreground'>
                                <a
                                  href={vote.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 hover:underline'
                                >
                                  <ExternalLink className='h-3 w-3' />
                                  Zur Site
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='font-medium'>{vote.title}</div>
                        </td>
                        <td className='p-4'>
                          <Badge variant='secondary'>{vote.reward} Punkte</Badge>
                        </td>
                        <td className='p-4'>
                          <span className='text-sm'>{vote.timeout}h</span>
                        </td>
                        <td className='p-4'>
                          <Badge
                            variant={vote.active ? 'default' : 'secondary'}
                            className='cursor-pointer'
                            onClick={() => toggleActive(vote.id, vote.active)}
                          >
                            {vote.active ? 'Aktiv' : 'Inaktiv'}
                          </Badge>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={() => openEditModal(vote)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => deleteVote(vote.id)}
                              className='text-red-600 hover:text-red-700'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotesManager;
