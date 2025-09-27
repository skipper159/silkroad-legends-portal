import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Calendar,
  Tag,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';

// News Item Interface
interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  image?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  featured?: boolean;
  views?: number;
}

// Form data interface
interface NewsFormData {
  title: string;
  slug: string;
  content: string;
  category: string;
  image: string;
  active: boolean;
}

const NewsManager = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    slug: '',
    content: '',
    category: 'Update',
    image: '',
    active: false,
  });

  const { token } = useAuth();

  // Fetch all news from admin API
  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${weburl}/api/news/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setNews(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: 'Fehler',
        description: 'News konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update news
  const saveNews = async () => {
    try {
      const isEditing = !!editingNews;
      const url = isEditing ? `${weburl}/api/news/admin/${editingNews.id}` : `${weburl}/api/news/admin`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolg',
          description: isEditing ? 'News erfolgreich aktualisiert!' : 'News erfolgreich erstellt!',
        });

        // Reset form and refresh list
        resetForm();
        setActiveTab('list');
        fetchNews();
      } else {
        throw new Error(data.message || 'Failed to save news');
      }
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: 'Fehler',
        description: 'News konnte nicht gespeichert werden.',
        variant: 'destructive',
      });
    }
  };

  // Delete news
  const deleteNews = async (id: number) => {
    if (!confirm('Sind Sie sicher, dass Sie diese News löschen möchten?')) {
      return;
    }

    try {
      const response = await fetch(`${weburl}/api/news/admin/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Erfolg',
          description: 'News erfolgreich gelöscht!',
        });
        fetchNews();
      } else {
        throw new Error(data.message || 'Failed to delete news');
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: 'Fehler',
        description: 'News konnte nicht gelöscht werden.',
        variant: 'destructive',
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      category: 'Update',
      image: '',
      active: false,
    });
    setEditingNews(null);
  };

  // Start editing
  const startEditing = (newsItem: NewsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      slug: newsItem.slug,
      content: newsItem.content,
      category: newsItem.category,
      image: newsItem.image || '',
      active: newsItem.active,
    });
    setActiveTab('form');
  };

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'update':
        return 'bg-blue-600 text-white';
      case 'event':
        return 'bg-yellow-500 text-black';
      case 'community':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center py-20'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lafftale-gold'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold text-lafftale-gold'>News-Verwaltung</h2>
          <p className='text-gray-400'>Verwalten Sie die News und Updates für das Portal</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='list'>News Liste</TabsTrigger>
          <TabsTrigger value='form'>{editingNews ? 'News Bearbeiten' : 'News Erstellen'}</TabsTrigger>
        </TabsList>

        <TabsContent value='list' className='space-y-4'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-semibold'>Alle News ({news.length})</h3>
            <Button
              onClick={() => {
                resetForm();
                setActiveTab('form');
              }}
              className='btn-primary'
            >
              <Plus size={16} className='mr-2' />
              Neue News erstellen
            </Button>
          </div>

          <div className='grid gap-4'>
            {news.map((item) => (
              <Card key={item.id} className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardHeader className='pb-2'>
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-2'>
                        <CardTitle className='text-lg text-lafftale-gold'>{item.title}</CardTitle>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </span>
                        {item.active ? (
                          <CheckCircle size={16} className='text-green-500' />
                        ) : (
                          <AlertCircle size={16} className='text-yellow-500' />
                        )}
                      </div>
                      <CardDescription className='text-gray-400'>Slug: /{item.slug}</CardDescription>
                      <div className='flex items-center gap-4 text-sm text-gray-500 mt-1'>
                        <span className='flex items-center gap-1'>
                          <Calendar size={14} />
                          {formatDate(item.created_at)}
                        </span>
                        {item.image && (
                          <span className='flex items-center gap-1'>
                            <ImageIcon size={14} />
                            Bild
                          </span>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button variant='outline' size='sm' onClick={() => startEditing(item)}>
                        <Edit size={14} className='mr-1' />
                        Bearbeiten
                      </Button>
                      <Button variant='destructive' size='sm' onClick={() => deleteNews(item.id)}>
                        <Trash2 size={14} className='mr-1' />
                        Löschen
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='pt-0'>
                  <p className='text-sm text-gray-300'>
                    {item.content && typeof item.content === 'string'
                      ? item.content.substring(0, 150) + '...'
                      : 'Kein Inhalt verfügbar'}
                  </p>
                </CardContent>
              </Card>
            ))}

            {news.length === 0 && (
              <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
                <CardContent className='text-center py-10'>
                  <p className='text-gray-400'>Keine News vorhanden.</p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setActiveTab('form');
                    }}
                    className='btn-primary mt-4'
                  >
                    <Plus size={16} className='mr-2' />
                    Erste News erstellen
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value='form' className='space-y-6'>
          <Card className='bg-silkroad-dark/30 border-silkroad-gold/20'>
            <CardHeader>
              <CardTitle className='text-lafftale-gold'>
                {editingNews ? 'News Bearbeiten' : 'Neue News Erstellen'}
              </CardTitle>
              <CardDescription>
                Füllen Sie die Felder aus, um eine neue News zu erstellen oder zu bearbeiten
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Titel *</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder='News Titel eingeben...'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='slug'>URL-Slug *</Label>
                  <Input
                    id='slug'
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    placeholder='url-slug-eingeben'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='category'>Kategorie *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Kategorie auswählen' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='Update'>Update</SelectItem>
                      <SelectItem value='Event'>Event</SelectItem>
                      <SelectItem value='Community'>Community</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='image'>Bild-URL</Label>
                  <Input
                    id='image'
                    value={formData.image}
                    onChange={(e) => setFormData((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder='https://example.com/image.jpg oder /path/to/image.jpg'
                  />
                </div>
              </div>

              {/* Image Upload Component */}
              <ImageUpload
                onImageUploaded={(imageUrl) => {
                  setFormData((prev) => ({ ...prev, image: imageUrl }));
                }}
              />

              <div className='space-y-2'>
                <Label htmlFor='content'>Inhalt * (Unterstützt Markdown und HTML)</Label>
                <Textarea
                  id='content'
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="News-Inhalt eingeben...

Sie können Bilder einfügen mit:
- Markdown: ![Beschreibung](URL)  
- HTML: <img src='URL' alt='Beschreibung' />

Verwenden Sie den Image Upload oben, um Bilder hochzuladen."
                  rows={15}
                  required
                  className='font-mono text-sm'
                />
                <div className='text-xs text-gray-400'>
                  Tipp: Nutzen Sie den Image Upload oben und kopieren Sie das Markdown/HTML für Bilder in den Text.
                </div>
              </div>

              <div className='flex items-center space-x-2'>
                <Switch
                  id='active'
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
                />
                <Label htmlFor='active'>News veröffentlichen (sichtbar für Benutzer)</Label>
              </div>

              <div className='flex gap-4 pt-4'>
                <Button
                  onClick={saveNews}
                  className='btn-primary'
                  disabled={!formData.title || !formData.content || !formData.category}
                >
                  <Save size={16} className='mr-2' />
                  {editingNews ? 'News Aktualisieren' : 'News Erstellen'}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                >
                  <X size={16} className='mr-2' />
                  Abbrechen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsManager;
