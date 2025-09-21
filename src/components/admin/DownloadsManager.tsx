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
          title: 'Fehler',
          description: 'Downloads konnten nicht geladen werden',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler beim Laden der Downloads',
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
          title: 'Erfolgreich',
          description: `Download wurde ${editingDownload ? 'aktualisiert' : 'erstellt'}`,
        });

        setModalOpen(false);
        resetForm();
        fetchDownloads();
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Ein Fehler ist aufgetreten',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting download:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDownload = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Download löschen möchten?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/downloads/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolgreich',
          description: 'Download wurde gelöscht',
        });
        fetchDownloads();
      } else {
        toast({
          title: 'Fehler',
          description: data.message || 'Löschen fehlgeschlagen',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting download:', error);
      toast({
        title: 'Fehler',
        description: 'Verbindungsfehler beim Löschen',
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
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Downloads verwalten
          </CardTitle>
          <CardDescription>Verwalten Sie Downloads für Benutzer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Downloads durchsuchen...'
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
                  Download hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>{editingDownload ? 'Download bearbeiten' : 'Neuen Download hinzufügen'}</DialogTitle>
                  <DialogDescription>
                    {editingDownload ? 'Bearbeiten Sie die Download-Details' : 'Fügen Sie einen neuen Download hinzu'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
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
                    <Label htmlFor='description'>Beschreibung</Label>
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
                    <Label htmlFor='image'>Bild URL (optional)</Label>
                    <Input
                      id='image'
                      type='url'
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>

                  <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => setModalOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button type='submit' disabled={loading}>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                      {editingDownload ? 'Aktualisieren' : 'Hinzufügen'}
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
                    <th className='text-left p-4 font-medium'>Titel</th>
                    <th className='text-left p-4 font-medium'>Beschreibung</th>
                    <th className='text-left p-4 font-medium'>Erstellt am</th>
                    <th className='text-left p-4 font-medium'>Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDownloads.length === 0 ? (
                    <tr>
                      <td colSpan={4} className='text-center p-8 text-muted-foreground'>
                        {searchTerm ? 'Keine Downloads gefunden' : 'Noch keine Downloads vorhanden'}
                      </td>
                    </tr>
                  ) : (
                    filteredDownloads.map((download) => (
                      <tr key={download.id} className='border-b hover:bg-muted/50'>
                        <td className='p-4'>
                          <div className='font-medium'>{download.title}</div>
                          {download.file_url && (
                            <div className='text-sm text-muted-foreground truncate max-w-xs'>{download.file_url}</div>
                          )}
                        </td>
                        <td className='p-4'>
                          <div className='text-sm text-muted-foreground max-w-xs truncate'>
                            {download.description || 'Keine Beschreibung'}
                          </div>
                        </td>
                        <td className='p-4'>
                          <div className='text-sm'>{new Date(download.created_at).toLocaleDateString('de-DE')}</div>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2'>
                            <Button variant='outline' size='sm' onClick={() => openEditModal(download)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => deleteDownload(download.id)}
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

export default DownloadsManager;
