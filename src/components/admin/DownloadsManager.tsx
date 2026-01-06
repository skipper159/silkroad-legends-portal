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
import { Download, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';

interface Download {
  id: number;
  title: string;
  description: string;
  file_url: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const DownloadsManager = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    image: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDownloads();
  }, [searchTerm]);

  const fetchDownloads = async () => {
    try {
      let url = `${weburl}/api/downloads`;

      const response = await fetchWithAuth(url);
      const data = await response.json();

      if (data.success) {
        setDownloads(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Downloads could not be loaded',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast({
        title: 'Error',
        description: 'Connection error while loading downloads',
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
      const url = editingDownload ? `${weburl}/api/downloads/${editingDownload.id}` : `${weburl}/api/downloads`;

      const method = editingDownload ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Download was ${editingDownload ? 'updated' : 'created'}`,
        });

        setModalOpen(false);
        resetForm();
        fetchDownloads();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting download:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDownload = async (id: number) => {
    if (!confirm('Are you sure you want to delete this download?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/downloads/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Download was deleted',
        });
        fetchDownloads();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Deletion failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting download:', error);
      toast({
        title: 'Error',
        description: 'Connection error during deletion',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (download: Download) => {
    setEditingDownload(download);
    setFormData({
      title: download.title,
      description: download.description,
      file_url: download.file_url,
      image: download.image || '',
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingDownload(null);
    setFormData({
      title: '',
      description: '',
      file_url: '',
      image: '',
    });
  };

  const filteredDownloads = downloads.filter(
    (download) =>
      download.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && downloads.length === 0) {
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
      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-white'>
            <div className='p-2 bg-lafftale-gold/20 rounded-lg'>
              <Download className='h-5 w-5 text-lafftale-gold' />
            </div>
            Downloads Management
          </CardTitle>
          <CardDescription className='text-gray-400'>Manage downloads for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search downloads...'
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
                  Add Download
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>{editingDownload ? 'Edit Download' : 'Add New Download'}</DialogTitle>
                  <DialogDescription>
                    {editingDownload ? 'Edit the download details' : 'Add a new download'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
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
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor='file_url'>Download URL</Label>
                    <Input
                      id='file_url'
                      type='url'
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='image'>Image URL (optional)</Label>
                    <Input
                      id='image'
                      type='url'
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='submit' disabled={loading}>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                      {editingDownload ? 'Update' : 'Add'}
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
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Title</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Description</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Created</th>
                    <th className='text-left p-4 font-medium text-lafftale-gold'>Actions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-700/50'>
                  {filteredDownloads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center p-8 text-muted-foreground'>
                        {searchTerm ? 'No downloads found' : 'No downloads available'}
                      </td>
                    </tr>
                  ) : (
                    filteredDownloads.map((download) => (
                      <tr key={download.id} className='hover:bg-lafftale-gold/5 transition-colors'>
                        <td className='p-4 text-gray-300'>
                          <div className='font-medium text-white'>{download.title}</div>
                          {download.file_url && (
                            <div className='text-sm text-gray-400 truncate max-w-xs'>{download.file_url}</div>
                          )}
                        </td>
                        <td className='p-4 text-gray-300'>
                          <div className='text-sm max-w-xs truncate'>{download.description || 'No description'}</div>
                        </td>
                        <td className='p-4 text-gray-300'>
                          <div className='text-sm'>{new Date(download.created_at).toLocaleDateString('en-US')}</div>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => openEditModal(download)}
                              className='border-gray-600 hover:bg-gray-800 hover:text-white'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => deleteDownload(download.id)}
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

export default DownloadsManager;
