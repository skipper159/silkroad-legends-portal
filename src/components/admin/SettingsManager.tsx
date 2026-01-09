import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Setting {
  key: string;
  value: string;
  created_at?: string;
  updated_at?: string;
}

const SettingsManager = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSettingKey, setNewSettingKey] = useState('');
  const [newSettingValue, setNewSettingValue] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${weburl}/api/settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch settings');

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    try {
      const response = await fetch(`${weburl}/api/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) throw new Error('Failed to update setting');

      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addNewSetting = async () => {
    if (!newSettingKey || !newSettingValue) return;

    setSaving(true);
    try {
      const response = await fetch(`${weburl}/api/settings/${newSettingKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: newSettingValue }),
      });

      if (!response.ok) throw new Error('Failed to add setting');

      setSettings((prev) => ({
        ...prev,
        [newSettingKey]: newSettingValue,
      }));

      setNewSettingKey('');
      setNewSettingValue('');

      toast({
        title: 'Success',
        description: 'Setting added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add setting',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSetting = async (key: string) => {
    if (!confirm(`Are you sure you want to delete the setting "${key}"?`)) return;

    try {
      const response = await fetch(`${weburl}/api/settings/${key}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete setting');

      setSettings((prev) => {
        const newSettings = { ...prev };
        delete newSettings[key];
        return newSettings;
      });

      toast({
        title: 'Success',
        description: 'Setting deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete setting',
        variant: 'destructive',
      });
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getBooleanValue = (value: string): boolean => {
    return value === 'true' || value === '1';
  };

  const setBooleanValue = (value: boolean): string => {
    return value ? 'true' : 'false';
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center p-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <Card className='bg-theme-surface border-theme-border'>
        <CardHeader>
          <CardTitle className='text-theme-primary'>Website Settings</CardTitle>
          <CardDescription className='text-theme-text-muted'>
            Manage your website configuration settings
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Site Information */}
          <div className='grid gap-4'>
            <div>
              <Label htmlFor='site_name' className='text-theme-text'>
                Site Name
              </Label>
              <Input
                id='site_name'
                value={settings.site_name || ''}
                onChange={(e) => handleSettingChange('site_name', e.target.value)}
                className='bg-theme-surface border-theme-border text-theme-text'
                placeholder='Enter site name'
              />
              <Button
                onClick={() => updateSetting('site_name', settings.site_name || '')}
                disabled={saving}
                className='mt-2 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                size='sm'
              >
                <Save className='h-4 w-4 mr-2' />
                Save
              </Button>
            </div>

            <div>
              <Label htmlFor='site_description' className='text-theme-text'>
                Site Description
              </Label>
              <Textarea
                id='site_description'
                value={settings.site_description || ''}
                onChange={(e) => handleSettingChange('site_description', e.target.value)}
                className='bg-theme-surface border-theme-border text-theme-text'
                placeholder='Enter site description'
                rows={3}
              />
              <Button
                onClick={() => updateSetting('site_description', settings.site_description || '')}
                disabled={saving}
                className='mt-2 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                size='sm'
              >
                <Save className='h-4 w-4 mr-2' />
                Save
              </Button>
            </div>

            {/* Boolean Settings */}
            <div className='flex items-center justify-between'>
              <div>
                <Label className='text-theme-text'>Maintenance Mode</Label>
                <p className='text-sm text-theme-text-muted'>Enable to put the site in maintenance mode</p>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={getBooleanValue(settings.maintenance_mode || 'false')}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', setBooleanValue(checked))}
                />
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <Label className='text-theme-text'>Registration Enabled</Label>
                <p className='text-sm text-theme-text-muted'>Allow new user registrations</p>
              </div>
              <div className='flex items-center gap-2'>
                <Switch
                  checked={getBooleanValue(settings.registration_enabled || 'true')}
                  onCheckedChange={(checked) => updateSetting('registration_enabled', setBooleanValue(checked))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor='max_accounts_per_ip' className='text-theme-text'>
                Max Accounts per IP
              </Label>
              <Input
                id='max_accounts_per_ip'
                type='number'
                value={settings.max_accounts_per_ip || '3'}
                onChange={(e) => handleSettingChange('max_accounts_per_ip', e.target.value)}
                className='bg-theme-surface border-theme-border text-theme-text'
                placeholder='3'
              />
              <Button
                onClick={() => updateSetting('max_accounts_per_ip', settings.max_accounts_per_ip || '3')}
                disabled={saving}
                className='mt-2 bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
                size='sm'
              >
                <Save className='h-4 w-4 mr-2' />
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Setting */}
      <Card className='bg-theme-surface border-theme-border'>
        <CardHeader>
          <CardTitle className='text-theme-primary'>Add New Setting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4'>
            <div>
              <Label htmlFor='new_key' className='text-theme-text'>
                Setting Key
              </Label>
              <Input
                id='new_key'
                value={newSettingKey}
                onChange={(e) => setNewSettingKey(e.target.value)}
                className='bg-theme-surface border-theme-border text-theme-text'
                placeholder='setting_key'
              />
            </div>
            <div>
              <Label htmlFor='new_value' className='text-theme-text'>
                Setting Value
              </Label>
              <Input
                id='new_value'
                value={newSettingValue}
                onChange={(e) => setNewSettingValue(e.target.value)}
                className='bg-theme-surface border-theme-border text-theme-text'
                placeholder='setting_value'
              />
            </div>
            <Button
              onClick={addNewSetting}
              disabled={saving || !newSettingKey || !newSettingValue}
              className='bg-theme-primary text-theme-text-on-primary hover:bg-theme-primary/90'
            >
              <Save className='h-4 w-4 mr-2' />
              Add Setting
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Settings */}
      <Card className='bg-theme-surface border-theme-border'>
        <CardHeader>
          <CardTitle className='text-theme-primary'>All Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-2'>
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} className='flex items-center justify-between p-2 bg-theme-surface/50 rounded'>
                <div className='flex-1'>
                  <span className='font-medium text-theme-text'>{key}</span>
                  <p className='text-sm text-theme-text-muted truncate'>{value}</p>
                </div>
                <Button onClick={() => deleteSetting(key)} variant='destructive' size='sm'>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
