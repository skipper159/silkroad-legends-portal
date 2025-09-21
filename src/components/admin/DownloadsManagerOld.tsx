import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Download, Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDownload, setEditingDownload] = useState<Download | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    image: ''
  });
  const { toast } = useToast();

  const categories = [
    { value: 'client', label: 'Game Client' },
    { value: 'patch', label: 'Patches' },
    { value: 'tools', label: 'Tools' },
    { value: 'guides', label: 'Guides' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchDownloads();
  }, [searchTerm, selectedCategory]);

  const fetchDownloads = async () => {
    try {
      let url = `${weburl}/api/downloads`;
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
      
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetchWithAuth(url);
      const data = await response.json();
      
      if (data.success) {
        setDownloads(data.data);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast({
        title: "Fehler",
        description: "Downloads konnten nicht geladen werden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingDownload 
        ? `${weburl}/api/downloads/${editingDownload.id}`
        : `${weburl}/api/downloads`;
      
      const method = editingDownload ? 'PUT' : 'POST';
      
      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Erfolgreich",
          description: `Download wurde ${editingDownload ? 'aktualisiert' : 'erstellt'}`
        });
        
        setModalOpen(false);
        resetForm();
        fetchDownloads();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Möchten Sie diesen Download wirklich löschen?')) return;

    try {
      const response = await fetchWithAuth(`${weburl}/api/downloads/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Erfolgreich",
          description: "Download wurde gelöscht"
        });
        fetchDownloads();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Download konnte nicht gelöscht werden",
        variant: "destructive"
      });
    }
  };

  const toggleStatus = async (id: number, isActive: boolean) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/downloads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ active: !isActive })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Erfolgreich",
          description: `Download wurde ${!isActive ? 'aktiviert' : 'deaktiviert'}`
        });
        fetchDownloads();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive"
      });
    }
  };

  const openEditModal = (download: Download) => {
    setEditingDownload(download);
    setFormData({
      title: download.title,
      description: download.description,
      file_url: download.file_url,
      image: download.image || ''
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingDownload(null);
    setFormData({
      title: '',
      description: '',
      file_url: '',
      image: ''
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && downloads.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Downloads Verwaltung
              </CardTitle>
              <CardDescription>
                Verwalten Sie Download-Dateien und -Kategorien
              </CardDescription>
            </div>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Neuer Download
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingDownload ? 'Download bearbeiten' : 'Neuen Download erstellen'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingDownload ? 'Bearbeiten Sie die Download-Details.' : 'Erstellen Sie einen neuen Download-Eintrag.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titel</Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Download-Titel..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Input
                      id="description"
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Beschreibung..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="file_url">Datei-URL</Label>
                    <Input
                      id="file_url"
                      type="url"
                      value={formData.file_url}
                      onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                      placeholder="https://example.com/file.zip"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        type="text"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="1.0.0"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="file_size">Dateigröße (Bytes)</Label>
                      <Input
                        id="file_size"
                        type="number"
                        min="0"
                        value={formData.file_size}
                        onChange={(e) => setFormData({ ...formData, file_size: parseInt(e.target.value) || 0 })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="category">Kategorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Kategorie wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingDownload ? 'Aktualisieren' : 'Erstellen'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Downloads durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Downloads Table */}
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-12 px-4 text-left align-middle font-medium">Titel</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Kategorie</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Version</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Größe</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Downloads</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Erstellt</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((download) => (
                    <tr key={download.id} className="border-b">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{download.title}</div>
                          <div className="text-sm text-muted-foreground">{download.description}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {categories.find(c => c.value === download.category)?.label || download.category}
                        </Badge>
                      </td>
                      <td className="p-4">{download.version}</td>
                      <td className="p-4">{formatFileSize(download.file_size)}</td>
                      <td className="p-4">
                        <Badge variant="secondary">
                          {download.download_count.toLocaleString()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={download.is_active ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleStatus(download.id, download.is_active)}
                        >
                          {download.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {formatDate(download.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(download)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(download.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {downloads.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">
                        Keine Downloads gefunden
                      </td>
                    </tr>
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