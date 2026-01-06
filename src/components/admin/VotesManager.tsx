import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

import { Input } from '../ui/input';
import { Button } from '../ui/button';
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
      const url = `${weburl}/api/vote/admin/sites`;

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
          title: 'Error',
          description: 'Vote sites could not be loaded',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching votes:', error);
      toast({
        title: 'Error',
        description: `Connection error loading vote sites: ${error.message}`,
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
      const url = editingVote ? `${weburl}/api/vote/admin/sites/${editingVote.id}` : `${weburl}/api/vote/admin/sites`;

      const method = editingVote ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Vote site was ${editingVote ? 'updated' : 'created'}`,
        });

        setModalOpen(false);
        resetForm();
        fetchVotes();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteVote = async (id: number) => {
    if (!confirm('Are you sure you want to delete this vote site?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/vote/admin/sites/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Vote site was deleted',
        });
        fetchVotes();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Deletion failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting vote:', error);
      toast({
        title: 'Error',
        description: 'Connection error during deletion',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/vote/admin/sites/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !currentActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Vote site was ${!currentActive ? 'activated' : 'deactivated'}`,
        });
        fetchVotes();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Update failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling vote status:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
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
      <div className='flex items-center gap-3 mb-6'>
        <Vote className='h-8 w-8 text-lafftale-gold' />
        <div>
          <h2 className='text-2xl font-bold text-lafftale-gold'>Vote System Management</h2>
          <p className='text-gray-400'>Manage vote sites and rewards</p>
        </div>
      </div>

      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='text-white'>Vote Sites</CardTitle>
          <CardDescription className='text-gray-400'>Manage your voting platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search vote sites...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-8'
              />
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-bronze'
                  onClick={() => {
                    resetForm();
                    setModalOpen(true);
                  }}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Add Vote Site
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-2xl'>
                <DialogHeader>
                  <DialogTitle>{editingVote ? 'Edit Vote Site' : 'Add New Vote Site'}</DialogTitle>
                  <DialogDescription>
                    {editingVote ? 'Edit the vote site details' : 'Add a new vote site'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='title'>Title</Label>
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
                    <Label htmlFor='image'>Image URL</Label>
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
                      <Label htmlFor='reward'>Reward (Points)</Label>
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
                      <Label htmlFor='timeout'>Timeout (Hours)</Label>
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
                    <Label htmlFor='active'>Active</Label>
                  </div>

                  <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={loading}
                      className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-bronze'
                    >
                      {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                      {editingVote ? 'Update' : 'Add'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='border border-lafftale-gold/30 rounded-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-lafftale-gold/10'>
                  <tr className='border-b border-lafftale-gold/20'>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Site</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Title</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Reward</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Timeout</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Status</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700/50'>
                  {filteredVotes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center p-8 text-muted-foreground'>
                        {searchTerm ? 'No vote sites found' : 'No vote sites available'}
                      </td>
                    </tr>
                  ) : (
                    filteredVotes.map((vote) => (
                      <tr key={vote.id} className='hover:bg-lafftale-gold/5 transition-colors'>
                        <td className='p-4 text-gray-300'>
                          <div className='flex items-center gap-3'>
                            {vote.image && <img src={vote.image} alt={vote.site} className='w-8 h-8 rounded' />}
                            <div>
                              <div className='font-medium text-white'>{vote.site}</div>
                              <div className='text-sm text-gray-400'>
                                <a
                                  href={vote.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 hover:underline hover:text-lafftale-gold'
                                >
                                  <ExternalLink className='h-3 w-3' />
                                  Visit site
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='p-4 text-gray-300'>
                          <div className='font-medium'>{vote.title}</div>
                        </td>
                        <td className='p-4'>
                          <Badge variant='secondary' className='bg-lafftale-gold/20 text-lafftale-gold'>
                            {vote.reward} Points
                          </Badge>
                        </td>
                        <td className='p-4 text-gray-300'>
                          <span className='text-sm'>{vote.timeout}h</span>
                        </td>
                        <td className='p-4'>
                          <Badge
                            variant={vote.active ? 'default' : 'secondary'}
                            className={`cursor-pointer ${
                              vote.active
                                ? 'bg-green-900/50 text-green-400 hover:bg-green-900'
                                : 'bg-gray-800 text-gray-400'
                            }`}
                            onClick={() => toggleActive(vote.id, vote.active)}
                          >
                            {vote.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => openEditModal(vote)}
                              className='border-gray-600 hover:bg-gray-800 hover:text-white'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => deleteVote(vote.id)}
                              className='border-red-900/50 text-red-500 hover:bg-red-950 hover:text-red-400'
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
