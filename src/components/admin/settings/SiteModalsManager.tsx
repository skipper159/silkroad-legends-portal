import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { fetchWithAuth, weburl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Edit, Calendar, Image as ImageIcon, Eye, MousePointerClick } from 'lucide-react';

interface SiteModal {
  id: number;
  title: string;
  content: string;
  image_url: string;
  button_text: string;
  button_url: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  show_once: boolean;
}

const SiteModalsManager = () => {
  const [modals, setModals] = useState<SiteModal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModal, setEditingModal] = useState<SiteModal | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image_url: '',
    button_text: '',
    button_url: '',
    start_date: '',
    end_date: '',
    is_active: true,
    priority: 0,
    show_once: true,
  });

  useEffect(() => {
    fetchModals();
  }, []);

  const fetchModals = async () => {
    try {
      const response = await fetchWithAuth(`${weburl}/api/modals`);
      if (response.ok) {
        const data = await response.json();
        setModals(data);
      }
    } catch (err) {
      console.error('Failed to fetch modals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const response = await fetchWithAuth(`${weburl}/api/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image_url: data.data.url }));
      toast({ title: 'Image uploaded successfully' });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingModal ? `${weburl}/api/modals/${editingModal.id}` : `${weburl}/api/modals`;
      const method = editingModal ? 'PUT' : 'POST';

      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Operation failed');

      toast({
        title: editingModal ? 'Modal updated' : 'Modal created',
        description: 'Changes saved successfully',
      });

      setIsDialogOpen(false);
      fetchModals();
      resetForm();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save modal',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this modal?')) return;

    try {
      const response = await fetchWithAuth(`${weburl}/api/modals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');

      setModals(modals.filter((m) => m.id !== id));
      toast({ title: 'Modal deleted' });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete modal',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setEditingModal(null);
    setFormData({
      title: '',
      content: '',
      image_url: '',
      button_text: '',
      button_url: '',
      start_date: '',
      end_date: '',
      is_active: true,
      priority: 0,
      show_once: true,
    });
  };

  const openEdit = (modal: SiteModal) => {
    setEditingModal(modal);
    setFormData({
      title: modal.title,
      content: modal.content || '',
      image_url: modal.image_url || '',
      button_text: modal.button_text || '',
      button_url: modal.button_url || '',
      start_date: modal.start_date ? modal.start_date.slice(0, 16) : '',
      end_date: modal.end_date ? modal.end_date.slice(0, 16) : '',
      is_active: modal.is_active,
      priority: modal.priority,
      show_once: modal.show_once,
    });
    setIsDialogOpen(true);
  };

  if (loading && !modals.length) {
    return <Loader2 className='h-8 w-8 animate-spin mx-auto text-theme-primary' />;
  }

  return (
    <Card className='bg-theme-surface border-theme-border'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <div className='space-y-1.5'>
          <CardTitle className='text-lg font-bold text-theme-text'>Event Modals</CardTitle>
          <CardDescription className='text-theme-text-muted'>
            Manage popups for events and announcements
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
            >
              <Plus className='h-4 w-4 mr-2' />
              New Modal
            </Button>
          </DialogTrigger>
          <DialogContent className='bg-theme-surface border-theme-border max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle className='text-theme-primary'>
                {editingModal ? 'Edit Modal' : 'Create New Modal'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Priority (Higher shows first)</Label>
                  <Input
                    type='number'
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Content (HTML supported)</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className='bg-theme-surface border-theme-border min-h-[100px]'
                />
              </div>

              <div className='space-y-2'>
                <Label>Image URL (Optional)</Label>
                <div className='flex gap-2'>
                  <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className='bg-theme-surface border-theme-border'
                    placeholder='/images/news/...'
                  />
                  <div className='relative'>
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleImageUpload}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                      disabled={uploading}
                    />
                    <Button type='button' disabled={uploading} className='whitespace-nowrap'>
                      {uploading ? <Loader2 className='h-4 w-4 animate-spin' /> : <ImageIcon className='h-4 w-4' />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Start Date (Optional)</Label>
                  <Input
                    type='datetime-local'
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>End Date (Optional)</Label>
                  <Input
                    type='datetime-local'
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label>Button Text (Optional)</Label>
                  <Input
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Button URL (Optional)</Label>
                  <Input
                    value={formData.button_url}
                    onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                    className='bg-theme-surface border-theme-border'
                  />
                </div>
              </div>

              <div className='flex items-center gap-8 py-2'>
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(c) => setFormData({ ...formData, is_active: c })}
                  />
                  <Label>Active</Label>
                </div>
                <div className='flex items-center gap-2'>
                  <Switch
                    checked={formData.show_once}
                    onCheckedChange={(c) => setFormData({ ...formData, show_once: c })}
                  />
                  <Label>Show Once/Day</Label>
                </div>
              </div>

              <div className='flex justify-end pt-4'>
                <Button type='submit' className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'>
                  Save Modal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {modals.map((modal) => (
            <Card key={modal.id} className='bg-theme-surface border-theme-border overflow-hidden'>
              {modal.image_url && (
                <div className='h-32 w-full overflow-hidden bg-black/50'>
                  <img
                    src={`${weburl}${modal.image_url}`}
                    alt={modal.title}
                    className='w-full h-full object-cover opacity-80'
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
              <CardHeader className='pb-2 p-4'>
                <div className='flex justify-between items-start'>
                  <CardTitle className='text-base text-theme-text flex items-center gap-2'>
                    {modal.title}
                    {!modal.is_active && (
                      <span className='text-[10px] bg-red-500/20 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider'>
                        Inactive
                      </span>
                    )}
                  </CardTitle>
                  <span className='text-xs text-theme-text-muted font-mono border border-theme-border px-1.5 py-0.5 rounded'>
                    P{modal.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent className='pt-0 p-4 space-y-3'>
                <div className='text-xs text-theme-text-muted space-y-1.5'>
                  {modal.start_date && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-3 w-3' />
                      <span>Starts: {new Date(modal.start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {modal.end_date && (
                    <div className='flex items-center gap-2'>
                      <Calendar className='h-3 w-3' />
                      <span>Ends: {new Date(modal.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <Eye className='h-3 w-3' />
                    <span>Mode: {modal.show_once ? 'Once per day' : 'Always'}</span>
                  </div>
                  {modal.button_url && (
                    <div className='flex items-center gap-2'>
                      <MousePointerClick className='h-3 w-3' />
                      <span>Has Button</span>
                    </div>
                  )}
                </div>

                <div className='flex justify-end gap-2 pt-2 border-t border-theme-border/50'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => openEdit(modal)}
                    className='h-7 w-7 p-0 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10'
                  >
                    <Edit className='h-3.5 w-3.5' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => handleDelete(modal.id)}
                    className='h-7 w-7 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10'
                  >
                    <Trash2 className='h-3.5 w-3.5' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {!modals.length && (
            <div className='col-span-full py-12 text-center text-theme-text-muted bg-theme-surface rounded-lg border border-dashed border-theme-border'>
              No modals found. Create one to get started!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteModalsManager;
