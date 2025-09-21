import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../ui/use-toast';
import { fetchWithAuth, weburl } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FileText, Edit, Plus, Trash2, Eye, Search, Calendar } from 'lucide-react';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
  author_id: number;
  author_username: string;
  created_at: string;
  updated_at: string;
}

interface NewPage {
  title: string;
  slug: string;
  content: string;
  status: 'draft' | 'published';
}

const PagesManager: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [filteredPages, setFilteredPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [newPage, setNewPage] = useState<NewPage>({
    title: '',
    slug: '',
    content: '',
    status: 'draft',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPages();
  }, []);

  useEffect(() => {
    filterPages();
  }, [pages, searchTerm, statusFilter]);

  const fetchPages = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/pages`);
      const data = await response.json();
      if (data.success) {
        setPages(data.data);
      }
    } catch (error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPages = () => {
    let filtered = [...pages];

    if (searchTerm) {
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          page.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((page) => page.status === statusFilter);
    }

    setFilteredPages(filtered);
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string, isEdit: boolean = false) => {
    const slug = generateSlug(title);

    if (isEdit && editingPage) {
      setEditingPage({
        ...editingPage,
        title,
        slug,
      });
    } else {
      setNewPage({
        ...newPage,
        title,
        slug,
      });
    }
  };

  const handleCreatePage = async () => {
    if (!newPage.title.trim() || !newPage.content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPage),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Page created successfully!',
        });
        setIsCreateDialogOpen(false);
        setNewPage({ title: '', slug: '', content: '', status: 'draft' });
        fetchPages();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to create page',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create page',
        variant: 'destructive',
      });
    }
  };

  const handleUpdatePage = async () => {
    if (!editingPage || !editingPage.title.trim() || !editingPage.content.trim()) {
      toast({
        title: 'Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${editingPage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingPage.title,
          slug: editingPage.slug,
          content: editingPage.content,
          status: editingPage.status,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Page updated successfully!',
        });
        setEditingPage(null);
        fetchPages();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to update page',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update page',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePage = async (pageId: number) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Page deleted successfully!',
        });
        fetchPages();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to delete page',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete page',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className='bg-green-100 text-green-800'>Published</Badge>;
      case 'draft':
        return <Badge className='bg-yellow-100 text-yellow-800'>Draft</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const truncateContent = (content: string, length: number = 100): string => {
    if (content.length <= length) return content;
    return content.substring(0, length) + '...';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='text-3xl'>📄</div>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Pages Manager</h2>
            <p className='text-gray-600'>Create and manage static pages</p>
          </div>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>Create a new static page for your website</DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Title</label>
                <Input
                  placeholder='Page title...'
                  value={newPage.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Slug</label>
                <Input
                  placeholder='page-slug'
                  value={newPage.slug}
                  onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                />
                <p className='text-xs text-gray-500 mt-1'>URL will be: /pages/{newPage.slug}</p>
              </div>
              <div>
                <label className='text-sm font-medium'>Status</label>
                <Select
                  value={newPage.status}
                  onValueChange={(value: 'draft' | 'published') => setNewPage({ ...newPage, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published'>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium'>Content</label>
                <Textarea
                  placeholder='Page content...'
                  value={newPage.content}
                  onChange={(e) => setNewPage({ ...newPage, content: e.target.value })}
                  rows={10}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant='outline' onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePage}>Create Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex gap-4 items-center'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <Input
                  placeholder='Search pages...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-40'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='published'>Published</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <div className='space-y-4'>
        {filteredPages.map((page) => (
          <Card key={page.id} className='hover:shadow-md transition-shadow'>
            <CardContent className='p-6'>
              <div className='flex justify-between items-start gap-4'>
                <div className='flex-1'>
                  <div className='flex items-center gap-2 mb-2'>
                    <FileText className='h-5 w-5 text-blue-600' />
                    <h3 className='text-lg font-semibold'>{page.title}</h3>
                    {getStatusBadge(page.status)}
                  </div>

                  <p className='text-gray-600 mb-3'>{truncateContent(page.content)}</p>

                  <div className='flex items-center gap-4 text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      {new Date(page.created_at).toLocaleDateString()}
                    </div>
                    <div>by {page.author_username}</div>
                    <div>URL: /pages/{page.slug}</div>
                  </div>
                </div>

                <div className='flex gap-2'>
                  {page.status === 'published' && (
                    <Button variant='outline' size='sm' onClick={() => window.open(`/pages/${page.slug}`, '_blank')}>
                      <Eye className='h-4 w-4' />
                    </Button>
                  )}
                  <Button variant='outline' size='sm' onClick={() => setEditingPage(page)}>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => handleDeletePage(page.id)}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPages.length === 0 && (
        <div className='text-center py-8'>
          <div className='text-6xl mb-4'>📄</div>
          <p className='text-gray-600'>{pages.length === 0 ? 'No pages created yet' : 'No pages match your filters'}</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPage} onOpenChange={() => setEditingPage(null)}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Page</DialogTitle>
            <DialogDescription>Make changes to the page content and settings</DialogDescription>
          </DialogHeader>
          {editingPage && (
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium'>Title</label>
                <Input
                  placeholder='Page title...'
                  value={editingPage.title}
                  onChange={(e) => handleTitleChange(e.target.value, true)}
                />
              </div>
              <div>
                <label className='text-sm font-medium'>Slug</label>
                <Input
                  placeholder='page-slug'
                  value={editingPage.slug}
                  onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                />
                <p className='text-xs text-gray-500 mt-1'>URL will be: /pages/{editingPage.slug}</p>
              </div>
              <div>
                <label className='text-sm font-medium'>Status</label>
                <Select
                  value={editingPage.status}
                  onValueChange={(value: 'draft' | 'published') => setEditingPage({ ...editingPage, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='published'>Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className='text-sm font-medium'>Content</label>
                <Textarea
                  placeholder='Page content...'
                  value={editingPage.content}
                  onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                  rows={10}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditingPage(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePage}>Update Page</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PagesManager;
