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
import { Globe, Image as ImageIcon, Type, Link2, Upload, Save, Loader2, LayoutTemplate, Share2 } from 'lucide-react';

const BrandingSettings = () => {
  const { theme, setBranding, setBackground, setSocialLink } = useTheme();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  // File input refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const loginBgInputRef = useRef<HTMLInputElement>(null);
  const registerBgInputRef = useRef<HTMLInputElement>(null);
  const heroBgInputRef = useRef<HTMLInputElement>(null);
  const pageBgInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'favicon' | 'login' | 'register' | 'hero' | 'page'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(target);
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

        if (target === 'logo') {
          setBranding('siteLogoUrl', imageUrl);
        } else if (target === 'favicon') {
          setBranding('faviconUrl', imageUrl);
        } else {
          setBackground(target, { url: imageUrl });
        }

        toast({ title: 'Image uploaded successfully' });
      }
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
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
        bg_page: JSON.stringify(theme.backgrounds.page),
        hero_title: theme.heroTitle,
        hero_subtitle: theme.heroSubtitle,
        hero_cta_text: theme.heroCTAText,
        hero_cta_url: theme.heroCTAUrl,
        footer_copyright: theme.footerCopyright,
        footer_about_text: theme.footerAboutText,
        social_discord: theme.socialLinks.discord,
        social_facebook: theme.socialLinks.facebook,
        social_youtube: theme.socialLinks.youtube,
        social_twitter: theme.socialLinks.twitter,
        seo_title: theme.seoTitle,
        seo_description: theme.seoDescription,
        download_url: theme.downloadUrl,
      };

      const response = await fetch(`${weburl}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({ title: 'Branding settings saved!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({ title: 'Failed to save settings', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className='border-theme-border bg-theme-surface'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-theme-primary'>
          <LayoutTemplate className='h-5 w-5' />
          Branding Settings
        </CardTitle>
        <CardDescription className='text-theme-text-muted'>
          Customize your site's identity, backgrounds, and text content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='identity' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-5 bg-theme-background'>
            <TabsTrigger value='identity' className='flex gap-2'>
              <Globe className='h-4 w-4' /> Identity
            </TabsTrigger>
            <TabsTrigger value='backgrounds' className='flex gap-2'>
              <ImageIcon className='h-4 w-4' /> Backgrounds
            </TabsTrigger>
            <TabsTrigger value='hero' className='flex gap-2'>
              <Type className='h-4 w-4' /> Hero
            </TabsTrigger>
            <TabsTrigger value='footer' className='flex gap-2'>
              <Type className='h-4 w-4' /> Footer
            </TabsTrigger>
            <TabsTrigger value='links' className='flex gap-2'>
              <Share2 className='h-4 w-4' /> Links & SEO
            </TabsTrigger>
          </TabsList>

          {/* Site Identity Tab */}
          <TabsContent value='identity' className='space-y-6'>
            <div className='grid gap-4'>
              <div>
                <Label>Site Name</Label>
                <Input
                  value={theme.siteName}
                  onChange={(e) => setBranding('siteName', e.target.value)}
                  placeholder='Your Site Name'
                  className='bg-theme-background border-theme-border'
                />
                <p className='text-xs text-theme-text-muted mt-1'>Shown in sidebar, header, and browser tab</p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label>Logo</Label>
                  <div className='flex gap-2 items-center mt-2'>
                    {theme.siteLogoUrl && (
                      <img
                        src={`${weburl}${theme.siteLogoUrl}`}
                        alt='Logo'
                        className='h-12 w-12 object-contain border border-theme-border rounded'
                      />
                    )}
                    <input
                      ref={logoInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => handleImageUpload(e, 'logo')}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      disabled={uploading === 'logo'}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {uploading === 'logo' ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='h-4 w-4 mr-2' />
                      )}
                      Upload Logo
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Favicon</Label>
                  <div className='flex gap-2 items-center mt-2'>
                    {theme.faviconUrl && (
                      <img
                        src={`${weburl}${theme.faviconUrl}`}
                        alt='Favicon'
                        className='h-8 w-8 object-contain border border-theme-border rounded'
                      />
                    )}
                    <input
                      ref={faviconInputRef}
                      type='file'
                      accept='image/*'
                      className='hidden'
                      onChange={(e) => handleImageUpload(e, 'favicon')}
                    />
                    <Button
                      type='button'
                      variant='outline'
                      disabled={uploading === 'favicon'}
                      onClick={() => faviconInputRef.current?.click()}
                    >
                      {uploading === 'favicon' ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Upload className='h-4 w-4 mr-2' />
                      )}
                      Upload Favicon
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Backgrounds Tab */}
          <TabsContent value='backgrounds' className='space-y-6'>
            {(['login', 'register', 'hero', 'page'] as const).map((area) => {
              const getInputRef = () => {
                switch (area) {
                  case 'login':
                    return loginBgInputRef;
                  case 'register':
                    return registerBgInputRef;
                  case 'hero':
                    return heroBgInputRef;
                  case 'page':
                    return pageBgInputRef;
                }
              };
              const inputRef = getInputRef();

              return (
                <div key={area} className='border border-theme-border rounded-lg p-4'>
                  <h4 className='font-semibold capitalize mb-4'>{area} Background</h4>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label>Image</Label>
                      <div className='flex gap-2 items-center mt-2'>
                        {theme.backgrounds[area].url && (
                          <img
                            src={`${weburl}${theme.backgrounds[area].url}`}
                            alt={`${area} bg`}
                            className='h-16 w-24 object-cover border border-theme-border rounded'
                          />
                        )}
                        <input
                          ref={inputRef}
                          type='file'
                          accept='image/*'
                          className='hidden'
                          onChange={(e) => handleImageUpload(e, area)}
                        />
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          disabled={uploading === area}
                          onClick={() => inputRef.current?.click()}
                        >
                          {uploading === area ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <Upload className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <Label>Image Opacity: {theme.backgrounds[area].opacity}%</Label>
                        <Slider
                          value={[theme.backgrounds[area].opacity]}
                          onValueChange={([v]) => setBackground(area, { opacity: v })}
                          min={0}
                          max={100}
                          step={5}
                          className='mt-2'
                        />
                      </div>
                      <div>
                        <Label>Overlay Opacity: {theme.backgrounds[area].overlayOpacity}%</Label>
                        <Slider
                          value={[theme.backgrounds[area].overlayOpacity]}
                          onValueChange={([v]) => setBackground(area, { overlayOpacity: v })}
                          min={0}
                          max={100}
                          step={5}
                          className='mt-2'
                        />
                      </div>
                      <div className='flex gap-2 items-center'>
                        <Label>Overlay Color</Label>
                        <input
                          type='color'
                          value={theme.backgrounds[area].overlayColor}
                          onChange={(e) => setBackground(area, { overlayColor: e.target.value })}
                          className='h-8 w-12 rounded border-0 cursor-pointer'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Hero Section Tab */}
          <TabsContent value='hero' className='space-y-4'>
            <div>
              <Label>Hero Title</Label>
              <Input
                value={theme.heroTitle}
                onChange={(e) => setBranding('heroTitle', e.target.value)}
                placeholder='Welcome to Our Server'
                className='bg-theme-background border-theme-border'
              />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea
                value={theme.heroSubtitle}
                onChange={(e) => setBranding('heroSubtitle', e.target.value)}
                placeholder='Experience the best gaming...'
                className='bg-theme-background border-theme-border'
                rows={2}
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label>CTA Button Text</Label>
                <Input
                  value={theme.heroCTAText}
                  onChange={(e) => setBranding('heroCTAText', e.target.value)}
                  placeholder='Play Now'
                  className='bg-theme-background border-theme-border'
                />
              </div>
              <div>
                <Label>CTA Button URL</Label>
                <Input
                  value={theme.heroCTAUrl}
                  onChange={(e) => setBranding('heroCTAUrl', e.target.value)}
                  placeholder='/download'
                  className='bg-theme-background border-theme-border'
                />
              </div>
            </div>
          </TabsContent>

          {/* Footer Tab */}
          <TabsContent value='footer' className='space-y-4'>
            <div>
              <Label>Copyright Text</Label>
              <Input
                value={theme.footerCopyright}
                onChange={(e) => setBranding('footerCopyright', e.target.value)}
                placeholder='© 2025 Your Server. All rights reserved.'
                className='bg-theme-background border-theme-border'
              />
            </div>
            <div>
              <Label>About Text</Label>
              <Textarea
                value={theme.footerAboutText}
                onChange={(e) => setBranding('footerAboutText', e.target.value)}
                placeholder='Your server description...'
                className='bg-theme-background border-theme-border'
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Links & SEO Tab */}
          <TabsContent value='links' className='space-y-6'>
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
                    placeholder='https://discord.gg/...'
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Facebook</Label>
                  <Input
                    value={theme.socialLinks.facebook}
                    onChange={(e) => setSocialLink('facebook', e.target.value)}
                    placeholder='https://facebook.com/...'
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>YouTube</Label>
                  <Input
                    value={theme.socialLinks.youtube}
                    onChange={(e) => setSocialLink('youtube', e.target.value)}
                    placeholder='https://youtube.com/...'
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Twitter</Label>
                  <Input
                    value={theme.socialLinks.twitter}
                    onChange={(e) => setSocialLink('twitter', e.target.value)}
                    placeholder='https://twitter.com/...'
                    className='bg-theme-background border-theme-border'
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className='font-semibold mb-3 flex items-center gap-2'>
                <Link2 className='h-4 w-4' /> Download
              </h4>
              <div>
                <Label>Download URL</Label>
                <Input
                  value={theme.downloadUrl}
                  onChange={(e) => setBranding('downloadUrl', e.target.value)}
                  placeholder='https://mega.nz/...'
                  className='bg-theme-background border-theme-border'
                />
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
                    placeholder='Your Server - Private Server'
                    className='bg-theme-background border-theme-border'
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={theme.seoDescription}
                    onChange={(e) => setBranding('seoDescription', e.target.value)}
                    placeholder='Join the ultimate gaming experience...'
                    className='bg-theme-background border-theme-border'
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className='w-full mt-6 bg-theme-primary hover:bg-theme-primary-hover'
        >
          {saving ? <Loader2 className='h-4 w-4 animate-spin mr-2' /> : <Save className='h-4 w-4 mr-2' />}
          Save All Branding Settings
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrandingSettings;
