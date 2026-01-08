import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, PartyPopper, Cookie, Calendar } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import SiteModalsManager from './SiteModalsManager';
import ThemeSettings from './ThemeSettings';
import BrandingSettings from './BrandingSettings';

interface WebSettings {
  grand_opening_enabled: boolean;
  grand_opening_date: string;
  grand_opening_dismiss_days: number;
  cookie_consent_enabled: boolean;
  cookie_consent_expire_days: number;
}

const DEFAULT_SETTINGS: WebSettings = {
  grand_opening_enabled: true,
  grand_opening_date: '2026-03-31',
  grand_opening_dismiss_days: 7,
  cookie_consent_enabled: true,
  cookie_consent_expire_days: 365,
};

const WebSettingsManager = () => {
  const [settings, setSettings] = useState<WebSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch all web settings from the API
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${weburl}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();

      // Map API response to our settings object
      setSettings({
        grand_opening_enabled: data.grand_opening_enabled === 'true',
        grand_opening_date: data.grand_opening_date || DEFAULT_SETTINGS.grand_opening_date,
        grand_opening_dismiss_days:
          parseInt(data.grand_opening_dismiss_days) || DEFAULT_SETTINGS.grand_opening_dismiss_days,
        cookie_consent_enabled: data.cookie_consent_enabled !== 'false',
        cookie_consent_expire_days:
          parseInt(data.cookie_consent_expire_days) || DEFAULT_SETTINGS.cookie_consent_expire_days,
      });
    } catch (error) {
      console.error('Failed to load web settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load web settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Save a single setting to the API
  const saveSetting = async (key: string, value: string) => {
    try {
      const response = await fetch(`${weburl}/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) throw new Error('Failed to save setting');
      return true;
    } catch (error) {
      console.error(`Failed to save ${key}:`, error);
      return false;
    }
  };

  // Save all settings at once
  const handleSaveAll = async () => {
    setSaving(true);

    const settingsToSave = [
      { key: 'grand_opening_enabled', value: settings.grand_opening_enabled.toString() },
      { key: 'grand_opening_date', value: settings.grand_opening_date },
      { key: 'grand_opening_dismiss_days', value: settings.grand_opening_dismiss_days.toString() },
      { key: 'cookie_consent_enabled', value: settings.cookie_consent_enabled.toString() },
      { key: 'cookie_consent_expire_days', value: settings.cookie_consent_expire_days.toString() },
    ];

    const results = await Promise.all(settingsToSave.map(({ key, value }) => saveSetting(key, value)));

    if (results.every(Boolean)) {
      toast({
        title: 'Success',
        description: 'Web settings saved successfully',
      });
    } else {
      toast({
        title: 'Partial Error',
        description: 'Some settings could not be saved',
        variant: 'destructive',
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin text-lafftale-gold' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Grand Opening Modal Settings */}
      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-lafftale-gold/20 rounded-lg'>
              <PartyPopper className='h-5 w-5 text-lafftale-gold' />
            </div>
            <div>
              <CardTitle className='text-white'>Grand Opening Modal</CardTitle>
              <CardDescription className='text-gray-400'>
                Configure the announcement popup for new visitors
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enable/Disable Toggle */}
          <div className='flex items-center justify-between p-4 bg-lafftale-darkgray/50 rounded-lg border border-lafftale-gold/20'>
            <div>
              <Label className='text-white text-base'>Enable Modal</Label>
              <p className='text-sm text-gray-400'>Show the grand opening popup to visitors</p>
            </div>
            <Switch
              checked={settings.grand_opening_enabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, grand_opening_enabled: checked }))}
            />
          </div>

          {/* Event Date */}
          <div className='grid gap-2'>
            <Label htmlFor='grand_opening_date' className='text-white flex items-center gap-2'>
              <Calendar className='h-4 w-4 text-lafftale-gold' />
              Event Date
            </Label>
            <Input
              id='grand_opening_date'
              type='date'
              value={settings.grand_opening_date}
              onChange={(e) => setSettings((prev) => ({ ...prev, grand_opening_date: e.target.value }))}
              className='bg-lafftale-darkgray border-lafftale-gold/30 text-white max-w-xs focus:border-lafftale-gold'
            />
            <p className='text-sm text-gray-400'>The countdown will display until this date</p>
          </div>

          {/* Dismiss Duration */}
          <div className='grid gap-2'>
            <Label htmlFor='dismiss_days' className='text-white'>
              Dismiss Duration (days)
            </Label>
            <Input
              id='dismiss_days'
              type='number'
              min={1}
              max={365}
              value={settings.grand_opening_dismiss_days}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  grand_opening_dismiss_days: parseInt(e.target.value) || 7,
                }))
              }
              className='bg-lafftale-darkgray border-lafftale-gold/30 text-white max-w-xs focus:border-lafftale-gold'
            />
            <p className='text-sm text-gray-400'>How many days until the modal shows again after being dismissed</p>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Consent Settings */}
      <Card className='bg-lafftale-dark border-lafftale-gold/30'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-blue-500/20 rounded-lg'>
              <Cookie className='h-5 w-5 text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-white'>Cookie Consent Modal</CardTitle>
              <CardDescription className='text-gray-400'>
                Configure the cookie consent banner for GDPR compliance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Enable/Disable Toggle */}
          <div className='flex items-center justify-between p-4 bg-lafftale-darkgray/50 rounded-lg border border-lafftale-gold/20'>
            <div>
              <Label className='text-white text-base'>Enable Cookie Consent</Label>
              <p className='text-sm text-gray-400'>Show cookie consent banner to new visitors</p>
            </div>
            <Switch
              checked={settings.cookie_consent_enabled}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, cookie_consent_enabled: checked }))}
            />
          </div>

          {/* Cookie Expiry */}
          <div className='grid gap-2'>
            <Label htmlFor='cookie_expire_days' className='text-white'>
              Consent Cookie Expiry (days)
            </Label>
            <Input
              id='cookie_expire_days'
              type='number'
              min={1}
              max={365}
              value={settings.cookie_consent_expire_days}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  cookie_consent_expire_days: parseInt(e.target.value) || 365,
                }))
              }
              className='bg-lafftale-darkgray border-lafftale-gold/30 text-white max-w-xs focus:border-lafftale-gold'
            />
            <p className='text-sm text-gray-400'>How long to remember the user's cookie preferences</p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <ThemeSettings />

      {/* Branding Settings */}
      <BrandingSettings />

      {/* Dynamic Event Modals */}
      <SiteModalsManager />

      {/* Save Button */}
      <div className='flex justify-end'>
        <Button
          onClick={handleSaveAll}
          disabled={saving}
          className='bg-lafftale-gold text-lafftale-dark hover:bg-lafftale-bronze min-w-[150px]'
        >
          {saving ? (
            <>
              <Loader2 className='h-4 w-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='h-4 w-4 mr-2' />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default WebSettingsManager;
