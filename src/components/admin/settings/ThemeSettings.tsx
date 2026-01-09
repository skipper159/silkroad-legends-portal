import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, Palette, Type, Square, Sparkles, Eye, LayoutTemplate, Frame } from 'lucide-react';
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
import { AVAILABLE_TEMPLATES, TemplateId } from '@/templates/registry';

const ThemeSettings = () => {
  const { token } = useAuth();
  const {
    theme,
    setColorScheme,
    setCustomColor,
    setFontHeading,
    setFontBody,
    applyPreset,
    setCardSetting,
    setActiveTemplate,
  } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'colors' | 'branding' | 'cards' | 'ui_elements' | 'typography' | 'effects' | 'template' | 'borders'
  >('colors');

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
        // Border settings
        { key: 'ui_border_color', value: theme.uiBorderColor },
        { key: 'ui_border_custom_color', value: theme.uiBorderCustomColor },
        { key: 'ui_border_opacity', value: String(theme.uiBorderOpacity) },
        { key: 'ui_border_width', value: theme.uiBorderWidth },
        // Input settings
        { key: 'ui_input_focus_color', value: theme.uiInputFocusColor },
        { key: 'ui_input_focus_custom_color', value: theme.uiInputFocusCustomColor },
        { key: 'ui_input_text_color', value: theme.uiInputTextColor },
        { key: 'ui_input_bg_mode', value: theme.uiInputBgMode },
        { key: 'ui_input_bg_custom', value: theme.uiInputBgCustom },

        // Branding Opacity
        { key: 'brand_gold_opacity', value: String(theme.brandGoldOpacity) },
        { key: 'brand_bronze_opacity', value: String(theme.brandBronzeOpacity) },
        { key: 'brand_dark_opacity', value: String(theme.brandDarkOpacity) },
        { key: 'brand_dark_gray_opacity', value: String(theme.brandDarkGrayOpacity) },

        // UI Elements
        { key: 'ui_button_primary_color', value: theme.uiButtonPrimaryColor },
        { key: 'ui_button_custom_color', value: theme.uiButtonCustomColor },
        { key: 'ui_button_opacity', value: String(theme.uiButtonOpacity) },
        { key: 'ui_button_brightness', value: String(theme.uiButtonBrightness) },

        { key: 'ui_slider_color', value: theme.uiSliderColor },
        { key: 'ui_slider_custom_color', value: theme.uiSliderCustomColor },
        { key: 'ui_slider_opacity', value: String(theme.uiSliderOpacity) },
        { key: 'ui_slider_brightness', value: String(theme.uiSliderBrightness) },

        { key: 'ui_scrollbar_color', value: theme.uiScrollbarColor },
        { key: 'ui_scrollbar_custom_color', value: theme.uiScrollbarCustomColor },
        { key: 'ui_scrollbar_opacity', value: String(theme.uiScrollbarOpacity) },

        { key: 'ui_selection_color', value: theme.uiSelectionColor },
        { key: 'ui_selection_custom_color', value: theme.uiSelectionCustomColor },
        { key: 'ui_selection_opacity', value: String(theme.uiSelectionOpacity) },

        { key: 'ui_link_color', value: theme.uiLinkColor },
        { key: 'ui_link_custom_color', value: theme.uiLinkCustomColor },
        { key: 'ui_link_opacity', value: String(theme.uiLinkOpacity) },

        { key: 'ui_table_stripe_strength', value: String(theme.uiTableStripeStrength) },

        { key: 'ui_loader_color', value: theme.uiLoaderColor },
        { key: 'ui_loader_custom_color', value: theme.uiLoaderCustomColor },

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
        // Branding colors
        { key: 'custom_color_brand_gold', value: theme.customColors.brandGold },
        { key: 'custom_color_brand_bronze', value: theme.customColors.brandBronze },
        { key: 'custom_color_brand_dark', value: theme.customColors.brandDark },
        { key: 'custom_color_brand_dark_gray', value: theme.customColors.brandDarkGray },

        { key: 'active_template', value: theme.activeTemplate },
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
            className='px-4 py-2 text-sm font-medium text-theme-text-on-primary transition-colors'
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
            { id: 'branding', label: 'Branding', icon: Palette },
            { id: 'borders', label: 'Borders', icon: Frame },
            { id: 'cards', label: 'Cards', icon: Square },
            { id: 'ui_elements', label: 'UI Elements', icon: Square },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'effects', label: 'Effects', icon: Sparkles },
            { id: 'template', label: 'Template', icon: LayoutTemplate },
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

        {/* Branding Colors Tab */}
        {activeTab === 'branding' && (
          <div className='space-y-6'>
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Branding Colors</Label>
              <p className='text-sm text-theme-text-muted mb-4'>
                Customize the branding colors used throughout the site (lafftale-gold, lafftale-bronze, etc.)
              </p>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <Label className='text-xs mb-1 block'>Brand Gold</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.brandGold}
                      onChange={(e) => setCustomColor('brandGold', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.brandGold}
                      onChange={(e) => setCustomColor('brandGold', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Brand Bronze</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.brandBronze}
                      onChange={(e) => setCustomColor('brandBronze', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.brandBronze}
                      onChange={(e) => setCustomColor('brandBronze', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Brand Dark</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.brandDark}
                      onChange={(e) => setCustomColor('brandDark', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.brandDark}
                      onChange={(e) => setCustomColor('brandDark', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
                <div>
                  <Label className='text-xs mb-1 block'>Brand Dark Gray</Label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.customColors.brandDarkGray}
                      onChange={(e) => setCustomColor('brandDarkGray', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                    <input
                      type='text'
                      value={theme.customColors.brandDarkGray}
                      onChange={(e) => setCustomColor('brandDarkGray', e.target.value)}
                      className='flex-1 px-2 py-1 text-xs bg-theme-background border border-theme-border rounded'
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className='mt-6 p-4 rounded-lg'
                style={{ backgroundColor: theme.customColors.brandDark || 'var(--lafftale-dark)' }}
              >
                <h4
                  className='font-semibold mb-2'
                  style={{ color: theme.customColors.brandGold || 'var(--lafftale-gold)' }}
                >
                  Preview
                </h4>
                <p style={{ color: theme.customColors.brandBronze || 'var(--lafftale-bronze)' }}>
                  This shows how your branding colors will look.
                </p>
                <div
                  className='mt-2 p-2 rounded'
                  style={{ backgroundColor: theme.customColors.brandDarkGray || 'var(--lafftale-darkgray)' }}
                >
                  <span style={{ color: theme.customColors.brandGold || 'var(--lafftale-gold)' }}>Gold Text</span>
                  <span className='mx-2'>|</span>
                  <span style={{ color: theme.customColors.brandBronze || 'var(--lafftale-bronze)' }}>Bronze Text</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Borders Tab */}
        {activeTab === 'borders' && (
          <div className='space-y-6'>
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <Label className='mb-2 block'>Border Color Mode</Label>
                  <select
                    value={theme.uiBorderColor}
                    onChange={(e) =>
                      setCardSetting('uiBorderColor', e.target.value as 'gold' | 'bronze' | 'primary' | 'custom')
                    }
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='primary'>Match Primary Color</option>
                    <option value='custom'>Custom Color</option>
                  </select>
                </div>

                {theme.uiBorderColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Border Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiBorderCustomColor}
                        onChange={(e) => setCardSetting('uiBorderCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                      <input
                        type='text'
                        value={theme.uiBorderCustomColor}
                        onChange={(e) => setCardSetting('uiBorderCustomColor', e.target.value)}
                        className='flex-1 px-2 py-1 text-sm bg-theme-background border border-theme-border rounded'
                      />
                    </div>
                  </div>
                )}

                <div>
                  <Label className='mb-2 block'>Border Opacity: {theme.uiBorderOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiBorderOpacity}
                    onChange={(e) => setCardSetting('uiBorderOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                  <p className='text-xs text-theme-text-muted mt-1'>
                    Controls transparency of all borders (Tables, Inputs, etc.)
                  </p>
                </div>

                <div>
                  <Label className='mb-2 block'>Border Width</Label>
                  <select
                    value={theme.uiBorderWidth}
                    onChange={(e) =>
                      setCardSetting('uiBorderWidth', e.target.value as keyof typeof BORDER_WIDTH_OPTIONS)
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
              </div>

              <div className='mt-6 border-t border-theme-border pt-6'>
                <Label className='mb-4 block text-lg font-semibold'>Input Configuration</Label>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <Label className='mb-2 block'>Input Focus Ring Color</Label>
                    <select
                      value={theme.uiInputFocusColor}
                      onChange={(e) =>
                        setCardSetting(
                          'uiInputFocusColor',
                          e.target.value as 'gold' | 'bronze' | 'primary' | 'border' | 'custom'
                        )
                      }
                      className='w-full p-2 bg-theme-background border border-theme-border rounded'
                    >
                      <option value='gold'>Match Brand Gold</option>
                      <option value='bronze'>Match Brand Bronze</option>
                      <option value='primary'>Match Primary Color</option>
                      <option value='border'>Match Border Color</option>
                      <option value='custom'>Custom Color</option>
                    </select>
                  </div>

                  {theme.uiInputFocusColor === 'custom' && (
                    <div>
                      <Label className='mb-2 block'>Custom Focus Color</Label>
                      <div className='flex gap-2 items-center'>
                        <input
                          type='color'
                          value={theme.uiInputFocusCustomColor}
                          onChange={(e) => setCardSetting('uiInputFocusCustomColor', e.target.value)}
                          className='w-10 h-10 rounded cursor-pointer border-0'
                        />
                        <input
                          type='text'
                          value={theme.uiInputFocusCustomColor}
                          onChange={(e) => setCardSetting('uiInputFocusCustomColor', e.target.value)}
                          className='flex-1 px-2 py-1 text-sm bg-theme-background border border-theme-border rounded'
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className='mb-2 block'>Input Text Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiInputTextColor}
                        onChange={(e) => setCardSetting('uiInputTextColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                      <input
                        type='text'
                        value={theme.uiInputTextColor}
                        onChange={(e) => setCardSetting('uiInputTextColor', e.target.value)}
                        className='flex-1 px-2 py-1 text-sm bg-theme-background border border-theme-border rounded'
                      />
                    </div>
                    <p className='text-xs text-theme-text-muted mt-1'>Ensures text is visible inside input fields.</p>
                  </div>

                  <div>
                    <Label className='mb-2 block'>Input Background</Label>
                    <select
                      value={theme.uiInputBgMode}
                      onChange={(e) =>
                        setCardSetting('uiInputBgMode', e.target.value as 'default' | 'lighter' | 'darker' | 'custom')
                      }
                      className='w-full p-2 bg-theme-background border border-theme-border rounded'
                    >
                      <option value='default'>Default (Match Surface)</option>
                      <option value='lighter'>Brighter (+10%)</option>
                      <option value='darker'>Darker (-10%)</option>
                      <option value='custom'>Custom Color</option>
                    </select>
                    <p className='text-xs text-theme-text-muted mt-1'>
                      Adjusts background brightness against the surface.
                    </p>
                  </div>

                  {theme.uiInputBgMode === 'custom' && (
                    <div>
                      <Label className='mb-2 block'>Custom Background Color</Label>
                      <div className='flex gap-2 items-center'>
                        <input
                          type='color'
                          value={theme.uiInputBgCustom}
                          onChange={(e) => setCardSetting('uiInputBgCustom', e.target.value)}
                          className='w-10 h-10 rounded cursor-pointer border-0'
                        />
                        <input
                          type='text'
                          value={theme.uiInputBgCustom}
                          onChange={(e) => setCardSetting('uiInputBgCustom', e.target.value)}
                          className='flex-1 px-2 py-1 text-sm bg-theme-background border border-theme-border rounded'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Box */}
              <div className='mt-6 border-t border-theme-border pt-6'>
                <Label className='mb-4 block'>Border Preview</Label>
                <div className='flex gap-4 flex-wrap'>
                  <div className='p-4 border rounded bg-theme-surface'>Default Border</div>
                  <div className='p-4 border rounded bg-theme-background'>Background Border</div>
                  <Button variant='outline'>Outline Button</Button>
                  <input
                    type='text'
                    placeholder='Input Border'
                    className='p-2 border rounded bg-transparent w-full max-w-[200px]'
                  />
                </div>
              </div>
            </div>
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
                    <option key={id} value={String(id)}>
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
                    <option key={id} value={String(id)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* UI Elements Tab (formerly Buttons) */}
        {activeTab === 'ui_elements' && (
          <div className='space-y-6'>
            {/* Standard Button Styles */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 bg-theme-surface border border-theme-border p-4 rounded-lg'>
              <div>
                <Label className='mb-2 block'>Button Style</Label>
                <select
                  value={theme.buttonStyle}
                  onChange={(e) => setCardSetting('buttonStyle', e.target.value as keyof typeof BUTTON_STYLE_OPTIONS)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded'
                >
                  {Object.entries(BUTTON_STYLE_OPTIONS).map(([id, opt]) => (
                    <option key={id} value={String(id)}>
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

            {/* 1. Buttons Customization */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Primary Button Color</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block'>Base Color</Label>
                  <select
                    value={theme.uiButtonPrimaryColor}
                    onChange={(e) => setCardSetting('uiButtonPrimaryColor', e.target.value as any)}
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='primary'>Match Theme Primary</option>
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='custom'>Custom Color</option>
                  </select>
                </div>
                {theme.uiButtonPrimaryColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiButtonCustomColor}
                        onChange={(e) => setCardSetting('uiButtonCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                      <input
                        type='text'
                        value={theme.uiButtonCustomColor}
                        onChange={(e) => setCardSetting('uiButtonCustomColor', e.target.value)}
                        className='flex-1 px-2 py-1 text-sm bg-theme-background border border-theme-border rounded'
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className='mb-2 block'>Opacity: {theme.uiButtonOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiButtonOpacity}
                    onChange={(e) => setCardSetting('uiButtonOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
                <div>
                  <Label className='mb-2 block'>Brightness: {theme.uiButtonBrightness}%</Label>
                  <input
                    type='range'
                    min='-100'
                    max='100'
                    value={theme.uiButtonBrightness}
                    onChange={(e) => setCardSetting('uiButtonBrightness', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                  <p className='text-xs text-theme-text-muted mt-1'>Negative = Darker, Positive = Lighter</p>
                </div>
              </div>
            </div>

            {/* 2. Sliders */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Sliders (Range Inputs)</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block'>Slider Thumb Color</Label>
                  <select
                    value={theme.uiSliderColor}
                    onChange={(e) => setCardSetting('uiSliderColor', e.target.value as any)}
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='primary'>Match Theme Primary</option>
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='custom'>Custom Color</option>
                  </select>
                </div>
                {theme.uiSliderColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiSliderCustomColor}
                        onChange={(e) => setCardSetting('uiSliderCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className='mb-2 block'>Opacity: {theme.uiSliderOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiSliderOpacity}
                    onChange={(e) => setCardSetting('uiSliderOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
                <div>
                  <Label className='mb-2 block'>Brightness: {theme.uiSliderBrightness}%</Label>
                  <input
                    type='range'
                    min='-100'
                    max='100'
                    value={theme.uiSliderBrightness}
                    onChange={(e) => setCardSetting('uiSliderBrightness', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
              </div>
            </div>

            {/* 3. Scrollbars */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Scrollbars</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block'>Thumb Color</Label>
                  <select
                    value={theme.uiScrollbarColor}
                    onChange={(e) => setCardSetting('uiScrollbarColor', e.target.value as any)}
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='primary'>Match Theme Primary</option>
                    <option value='custom'>Custom Color</option>
                  </select>
                </div>
                {theme.uiScrollbarColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiScrollbarCustomColor}
                        onChange={(e) => setCardSetting('uiScrollbarCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className='mb-2 block'>Opacity: {theme.uiScrollbarOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiScrollbarOpacity}
                    onChange={(e) => setCardSetting('uiScrollbarOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
              </div>
            </div>

            {/* 4. Selection */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Text Selection</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block'>Highlight Color</Label>
                  <select
                    value={theme.uiSelectionColor}
                    onChange={(e) => setCardSetting('uiSelectionColor', e.target.value as any)}
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='primary'>Match Theme Primary</option>
                    <option value='custom'>Custom Color</option>
                  </select>
                </div>
                {theme.uiSelectionColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiSelectionCustomColor}
                        onChange={(e) => setCardSetting('uiSelectionCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className='mb-2 block'>Opacity: {theme.uiSelectionOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiSelectionOpacity}
                    onChange={(e) => setCardSetting('uiSelectionOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
              </div>
            </div>

            {/* 5. Links */}
            <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
              <Label className='font-semibold mb-4 block'>Links</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <Label className='mb-2 block'>Link Color</Label>
                  <select
                    value={theme.uiLinkColor}
                    onChange={(e) => setCardSetting('uiLinkColor', e.target.value as any)}
                    className='w-full p-2 bg-theme-background border border-theme-border rounded'
                  >
                    <option value='custom'>Custom Color</option>
                    <option value='primary'>Match Theme Primary</option>
                    <option value='gold'>Match Brand Gold</option>
                    <option value='bronze'>Match Brand Bronze</option>
                    <option value='text'>Match Text Color</option>
                  </select>
                </div>
                {theme.uiLinkColor === 'custom' && (
                  <div>
                    <Label className='mb-2 block'>Custom Color</Label>
                    <div className='flex gap-2 items-center'>
                      <input
                        type='color'
                        value={theme.uiLinkCustomColor}
                        onChange={(e) => setCardSetting('uiLinkCustomColor', e.target.value)}
                        className='w-10 h-10 rounded cursor-pointer border-0'
                      />
                    </div>
                  </div>
                )}
                <div>
                  <Label className='mb-2 block'>Opacity: {theme.uiLinkOpacity}%</Label>
                  <input
                    type='range'
                    min='0'
                    max='100'
                    value={theme.uiLinkOpacity}
                    onChange={(e) => setCardSetting('uiLinkOpacity', parseInt(e.target.value))}
                    className='w-full accent-theme-primary'
                  />
                </div>
              </div>
            </div>

            {/* 6. Tables & Loaders */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
                <Label className='font-semibold mb-4 block'>Tables</Label>
                <Label className='mb-2 block'>Zebra Stripe Strength: {theme.uiTableStripeStrength}%</Label>
                <input
                  type='range'
                  min='0'
                  max='50'
                  value={theme.uiTableStripeStrength}
                  onChange={(e) => setCardSetting('uiTableStripeStrength', parseInt(e.target.value))}
                  className='w-full accent-theme-primary'
                />
                <p className='text-xs text-theme-text-muted mt-1'>Controls intensity of alternating row colors.</p>
              </div>
              <div className='p-4 bg-theme-background rounded-lg border border-theme-border'>
                <Label className='font-semibold mb-4 block'>Loaders (Spinners)</Label>
                <Label className='mb-2 block'>Loader Color</Label>
                <select
                  value={theme.uiLoaderColor}
                  onChange={(e) => setCardSetting('uiLoaderColor', e.target.value as any)}
                  className='w-full p-2 bg-theme-background border border-theme-border rounded mb-3'
                >
                  <option value='primary'>Match Theme Primary</option>
                  <option value='gold'>Match Brand Gold</option>
                  <option value='bronze'>Match Brand Bronze</option>
                  <option value='custom'>Custom Color</option>
                </select>
                {theme.uiLoaderColor === 'custom' && (
                  <div className='flex gap-2 items-center'>
                    <input
                      type='color'
                      value={theme.uiLoaderCustomColor}
                      onChange={(e) => setCardSetting('uiLoaderCustomColor', e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer border-0'
                    />
                  </div>
                )}
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

        {/* Template Tab */}
        {activeTab === 'template' && (
          <div className='space-y-6'>
            <div>
              <Label className='mb-3 block'>Active Template</Label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {AVAILABLE_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setActiveTemplate(template.id as TemplateId)}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme.activeTemplate === template.id
                        ? 'border-theme-primary ring-2 ring-theme-primary/20 bg-theme-primary/5'
                        : 'border-theme-border hover:border-theme-primary/50'
                    }`}
                  >
                    <LayoutTemplate
                      size={32}
                      className={theme.activeTemplate === template.id ? 'text-theme-primary' : 'text-theme-text-muted'}
                    />
                    <span className='font-medium'>{template.name}</span>
                    {theme.activeTemplate === template.id && (
                      <span className='text-xs text-theme-primary bg-theme-primary/10 px-2 py-0.5 rounded-full'>
                        Active
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className='text-sm text-theme-text-muted mt-4'>
                Note: Switching templates may require a page refresh to fully take effect on some legacy components.
              </p>
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
