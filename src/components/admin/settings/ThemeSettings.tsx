import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Palette, Type, Square, Sparkles, Eye } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import {
  useTheme,
  COLOR_SCHEMES,
  CARD_STYLE_PRESETS,
  BORDER_RADIUS_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  SHADOW_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  FONTS,
  ColorSchemeId,
  CardStylePresetId,
} from '@/context/ThemeContext';

const ThemeSettings = () => {
  const { token } = useAuth();
  const { theme, setColorScheme, setCustomColor, setFontHeading, setFontBody, applyPreset, setCardSetting } =
    useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'cards' | 'buttons' | 'typography' | 'effects'>('colors');

  // Save individual setting to API
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
      if (!response.ok) throw new Error('Failed to save');
      return true;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      return false;
    }
  };

  // Save all theme settings
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const settings = [
        { key: 'theme_color_scheme', value: theme.colorScheme },
        { key: 'font_heading', value: theme.fontHeading },
        { key: 'font_body', value: theme.fontBody },
        { key: 'card_style_preset', value: theme.cardStylePreset },
        { key: 'card_transparency', value: String(theme.cardTransparency) },
        { key: 'card_blur', value: String(theme.cardBlur) },
        { key: 'card_border_radius', value: theme.cardBorderRadius },
        { key: 'card_border_width', value: theme.cardBorderWidth },
        { key: 'card_shadow', value: theme.cardShadow },
        { key: 'button_style', value: theme.buttonStyle },
        { key: 'button_border_radius', value: theme.buttonBorderRadius },
        { key: 'enable_animations', value: String(theme.enableAnimations) },
        { key: 'enable_glow', value: String(theme.enableGlow) },
        // Custom colors
        { key: 'custom_color_primary', value: theme.customColors.primary },
        { key: 'custom_color_primary_hover', value: theme.customColors.primaryHover },
        { key: 'custom_color_background', value: theme.customColors.background },
        { key: 'custom_color_surface', value: theme.customColors.surface },
        { key: 'custom_color_border', value: theme.customColors.border },
        { key: 'custom_color_text', value: theme.customColors.text },
        { key: 'custom_color_text_muted', value: theme.customColors.textMuted },
        { key: 'custom_color_accent', value: theme.customColors.accent },
        { key: 'custom_color_secondary', value: theme.customColors.secondary },
        { key: 'custom_color_highlight', value: theme.customColors.highlight },
      ];

      await Promise.all(settings.map((s) => saveSetting(s.key, s.value)));

      toast({
        title: 'Theme Saved',
        description: 'All theme settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save theme settings.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Live Preview Component
  const LivePreview = () => (
    <div className='border border-theme-border rounded-lg p-4 bg-theme-background'>
      <h4 className='text-sm font-semibold mb-3 flex items-center gap-2'>
        <Eye size={16} /> Live Preview
      </h4>
      <div
        className='p-4'
        style={{
          transition: 'all var(--theme-transition-speed) ease-in-out',
          backgroundColor: `var(--theme-card-bg)`,
          backdropFilter: theme.cardBlur > 0 ? `blur(${theme.cardBlur}px)` : 'none',
          borderRadius: `var(--theme-card-radius)`,
          border: `var(--theme-card-border-width) solid var(--theme-border)`,
          boxShadow: `var(--theme-card-shadow)`,
        }}
      >
        <h3 className='text-lg font-bold mb-2' style={{ color: 'var(--theme-primary)' }}>
          Sample Card
        </h3>
        <p className='text-sm mb-3' style={{ color: 'var(--theme-text-muted)' }}>
          This is how your cards will look with the current settings.
        </p>
        <div className='flex gap-2'>
          <button
            className='px-4 py-2 text-sm font-medium text-white transition-colors'
            style={{
              backgroundColor: 'var(--theme-primary)',
              borderRadius: 'var(--theme-button-radius)',
              transition: 'all var(--theme-transition-speed) ease-in-out',
              boxShadow: theme.enableGlow ? '0 0 15px var(--theme-primary-glow)' : 'none',
            }}
          >
            Primary Button
          </button>
          <button
            className='px-4 py-2 text-sm font-medium transition-colors hover:bg-theme-surface/50'
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-text)',
              borderRadius: 'var(--theme-button-radius)',
              transition: 'all var(--theme-transition-speed) ease-in-out',
            }}
          >
            Secondary
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Card className='bg-theme-surface border-theme-border'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Palette className='h-5 w-5' /> Theme Settings
        </CardTitle>
        <CardDescription>Customize colors, cards, buttons, typography and effects</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Tab Navigation */}
        <div className='flex flex-wrap gap-2 border-b border-theme-border pb-4'>
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'cards', label: 'Cards', icon: Square },
            { id: 'buttons', label: 'Buttons', icon: Square },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'effects', label: 'Effects', icon: Sparkles },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-theme-primary text-white'
                  : 'bg-theme-surface hover:bg-theme-border text-theme-text-muted'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className='space-y-6'>
            {/* Color Scheme Presets */}
            <div>
              <Label className='mb-3 block'>Color Scheme Preset</Label>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                {Object.entries(COLOR_SCHEMES).map(([id, scheme]) => (
                  <button
                    key={id}
                    onClick={() => setColorScheme(id as ColorSchemeId)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme.colorScheme === id
                        ? 'border-theme-primary ring-2 ring-theme-primary/20'
                        : 'border-theme-border hover:border-theme-primary/50'
                    }`}
                  >
                    <div className='flex gap-1 mb-2'>
                      <div className='w-6 h-6 rounded' style={{ backgroundColor: scheme.primary }} />
                      <div className='w-6 h-6 rounded' style={{ backgroundColor: scheme.surface }} />
                      <div className='w-6 h-6 rounded' style={{ backgroundColor: scheme.accent }} />
                      <div className='w-6 h-6 rounded' style={{ backgroundColor: scheme.secondary }} />
                      <div className='w-6 h-6 rounded' style={{ backgroundColor: scheme.highlight }} />
                    </div>
                    <span className='text-sm font-medium'>{scheme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            {theme.colorScheme === 'custom' && (
              <div className='space-y-4 p-4 bg-theme-background rounded-lg border border-theme-border'>
                <Label className='font-semibold'>Custom Colors</Label>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                  {[
                    { key: 'primary', label: 'Primary' },
                    { key: 'primaryHover', label: 'Primary Hover' },
                    { key: 'background', label: 'Background' },
                    { key: 'surface', label: 'Surface' },
                    { key: 'border', label: 'Border' },
                    { key: 'text', label: 'Text' },
                    { key: 'textMuted', label: 'Text Muted' },
                    { key: 'accent', label: 'Accent' },
                    { key: 'secondary', label: 'Secondary (4th)' },
                    { key: 'highlight', label: 'Highlight (5th)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label className='text-xs mb-1 block'>{label}</Label>
                      <div className='flex gap-2 items-center'>
                        <input
                          type='color'
                          value={theme.customColors[key as keyof typeof theme.customColors]}
                          onChange={(e) => setCustomColor(key as keyof typeof theme.customColors, e.target.value)}
                          className='w-10 h-10 rounded cursor-pointer border-0'
                        />
                        <input
                          type='text'
                          value={theme.customColors[key as keyof typeof theme.customColors]}
                          onChange={(e) => setCustomColor(key as keyof typeof theme.customColors, e.target.value)}
                          className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className='space-y-6'>
            {/* Card Style Presets */}
            <div>
              <Label className='mb-3 block'>Card Style Preset</Label>
              <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
                {Object.entries(CARD_STYLE_PRESETS).map(([id, preset]) => (
                  <button
                    key={id}
                    onClick={() => applyPreset(id as CardStylePresetId)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      theme.cardStylePreset === id
                        ? 'border-theme-primary ring-2 ring-theme-primary/20'
                        : 'border-theme-border hover:border-theme-primary/50'
                    }`}
                  >
                    <span className='text-sm font-medium'>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Custom Settings */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <Label className='mb-2 block'>Transparency: {theme.cardTransparency}%</Label>
                <input
                  type='range'
                  min='0'
                  max='100'
                  value={theme.cardTransparency}
                  onChange={(e) => setCardSetting('cardTransparency', parseInt(e.target.value))}
                  className='w-full accent-theme-primary'
                />
              </div>
              <div>
                <Label className='mb-2 block'>Blur: {theme.cardBlur}px</Label>
                <input
                  type='range'
                  min='0'
                  max='20'
                  value={theme.cardBlur}
                  onChange={(e) => setCardSetting('cardBlur', parseInt(e.target.value))}
                  className='w-full accent-theme-primary'
                />
              </div>
              <div>
                <Label className='mb-2 block'>Border Radius</Label>
                <select
                  value={theme.cardBorderRadius}
                  onChange={(e) =>
                    setCardSetting('cardBorderRadius', e.target.value as keyof typeof BORDER_RADIUS_OPTIONS)
                  }
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(BORDER_RADIUS_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className='mb-2 block'>Border Width</Label>
                <select
                  value={theme.cardBorderWidth}
                  onChange={(e) =>
                    setCardSetting('cardBorderWidth', e.target.value as keyof typeof BORDER_WIDTH_OPTIONS)
                  }
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(BORDER_WIDTH_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className='mb-2 block'>Shadow</Label>
                <select
                  value={theme.cardShadow}
                  onChange={(e) => setCardSetting('cardShadow', e.target.value as keyof typeof SHADOW_OPTIONS)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(SHADOW_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Buttons Tab */}
        {activeTab === 'buttons' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <Label className='mb-2 block'>Button Style</Label>
                <select
                  value={theme.buttonStyle}
                  onChange={(e) => setCardSetting('buttonStyle', e.target.value as keyof typeof BUTTON_STYLE_OPTIONS)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(BUTTON_STYLE_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className='mb-2 block'>Button Border Radius</Label>
                <select
                  value={theme.buttonBorderRadius}
                  onChange={(e) =>
                    setCardSetting('buttonBorderRadius', e.target.value as keyof typeof BORDER_RADIUS_OPTIONS)
                  }
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(BORDER_RADIUS_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <Label className='mb-2 block'>Heading Font</Label>
                <select
                  value={theme.fontHeading}
                  onChange={(e) => setFontHeading(e.target.value)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {FONTS.headings.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className='mb-2 block'>Body Font</Label>
                <select
                  value={theme.fontBody}
                  onChange={(e) => setFontBody(e.target.value)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {FONTS.body.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Font Colors */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Font Colors</Label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <Label className='text-xs mb-1 block'>Text Color</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.text}
                      onChange={(e) => setCustomColor('text', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.text}
                      onChange={(e) => setCustomColor('text', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Text Muted</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.textMuted}
                      onChange={(e) => setCustomColor('textMuted', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.textMuted}
                      onChange={(e) => setCustomColor('textMuted', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Primary Color</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.primary}
                      onChange={(e) => setCustomColor('primary', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.primary}
                      onChange={(e) => setCustomColor('primary', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Accent Color</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.accent}
                      onChange={(e) => setCustomColor('accent', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.accent}
                      onChange={(e) => setCustomColor('accent', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Effects Tab */}
        {activeTab === 'effects' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between p-4 bg-theme-background rounded-lg border border-theme-border'>
              <div>
                <Label className='font-medium'>Enable Animations</Label>
                <p className='text-sm text-theme-text-muted'>Smooth transitions and hover effects</p>
              </div>
              <Switch
                checked={theme.enableAnimations}
                onCheckedChange={(checked) => setCardSetting('enableAnimations', checked)}
              />
            </div>
            <div className='flex items-center justify-between p-4 bg-theme-background rounded-lg border border-theme-border'>
              <div>
                <Label className='font-medium'>Enable Glow Effect</Label>
                <p className='text-sm text-theme-text-muted'>Add glow to primary elements</p>
              </div>
              <Switch checked={theme.enableGlow} onCheckedChange={(checked) => setCardSetting('enableGlow', checked)} />
            </div>
          </div>
        )}

        {/* Live Preview */}
        <LivePreview />

        {/* Save Button */}
        <Button onClick={handleSaveAll} disabled={isSaving} className='w-full'>
          {isSaving ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Saving...
            </>
          ) : (
            <>
              <Save className='mr-2 h-4 w-4' /> Save All Theme Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;
