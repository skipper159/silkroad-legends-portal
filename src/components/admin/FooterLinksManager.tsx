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
import { Link as LinkIcon, Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import ImageUpload from './ImageUpload';
import { Badge } from '../ui/badge';

interface FooterLink {
  id: number;
  title: string;
  url: string;
  image?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FooterSection {
  id: number;
  section_key: string;
  section_name: string;
  is_visible: boolean;
  display_order: number;
}

interface HardcodedLink {
  id: number;
  link_key: string;
  title: string;
  url: string;
  section: string;
  is_visible: boolean;
  display_order: number;
}

const FooterLinksManager = () => {
  const [links, setLinks] = useState<FooterLink[]>([]);
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [hardcodedLinks, setHardcodedLinks] = useState<HardcodedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    image: '',
    display_order: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
    fetchSections();
    fetchHardcodedLinks();
  }, [searchTerm]);

  const fetchHardcodedLinks = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-hardcoded-links`);
      const data = await response.json();

      if (data.success) {
        setHardcodedLinks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching hardcoded links:', error);
    }
  };

  const toggleHardcodedLinkVisibility = async (id: number) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-hardcoded-links/${id}/toggle-visibility`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        fetchHardcodedLinks();
      }
    } catch (error) {
      console.error('Error toggling hardcoded link visibility:', error);
      toast({
        title: 'Error',
        description: 'Error changing visibility',
        variant: 'destructive',
      });
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-sections`);
      const data = await response.json();

      if (data.success) {
        setSections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching footer sections:', error);
    }
  };

  const toggleSectionVisibility = async (id: number) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-sections/${id}/toggle-visibility`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message,
        });
        fetchSections();
      }
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      toast({
        title: 'Error',
        description: 'Error changing visibility',
        variant: 'destructive',
      });
    }
  };

  const fetchLinks = async () => {
    try {
      let url = `${weburl}/api/admin/footer-links`;
      if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
      }

      const response = await fetchWithAuth(url);
      const data = await response.json();

      if (data.success) {
        setLinks(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Could not load footer links',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching footer links:', error);
      toast({
        title: 'Error',
        description: 'Connection error while loading links',
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
      const url = editingLink
        ? `${weburl}/api/admin/footer-links/${editingLink.id}`
        : `${weburl}/api/admin/footer-links`;

      const method = editingLink ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: `Footer link has been ${editingLink ? 'updated' : 'created'}`,
        });

        setModalOpen(false);
        resetForm();
        fetchLinks();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting footer link:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm('Do you really want to delete this footer link?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-links/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Footer link has been deleted',
        });
        fetchLinks();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Deletion failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting footer link:', error);
      toast({
        title: 'Error',
        description: 'Connection error while deleting',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/admin/footer-links/${id}/toggle-active`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Status has been updated',
        });
        fetchLinks();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Status change failed',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
      toast({
        title: 'Error',
        description: 'Connection error',
        variant: 'destructive',
      });
    }
  };

  const openEditModal = (link: FooterLink) => {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      image: link.image || '',
      display_order: link.display_order,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setEditingLink(null);
    setFormData({
      title: '',
      url: '',
      image: '',
      display_order: 0,
    });
  };

  const filteredLinks = links.filter(
    (link) =>
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && links.length === 0) {
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
      {/* Footer Sections Visibility Control */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Eye className='h-5 w-5' />
            Footer Section Visibility
          </CardTitle>
          <CardDescription>Control the visibility of different footer sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {sections.map((section) => (
              <Card key={section.id} className='bg-theme-surface border border-theme-border'>
                <CardContent className='p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold mb-1'>{section.section_name}</h4>
                      <Badge variant={section.is_visible ? 'default' : 'secondary'}>
                        {section.is_visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                    <Button variant='outline' size='sm' onClick={() => toggleSectionVisibility(section.id)}>
                      {section.is_visible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardcoded Links Overview */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LinkIcon className='h-5 w-5' />
            Hardcoded Footer Links (Individual Control)
          </CardTitle>
          <CardDescription>Control the visibility of each individual hardcoded link</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Quick Links Section */}
            <div>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                Quick Links
                <Badge
                  variant={sections.find((s) => s.section_key === 'quick_links')?.is_visible ? 'default' : 'secondary'}
                >
                  Section: {sections.find((s) => s.section_key === 'quick_links')?.is_visible ? 'Visible' : 'Hidden'}
                </Badge>
              </h4>
              <div className='space-y-2'>
                {hardcodedLinks
                  .filter((link) => link.section === 'quick_links')
                  .map((link) => (
                    <div
                      key={link.id}
                      className='flex items-center justify-between p-3 bg-theme-surface/30 rounded-lg border border-theme-border'
                    >
                      <div className='flex items-center gap-2'>
                        <LinkIcon className='h-4 w-4 text-theme-text-muted' />
                        <div>
                          <div className='font-medium text-sm'>{link.title}</div>
                          <div className='text-xs text-theme-text-muted'>{link.url}</div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={link.is_visible ? 'default' : 'secondary'} className='text-xs'>
                          {link.is_visible ? 'Visible' : 'Hidden'}
                        </Badge>
                        <Button variant='outline' size='sm' onClick={() => toggleHardcodedLinkVisibility(link.id)}>
                          {link.is_visible ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Legal Links Section */}
            <div>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                Legal
                <Badge
                  variant={sections.find((s) => s.section_key === 'legal_links')?.is_visible ? 'default' : 'secondary'}
                >
                  Section: {sections.find((s) => s.section_key === 'legal_links')?.is_visible ? 'Visible' : 'Hidden'}
                </Badge>
              </h4>
              <div className='space-y-2'>
                {hardcodedLinks
                  .filter((link) => link.section === 'legal_links')
                  .map((link) => (
                    <div
                      key={link.id}
                      className='flex items-center justify-between p-3 bg-theme-surface/30 rounded-lg border border-theme-border'
                    >
                      <div className='flex items-center gap-2'>
                        <LinkIcon className='h-4 w-4 text-theme-text-muted' />
                        <div>
                          <div className='font-medium text-sm'>{link.title}</div>
                          <div className='text-xs text-theme-text-muted'>{link.url}</div>
                        </div>
                      </div>
                      <div className='flex items-center gap-2'>
                        <Badge variant={link.is_visible ? 'default' : 'secondary'} className='text-xs'>
                          {link.is_visible ? 'Visible' : 'Hidden'}
                        </Badge>
                        <Button variant='outline' size='sm' onClick={() => toggleHardcodedLinkVisibility(link.id)}>
                          {link.is_visible ? <EyeOff className='h-3 w-3' /> : <Eye className='h-3 w-3' />}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Community Links Management (Dynamic) */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <LinkIcon className='h-5 w-5' />
            Community Links Management (Dynamic)
            <Badge
              variant={sections.find((s) => s.section_key === 'community_links')?.is_visible ? 'default' : 'secondary'}
            >
              {sections.find((s) => s.section_key === 'community_links')?.is_visible ? 'Visible' : 'Hidden'}
            </Badge>
          </CardTitle>
          <CardDescription>Manage the dynamic community links in the footer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col sm:flex-row gap-4 mb-6'>
            <div className='relative flex-1'>
              <Search className='absolute left-2 top-2.5 h-4 w-4 text-theme-text-muted' />
              <Input
                placeholder='Search footer links...'
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
                  Add Footer Link
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-2xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>{editingLink ? 'Edit Footer Link' : 'New Footer Link'}</DialogTitle>
                  <DialogDescription>
                    {editingLink ? 'Edit the details of the footer link' : 'Add a new footer link'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                    <Label htmlFor='title'>Title *</Label>
                    <Input
                      id='title'
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder='e.g. Discord Server'
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='url'>URL *</Label>
                    <Input
                      id='url'
                      type='url'
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder='https://example.com'
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='display_order'>Display Order</Label>
                    <Input
                      id='display_order'
                      type='number'
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder='0'
                    />
                    <p className='text-xs text-theme-text-muted mt-1'>Lower numbers will be displayed first</p>
                  </div>

                  <div>
                    <Label htmlFor='image'>Image URL (optional)</Label>
                    <Input
                      id='image'
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder='/images/news/image.jpg or https://example.com/image.jpg'
                    />
                  </div>

                  {/* Image Upload Component */}
                  <ImageUpload
                    onImageUploaded={(imageUrl) => {
                      setFormData((prev) => ({ ...prev, image: imageUrl }));
                    }}
                  />

                  {/* Image Preview */}
                  {formData.image && (
                    <div className='space-y-2'>
                      <Label>Image Preview</Label>
                      <div className='border rounded-lg p-4'>
                        <img
                          src={formData.image.startsWith('http') ? formData.image : `${weburl}${formData.image}`}
                          alt='Preview'
                          className='max-w-full h-auto max-h-40 object-contain rounded'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <DialogFooter>
                    <Button type='button' variant='outline' onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type='submit' disabled={loading}>
                      {loading ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : null}
                      {editingLink ? 'Update' : 'Add'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='border border-theme-border rounded-lg'>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-theme-border bg-theme-surface/50'>
                    <th className='text-left p-4 font-medium'>Image</th>
                    <th className='text-left p-4 font-medium'>Title</th>
                    <th className='text-left p-4 font-medium'>URL</th>
                    <th className='text-left p-4 font-medium'>Order</th>
                    <th className='text-left p-4 font-medium'>Status</th>
                    <th className='text-left p-4 font-medium'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className='text-center p-8 text-theme-text-muted'>
                        {searchTerm ? 'No footer links found' : 'No footer links available'}
                      </td>
                    </tr>
                  ) : (
                    filteredLinks.map((link) => (
                      <tr
                        key={link.id}
                        className='border-b border-theme-border hover:bg-theme-surface/30 transition-colors'
                      >
                        <td className='p-4'>
                          {link.image ? (
                            <img
                              src={link.image.startsWith('http') ? link.image : `${weburl}${link.image}`}
                              alt={link.title}
                              className='w-12 h-12 object-cover rounded'
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className='w-12 h-12 bg-theme-surface rounded flex items-center justify-center border border-theme-border'>
                              <LinkIcon className='h-6 w-6 text-theme-text-muted' />
                            </div>
                          )}
                        </td>
                        <td className='p-4'>
                          <div className='font-medium'>{link.title}</div>
                        </td>
                        <td className='p-4'>
                          <div className='text-sm text-theme-text-muted truncate max-w-xs'>{link.url}</div>
                        </td>
                        <td className='p-4'>
                          <Badge variant='outline'>{link.display_order}</Badge>
                        </td>
                        <td className='p-4'>
                          <Badge variant={link.is_active ? 'default' : 'secondary'}>
                            {link.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className='p-4'>
                          <div className='flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => toggleActive(link.id)}
                              title={link.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {link.is_active ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                            </Button>
                            <Button variant='outline' size='sm' onClick={() => openEditModal(link)}>
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => deleteLink(link.id)}
                              className='text-red-500 border-red-500/30 hover:bg-red-500/10 hover:text-red-400'
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

export default FooterLinksManager;
