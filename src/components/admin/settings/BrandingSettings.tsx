import { useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { weburl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
  Globe,
  Image as ImageIcon,
  Type,
  Upload,
  Save,
  Loader2,
  LayoutTemplate,
  Share2,
  Trash2,
  Play,
  Plus,
  X,
} from 'lucide-react';
import { ConfigFieldType, TemplateConfigField } from '@/lib/template-system/types';

const BrandingSettings = () => {
  const { theme, setBranding, setBackground, setSocialLink, setHeroMedia, currentTemplate } = useTheme();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // File input ref generic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadField, setActiveUploadField] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(fieldKey);
    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await fetch(`${weburl}/api/upload/images`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const imageUrl = data.data[0].url;

        // Map field keys to state updaters
        if (fieldKey === 'logo') {
          setBranding('siteLogoUrl', imageUrl);
        } else if (fieldKey === 'favicon') {
          // Special case, favicon might not be in config but usually is
          setBranding('faviconUrl', imageUrl);
        } else if (fieldKey.startsWith('heroMedia-')) {
          // Handle hero media image uploads
          const index = parseInt(fieldKey.replace('heroMedia-', ''), 10);
          if (!isNaN(index) && index >= 0 && index < theme.heroMedia.length) {
            const newMedia = [...theme.heroMedia];
            newMedia[index] = { ...newMedia[index], url: imageUrl };
            setHeroMedia(newMedia);
          }
        } else if (fieldKey.includes('Background') || fieldKey === 'heroBackground') {
          // Normalize key: 'accountHeaderBackground' -> 'account', 'loginBackground' -> 'login'
          let bgType = fieldKey.replace('Background', '').replace('Header', '').toLowerCase();

          // Special cases
          if (fieldKey === 'heroBackground') bgType = 'hero';
          if (fieldKey === 'heroContainerBackground') bgType = 'heroContainer';
          if (fieldKey === 'serverInfoHeaderBackground') bgType = 'serverInfo';

          if ((theme.backgrounds as any)[bgType]) {
            setBackground(bgType as any, { url: imageUrl });
          }
        } else if (fieldKey === 'homeNewsSectionBg') {
          // Home Page News Section background
          setBranding('homeNewsSectionBgUrl', imageUrl);
        }

        toast({ title: 'Image uploaded successfully' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(null);
      setActiveUploadField(null);
    }
  };

  const handleCreateUploadClick = (fieldKey: string) => {
    setActiveUploadField(fieldKey);
    fileInputRef.current?.click();
  };

  const handleDeleteImage = (fieldKey: string) => {
    if (fieldKey === 'logo') {
      setBranding('siteLogoUrl', '');
    } else if (fieldKey === 'favicon') {
      setBranding('faviconUrl', '');
    } else if (fieldKey.includes('Background') || fieldKey === 'heroBackground') {
      let bgType = fieldKey.replace('Background', '').replace('Header', '').toLowerCase();
      if (fieldKey === 'heroBackground') bgType = 'hero';
      if (fieldKey === 'heroContainerBackground') bgType = 'heroContainer';
      if (fieldKey === 'serverInfoHeaderBackground') bgType = 'serverInfo';
      setBackground(bgType as any, { url: '' });
    }
    toast({ title: 'Image removed' });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const settings = {
        site_name: theme.siteName,
        site_logo_url: theme.siteLogoUrl,
        favicon_url: theme.faviconUrl,
        bg_login: JSON.stringify(theme.backgrounds.login),
        bg_register: JSON.stringify(theme.backgrounds.register),
        bg_hero: JSON.stringify(theme.backgrounds.hero),
        bg_hero_container: JSON.stringify(theme.backgrounds.heroContainer),
        bg_page: JSON.stringify(theme.backgrounds.page),
        bg_sidebar: JSON.stringify(theme.backgrounds.sidebar),
        bg_global: JSON.stringify(theme.backgrounds.global),

        // Headers
        bg_account: JSON.stringify(theme.backgrounds.account),
        bg_admin: JSON.stringify(theme.backgrounds.admin),
        bg_server_info: JSON.stringify(theme.backgrounds.serverInfo),
        bg_news: JSON.stringify(theme.backgrounds.news),
        bg_rankings: JSON.stringify(theme.backgrounds.rankings),
        bg_download: JSON.stringify(theme.backgrounds.download),
        bg_guide: JSON.stringify(theme.backgrounds.guide),

        hero_title: theme.heroTitle,
        hero_subtitle: theme.heroSubtitle,
        footer_copyright: theme.footerCopyright,
        footer_about_text: theme.footerAboutText,

        social_discord: theme.socialLinks.discord,
        social_facebook: theme.socialLinks.facebook,
        social_youtube: theme.socialLinks.youtube,
        social_twitter: theme.socialLinks.twitter,

        seo_title: theme.seoTitle,
        seo_description: theme.seoDescription,
        download_url: theme.downloadUrl,
        hero_media: JSON.stringify(theme.heroMedia),

        // Home Page Section Backgrounds
        home_news_section_bg_mode: theme.homeNewsSectionBgMode,
        home_news_section_bg_url: theme.homeNewsSectionBgUrl,
        home_news_section_bg_settings: JSON.stringify(theme.homeNewsSectionBgSettings),
      };

      const response = await fetch(`${weburl}/api/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error('Failed to save settings');

      toast({ title: 'Branding settings saved successfully' });
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Helper to get value
  const getFieldValue = (field: TemplateConfigField) => {
    if (field.key === 'logo') return theme.siteLogoUrl;
    if (field.key.includes('Background') || field.key === 'heroBackground') {
      let bgType = field.key.replace('Background', '').replace('Header', '').toLowerCase();
      if (field.key === 'heroBackground') bgType = 'hero';
      if (field.key === 'heroContainerBackground') bgType = 'heroContainer';
      if (field.key === 'serverInfoHeaderBackground') bgType = 'serverInfo';

      return (theme.backgrounds as any)[bgType]?.url;
    }
    return '';
  };

  const renderBackgroundControls = (field: TemplateConfigField) => {
    let bgType = field.key.replace('Background', '').replace('Header', '').toLowerCase();
    if (field.key === 'heroBackground') bgType = 'hero';
    if (field.key === 'heroContainerBackground') bgType = 'heroContainer';
    if (field.key === 'serverInfoHeaderBackground') bgType = 'serverInfo';

    const bgSettings = (theme.backgrounds as any)[bgType];

    if (!bgSettings) return null;

    return (
      <div className='mt-4 space-y-3 p-3 bg-theme-background/50 rounded-md border border-theme-border/50'>
        <div>
          <Label className='text-xs'>Image Opacity: {bgSettings.opacity}%</Label>
          <Slider
            value={[bgSettings.opacity]}
            onValueChange={([v]) => setBackground(bgType as any, { opacity: v })}
            min={0}
            max={100}
            step={5}
            className='mt-2'
          />
        </div>
        <div>
          <Label className='text-xs'>Overlay Opacity: {bgSettings.overlayOpacity}%</Label>
          <Slider
            value={[bgSettings.overlayOpacity]}
            onValueChange={([v]) => setBackground(bgType as any, { overlayOpacity: v })}
            min={0}
            max={100}
            step={5}
            className='mt-2'
          />
        </div>
        <div className='flex gap-2 items-center'>
          <Label className='text-xs'>Overlay Color</Label>
          <input
            type='color'
            value={bgSettings.overlayColor}
            onChange={(e) => setBackground(bgType as any, { overlayColor: e.target.value })}
            className='h-6 w-8 rounded border-0 cursor-pointer'
          />
        </div>
      </div>
    );
  };

  // Filter sections based on config
  const imageFields = currentTemplate.customizationConfig?.filter((f) => f.section === 'branding.images') || [];
  // Ensure we always show favicon as it is global
  const hasImages = imageFields.length > 0;

  return (
    <Card className='border-theme-border bg-theme-surface'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-theme-primary'>
          <LayoutTemplate className='h-5 w-5' />
          Branding Settings
        </CardTitle>
        <CardDescription className='text-theme-text-muted'>
          Customize settings available for:{' '}
          <span className='font-bold text-theme-primary'>{currentTemplate.metadata.name}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Hidden File Input for All Uploads */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={(e) => activeUploadField && handleImageUpload(e, activeUploadField)}
        />

        <Tabs defaultValue='images' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-6 bg-theme-background'>
            <TabsTrigger value='images' className='flex gap-2'>
              <ImageIcon className='h-4 w-4' /> Images
            </TabsTrigger>
            <TabsTrigger value='home-sections' className='flex gap-2'>
              <LayoutTemplate className='h-4 w-4' /> Home Sections
            </TabsTrigger>
            <TabsTrigger value='hero-media' className='flex gap-2'>
              <Play className='h-4 w-4' /> Hero Media
            </TabsTrigger>
            <TabsTrigger value='identity' className='flex gap-2'>
              <Globe className='h-4 w-4' /> Identity
            </TabsTrigger>
            <TabsTrigger value='footer' className='flex gap-2'>
              <Type className='h-4 w-4' /> Footer
            </TabsTrigger>
            <TabsTrigger value='links' className='flex gap-2'>
              <Share2 className='h-4 w-4' /> Links & SEO
            </TabsTrigger>
          </TabsList>

          {/* Dynamic Images Tab */}
          <TabsContent value='images' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {/* Always show Favicon */}
              <div className='border border-theme-border rounded-lg p-4'>
                <Label>Favicon</Label>
                <p className='text-xs text-theme-text-muted mb-3'>Browser tab icon</p>
                <div className='flex gap-4 items-center'>
                  {theme.faviconUrl && (
                    <img
                      src={`${weburl}${theme.faviconUrl}`}
                      alt='Favicon'
                      className='h-10 w-10 object-contain border border-theme-border rounded'
                    />
                  )}
                  <div className='flex gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      disabled={uploading === 'favicon'}
                      onClick={() => handleCreateUploadClick('favicon')}
                    >
                      {uploading === 'favicon' ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      ) : (
                        <Upload className='h-3 w-3 mr-2' />
                      )}
                      Upload
                    </Button>
                    {theme.faviconUrl && (
                      <Button
                        type='button'
                        variant='destructive'
                        size='sm'
                        onClick={() => handleDeleteImage('favicon')}
                      >
                        <Trash2 className='h-3 w-3' />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Render Configured Images */}
              {imageFields.map((field) => (
                <div key={field.key} className='border border-theme-border rounded-lg p-4'>
                  <Label>{field.label}</Label>
                  {field.description && <p className='text-xs text-theme-text-muted mb-3'>{field.description}</p>}

                  <div className='flex gap-4 items-center'>
                    {getFieldValue(field) && (
                      <img
                        src={`${weburl}${getFieldValue(field)}`}
                        alt={field.label}
                        className='h-20 w-auto max-w-[150px] object-cover border border-theme-border rounded'
                      />
                    )}
                    <div className='flex gap-2'>
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        disabled={uploading === field.key}
                        onClick={() => handleCreateUploadClick(field.key)}
                      >
                        {uploading === field.key ? (
                          <Loader2 className='h-3 w-3 animate-spin' />
                        ) : (
                          <Upload className='h-3 w-3 mr-2' />
                        )}
                        Upload
                      </Button>
                      {getFieldValue(field) && (
                        <Button
                          type='button'
                          variant='destructive'
                          size='sm'
                          onClick={() => handleDeleteImage(field.key)}
                        >
                          <Trash2 className='h-3 w-3' />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Render sliders if it is a background field */}
                  {(field.key.includes('Background') || field.key === 'heroBackground') &&
                    renderBackgroundControls(field)}
                </div>
              ))}
            </div>
            {!hasImages && (
              <div className='p-8 text-center text-theme-text-muted'>
                No image settings available for this template.
              </div>
            )}
          </TabsContent>

          {/* Home Page Sections Tab */}
          <TabsContent value='home-sections' className='space-y-6'>
            <div className='border border-theme-border rounded-lg p-4'>
              <Label className='text-lg font-semibold'>News Section Background</Label>
              <p className='text-xs text-theme-text-muted mb-4'>
                Configure the background for the "Latest Updates" section on the Home page.
              </p>

              <div className='space-y-4'>
                <div className='flex gap-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='newsSectionBgMode'
                      value='transparent'
                      checked={theme.homeNewsSectionBgMode === 'transparent'}
                      onChange={() => setBranding('homeNewsSectionBgMode', 'transparent')}
                      className='accent-theme-primary'
                    />
                    <span className='text-sm'>Transparent (show global background)</span>
                  </label>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='radio'
                      name='newsSectionBgMode'
                      value='custom'
                      checked={theme.homeNewsSectionBgMode === 'custom'}
                      onChange={() => setBranding('homeNewsSectionBgMode', 'custom')}
                      className='accent-theme-primary'
                    />
                    <span className='text-sm'>Custom Image</span>
                  </label>
                </div>

                {theme.homeNewsSectionBgMode === 'custom' && (
                  <div className='space-y-4 pt-4 border-t border-theme-border/50'>
                    <div className='flex gap-4 items-center'>
                      {theme.homeNewsSectionBgUrl && (
                        <img
                          src={
                            theme.homeNewsSectionBgUrl.startsWith('http')
                              ? theme.homeNewsSectionBgUrl
                              : `${weburl}${theme.homeNewsSectionBgUrl}`
                          }
                          alt='News Section Background'
                          className='h-20 w-auto max-w-[150px] object-cover border border-theme-border rounded'
                        />
                      )}
                      <div className='flex gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          disabled={uploading === 'homeNewsSectionBg'}
                          onClick={() => handleCreateUploadClick('homeNewsSectionBg')}
                        >
                          {uploading === 'homeNewsSectionBg' ? (
                            <Loader2 className='h-3 w-3 animate-spin' />
                          ) : (
                            <Upload className='h-3 w-3 mr-2' />
                          )}
                          Upload
                        </Button>
                        {theme.homeNewsSectionBgUrl && (
                          <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            onClick={() => setBranding('homeNewsSectionBgUrl', '')}
                          >
                            <Trash2 className='h-3 w-3' />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Background Controls */}
                    <div className='mt-4 space-y-3 p-3 bg-theme-background/50 rounded-md border border-theme-border/50'>
                      <div>
                        <Label className='text-xs'>
                          Image Opacity: {theme.homeNewsSectionBgSettings?.opacity || 100}%
                        </Label>
                        <Slider
                          value={[theme.homeNewsSectionBgSettings?.opacity || 100]}
                          onValueChange={([v]) =>
                            setBranding('homeNewsSectionBgSettings', { ...theme.homeNewsSectionBgSettings, opacity: v })
                          }
                          min={0}
                          max={100}
                          step={5}
                          className='mt-2'
                        />
                      </div>
                      <div>
                        <Label className='text-xs'>
                          Overlay Opacity: {theme.homeNewsSectionBgSettings?.overlayOpacity || 50}%
                        </Label>
                        <Slider
                          value={[theme.homeNewsSectionBgSettings?.overlayOpacity || 50]}
                          onValueChange={([v]) =>
                            setBranding('homeNewsSectionBgSettings', {
                              ...theme.homeNewsSectionBgSettings,
                              overlayOpacity: v,
                            })
                          }
                          min={0}
                          max={100}
                          step={5}
                          className='mt-2'
                        />
                      </div>
                      <div className='flex gap-2 items-center'>
                        <Label className='text-xs'>Overlay Color</Label>
                        <input
                          type='color'
                          value={theme.homeNewsSectionBgSettings?.overlayColor || '#000000'}
                          onChange={(e) =>
                            setBranding('homeNewsSectionBgSettings', {
                              ...theme.homeNewsSectionBgSettings,
                              overlayColor: e.target.value,
                            })
                          }
                          className='h-6 w-8 rounded border-0 cursor-pointer'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Hero Media Tab */}
          <TabsContent value='hero-media' className='space-y-6'>
            <div className='border border-theme-border rounded-lg p-4'>
              <Label className='text-lg font-semibold'>Hero Slider / Video</Label>
              <p className='text-xs text-theme-text-muted mb-4'>
                Add images for a slider or a YouTube video link for the hero section.
              </p>

              <div className='space-y-4'>
                {theme.heroMedia.map((item, index) => (
                  <div
                    key={index}
                    className='flex gap-4 items-center p-3 bg-theme-background/50 rounded-lg border border-theme-border/50'
                  >
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const newMedia = [...theme.heroMedia];
                        newMedia[index] = { ...newMedia[index], type: e.target.value as 'image' | 'youtube' };
                        setHeroMedia(newMedia);
                      }}
                      className='bg-theme-background border border-theme-border rounded px-2 py-1 text-sm'
                    >
                      <option value='image'>Image</option>
                      <option value='youtube'>YouTube</option>
                    </select>
                    <Input
                      value={item.url}
                      onChange={(e) => {
                        const newMedia = [...theme.heroMedia];
                        newMedia[index] = { ...newMedia[index], url: e.target.value };
                        setHeroMedia(newMedia);
                      }}
                      placeholder={
                        item.type === 'youtube'
                          ? 'https://www.youtube.com/watch?v=...'
                          : '/uploads/image.jpg or https://...'
                      }
                      className='flex-1 bg-theme-background border-theme-border'
                    />
                    {item.type === 'image' && (
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() => {
                          setActiveUploadField(`heroMedia-${index}`);
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className='h-3 w-3' />
                      </Button>
                    )}
                    <Button
                      type='button'
                      variant='destructive'
                      size='sm'
                      onClick={() => {
                        const newMedia = theme.heroMedia.filter((_, i) => i !== index);
                        setHeroMedia(newMedia);
                      }}
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                ))}

                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setHeroMedia([...theme.heroMedia, { type: 'image', url: '' }])}
                  className='w-full'
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Media Item
                </Button>
              </div>

              {theme.heroMedia.length === 0 && (
                <p className='text-sm text-theme-text-muted mt-4 text-center'>
                  No hero media configured. The default hero background will be used.
                </p>
              )}
            </div>
          </TabsContent>

          {/* Identity Tab (Static for now) */}
          <TabsContent value='identity' className='space-y-6'>
            <div>
              <Label>Site Name</Label>
              <Input
                value={theme.siteName}
                onChange={(e) => setBranding('siteName', e.target.value)}
                placeholder='Your Site Name'
                className='bg-theme-background border-theme-border'
              />
            </div>
            {/* If we had Hero Title in config, we would render it here dynamically, but for now keeping static sections for simplicity 
                 unless requested to fully dynamic text fields. The user prioritized images. */}
            <div className='pt-4 border-t border-theme-border'>
              <Label>Hero Title (Default/Hero Templates)</Label>
              <Input
                value={theme.heroTitle}
                onChange={(e) => setBranding('heroTitle', e.target.value)}
                className='bg-theme-background border-theme-border mt-2'
              />
            </div>
            <div className='pt-4'>
              <Label>Hero Subtitle</Label>
              <Textarea
                value={theme.heroSubtitle}
                onChange={(e) => setBranding('heroSubtitle', e.target.value)}
                className='bg-theme-background border-theme-border mt-2'
              />
            </div>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value='footer' className='space-y-4'>
            <div>
              <Label>Copyright Text</Label>
              <Input
                value={theme.footerCopyright}
                onChange={(e) => setBranding('footerCopyright', e.target.value)}
                className='bg-theme-background border-theme-border'
              />
            </div>
            <div>
              <Label>About Text</Label>
              <Textarea
                value={theme.footerAboutText}
                onChange={(e) => setBranding('footerAboutText', e.target.value)}
                className='bg-theme-background border-theme-border'
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Links Tab - Kept static as widely used */}
          <TabsContent value='links' className='space-y-6'>
            {/* Social Links & SEO Inputs (Same as before) */}
            <div>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                <Share2 className='h-4 w-4' /> Social Links
              </h4>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Discord</Label>
                  <Input
                    value={theme.socialLinks.discord}
                    onChange={(e) => setSocialLink('discord', e.target.value)}
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={theme.socialLinks.facebook}
                    onChange={(e) => setSocialLink('facebook', e.target.value)}
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={theme.socialLinks.youtube}
                    onChange={(e) => setSocialLink('youtube', e.target.value)}
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    value={theme.socialLinks.twitter}
                    onChange={(e) => setSocialLink('twitter', e.target.value)}
                    className='bg-theme-background border-theme-border'
                  />
                </div>
              </div>
            </div>
            <div>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                <Globe className='h-4 w-4' /> SEO
              </h4>
              <div className='space-y-4'>
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={theme.seoTitle}
                    onChange={(e) => setBranding('seoTitle', e.target.value)}
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={theme.seoDescription}
                    onChange={(e) => setBranding('seoDescription', e.target.value)}
                    className='bg-theme-background border-theme-border'
                    rows={2}
                  />
                </div>
              </div>
            </div>
            <div>
              <Label>Download URL</Label>
              <Input
                value={theme.downloadUrl}
                onChange={(e) => setBranding('downloadUrl', e.target.value)}
                className='bg-theme-background border-theme-border'
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className='w-full mt-6 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
        >
          {saving ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : <Save className='h-4 w-4 mr-2' />}
          Save All Branding Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;
