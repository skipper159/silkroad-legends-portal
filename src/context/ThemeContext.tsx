import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { weburl } from '@/lib/api';
import { TEMPLATES, TemplateId } from '@/templates/registry';
import { TemplateDefinition } from '@/lib/template-system/types';

// Color scheme definitions
export const COLOR_SCHEMES = {
  'emerald-dark': {
    name: 'Emerald Dark',
    primary: '#10b981',
    primaryHover: '#059669',
    background: '#09090b',
    surface: '#18181b',
    border: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    accent: '#14b8a6',
    secondary: '#84cc16', // Lime
    highlight: '#facc15', // Yellow
  },
  'crimson-fire': {
    name: 'Crimson Fire',
    primary: '#ef4444',
    primaryHover: '#dc2626',
    background: '#0c0a09',
    surface: '#1c1917',
    border: '#292524',
    text: '#fafafa',
    textMuted: '#a8a29e',
    accent: '#f97316',
    secondary: '#db2777', // Pink
    highlight: '#fcd34d', // Amber
  },
  'royal-purple': {
    name: 'Royal Purple',
    primary: '#a855f7',
    primaryHover: '#9333ea',
    background: '#030712',
    surface: '#111827',
    border: '#1f2937',
    text: '#f9fafb',
    textMuted: '#9ca3af',
    accent: '#ec4899',
    secondary: '#8b5cf6', // Violet
    highlight: '#f472b6', // Pink Light
  },
  'ocean-blue': {
    name: 'Ocean Blue',
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    background: '#020617',
    surface: '#0f172a',
    border: '#1e293b',
    text: '#f8fafc',
    textMuted: '#94a3b8',
    accent: '#06b6d4',
    secondary: '#6366f1', // Indigo
    highlight: '#f59e0b', // Amber
  },
  'gold-prestige': {
    name: 'Gold Prestige',
    primary: '#eab308',
    primaryHover: '#ca8a04',
    background: '#0a0a0a',
    surface: '#171717',
    border: '#262626',
    text: '#fafafa',
    textMuted: '#a3a3a3',
    accent: '#78350f',
    secondary: '#d97706', // Amber Dark
    highlight: '#fef08a', // Yellow Light
  },
  custom: {
    name: 'Custom',
    primary: '#10b981',
    primaryHover: '#059669',
    background: '#09090b',
    surface: '#18181b',
    border: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    accent: '#14b8a6',
    secondary: '#84cc16',
    highlight: '#facc15',
  },
} as const;

export type ColorSchemeId = keyof typeof COLOR_SCHEMES;

// Card style presets
export const CARD_STYLE_PRESETS = {
  solid: {
    name: 'Solid',
    transparency: 100,
    blur: 0,
    borderRadius: 'md',
    borderWidth: 'thin',
    shadow: 'sm',
  },
  glass: {
    name: 'Glass',
    transparency: 85,
    blur: 12,
    borderRadius: 'lg',
    borderWidth: 'thin',
    shadow: 'md',
  },
  'glass-heavy': {
    name: 'Glass Heavy',
    transparency: 70,
    blur: 20,
    borderRadius: 'xl',
    borderWidth: 'thin',
    shadow: 'lg',
  },
  minimal: {
    name: 'Minimal',
    transparency: 100,
    blur: 0,
    borderRadius: 'sm',
    borderWidth: 'none',
    shadow: 'none',
  },
  custom: {
    name: 'Custom',
    transparency: 95,
    blur: 0,
    borderRadius: 'md',
    borderWidth: 'thin',
    shadow: 'sm',
  },
} as const;

export type CardStylePresetId = keyof typeof CARD_STYLE_PRESETS;

// Border radius options
export const BORDER_RADIUS_OPTIONS = {
  none: { name: 'None', value: '0' },
  sm: { name: 'Small', value: '0.25rem' },
  md: { name: 'Medium', value: '0.5rem' },
  lg: { name: 'Large', value: '0.75rem' },
  xl: { name: 'Extra Large', value: '1rem' },
  '2xl': { name: '2XL', value: '1.5rem' },
  full: { name: 'Full', value: '9999px' },
} as const;

// Border width options
export const BORDER_WIDTH_OPTIONS = {
  none: { name: 'None', value: '0' },
  thin: { name: 'Thin', value: '1px' },
  medium: { name: 'Medium', value: '2px' },
  thick: { name: 'Thick', value: '3px' },
} as const;

// Shadow options
export const SHADOW_OPTIONS = {
  none: { name: 'None', value: 'none' },
  sm: { name: 'Small', value: '0 1px 2px rgba(0,0,0,0.1)' },
  md: { name: 'Medium', value: '0 4px 6px rgba(0,0,0,0.15)' },
  lg: { name: 'Large', value: '0 10px 15px rgba(0,0,0,0.2)' },
  glow: { name: 'Glow', value: '0 0 20px var(--theme-primary-glow)' },
} as const;

// Button style options
export const BUTTON_STYLE_OPTIONS = {
  solid: { name: 'Solid' },
  gradient: { name: 'Gradient' },
  outline: { name: 'Outline' },
  ghost: { name: 'Ghost' },
} as const;

// Font definitions
export const FONTS = {
  headings: [
    { id: 'Inter', name: 'Inter', googleFont: 'Inter:wght@700;800;900' },
    { id: 'Poppins', name: 'Poppins', googleFont: 'Poppins:wght@600;700;800' },
    { id: 'Montserrat', name: 'Montserrat', googleFont: 'Montserrat:wght@700;800;900' },
    { id: 'Playfair Display', name: 'Playfair Display', googleFont: 'Playfair+Display:wght@700;800;900' },
    { id: 'Cinzel', name: 'Cinzel', googleFont: 'Cinzel:wght@600;700;800' },
    { id: 'Oswald', name: 'Oswald', googleFont: 'Oswald:wght@600;700' },
  ],
  body: [
    { id: 'Inter', name: 'Inter', googleFont: 'Inter:wght@400;500;600' },
    { id: 'Roboto', name: 'Roboto', googleFont: 'Roboto:wght@400;500;700' },
    { id: 'Open Sans', name: 'Open Sans', googleFont: 'Open+Sans:wght@400;500;600' },
    { id: 'Lato', name: 'Lato', googleFont: 'Lato:wght@400;700' },
    { id: 'Source Sans Pro', name: 'Source Sans Pro', googleFont: 'Source+Sans+3:wght@400;500;600' },
    { id: 'Nunito', name: 'Nunito', googleFont: 'Nunito:wght@400;500;600;700' },
  ],
};

// Background image settings interface
interface BackgroundSettings {
  url: string;
  opacity: number; // 0-100
  overlayColor: string;
  overlayOpacity: number; // 0-100
  blur: number; // 0-20
}

const defaultBackgroundSettings: BackgroundSettings = {
  url: '',
  opacity: 100,
  overlayColor: '#000000',
  overlayOpacity: 50,
  blur: 0,
};

// Extended theme settings interface
interface ThemeSettings {
  // Color scheme
  colorScheme: ColorSchemeId;
  customColors: {
    primary: string;
    primaryHover: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
    accent: string;
    secondary: string;
    highlight: string;
    // Branding colors
    brandGold: string;
    brandBronze: string;
    brandDark: string;
    brandDarkGray: string;
  };
  // Fonts
  fontHeading: string;
  fontBody: string;
  // Card styling
  cardStylePreset: CardStylePresetId;
  cardTransparency: number; // 0-100
  cardBlur: number; // 0-20
  cardBorderRadius: keyof typeof BORDER_RADIUS_OPTIONS;
  cardBorderWidth: keyof typeof BORDER_WIDTH_OPTIONS;
  cardShadow: keyof typeof SHADOW_OPTIONS;
  // Button styling
  buttonStyle: keyof typeof BUTTON_STYLE_OPTIONS;
  buttonBorderRadius: keyof typeof BORDER_RADIUS_OPTIONS;
  // Effects
  enableAnimations: boolean;
  enableGlow: boolean;
  // === NEW: Border Settings ===
  uiBorderColor: 'gold' | 'bronze' | 'primary' | 'custom';
  uiBorderCustomColor: string;
  uiBorderOpacity: number; // 0-100
  uiBorderWidth: 'none' | 'thin' | 'medium' | 'thick';
  // === NEW: Input Settings ===
  uiInputFocusColor: 'gold' | 'bronze' | 'primary' | 'border' | 'custom';
  uiInputFocusCustomColor: string;
  uiInputTextColor: string;
  uiInputBgMode: 'default' | 'lighter' | 'darker' | 'custom';
  uiInputBgCustom: string;
  // === NEW: Branding ===
  siteName: string;
  siteLogoUrl: string;
  faviconUrl: string;
  // === NEW: Background Images ===
  backgrounds: {
    login: BackgroundSettings;
    register: BackgroundSettings;
    hero: BackgroundSettings;
    page: BackgroundSettings;
    sidebar: BackgroundSettings;
    global: BackgroundSettings; // New
    heroContainer: BackgroundSettings; // New
    account: BackgroundSettings; // New
    admin: BackgroundSettings; // New
    serverInfo: BackgroundSettings; // New
    news: BackgroundSettings; // New
    rankings: BackgroundSettings; // New
    download: BackgroundSettings; // New
    guide: BackgroundSettings; // New
  };
  // === NEW: Branding Opacity ===
  brandGoldOpacity: number; // 0-100
  brandBronzeOpacity: number; // 0-100
  brandDarkOpacity: number; // 0-100
  brandDarkGrayOpacity: number; // 0-100

  // === NEW: UI Elements ===
  // Buttons
  uiButtonPrimaryColor: 'primary' | 'gold' | 'bronze' | 'custom';
  uiButtonCustomColor: string;
  uiButtonOpacity: number;
  uiButtonBrightness: number; // -100 to 100 (0 is default)
  // Sliders
  uiSliderColor: 'primary' | 'gold' | 'bronze' | 'custom';
  uiSliderCustomColor: string;
  uiSliderOpacity: number;
  uiSliderBrightness: number;
  // Scrollbars
  uiScrollbarColor: 'primary' | 'gold' | 'bronze' | 'custom';
  uiScrollbarCustomColor: string;
  uiScrollbarOpacity: number;
  // Selection
  uiSelectionColor: 'primary' | 'gold' | 'bronze' | 'custom';
  uiSelectionCustomColor: string;
  uiSelectionOpacity: number;
  // Links
  uiLinkColor: 'primary' | 'gold' | 'bronze' | 'text' | 'custom';
  uiLinkCustomColor: string;
  uiLinkOpacity: number;
  // Tables
  uiTableStripeStrength: number; // Opacity of the stripe (0-100)
  // Loaders
  uiLoaderColor: 'primary' | 'gold' | 'bronze' | 'custom';
  uiLoaderCustomColor: string;

  // === NEW: Hero Section Text ===
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  heroCTAUrl: string;
  // === NEW: Hero Media (Slider/Video) ===
  heroMedia: Array<{ type: 'image' | 'youtube'; url: string }>;
  // === NEW: Footer Text ===
  footerCopyright: string;
  footerAboutText: string;
  // === NEW: Social Links ===
  socialLinks: {
    discord: string;
    facebook: string;
    youtube: string;
    twitter: string;
  };
  // === NEW: SEO ===
  seoTitle: string;
  seoDescription: string;
  // === NEW: Download ===
  downloadUrl: string;
  // === NEW: Template ===
  activeTemplate: TemplateId;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setColorScheme: (scheme: ColorSchemeId) => void;
  setCustomColor: (key: keyof ThemeSettings['customColors'], value: string) => void;
  setFontHeading: (font: string) => void;
  setFontBody: (font: string) => void;
  setCardStylePreset: (preset: CardStylePresetId) => void;
  setCardSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  applyPreset: (preset: CardStylePresetId) => void;
  setBranding: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  setBackground: (area: keyof ThemeSettings['backgrounds'], settings: Partial<BackgroundSettings>) => void;
  setSocialLink: (platform: keyof ThemeSettings['socialLinks'], url: string) => void;
  setHeroMedia: (media: ThemeSettings['heroMedia']) => void;
  setActiveTemplate: (templateId: TemplateId) => void;
  currentTemplate: TemplateDefinition;
  isLoading: boolean;
}

const defaultTheme: ThemeSettings = {
  colorScheme: 'emerald-dark',
  customColors: {
    primary: '#10b981',
    primaryHover: '#059669',
    background: '#09090b',
    surface: '#18181b',
    border: '#27272a',
    text: '#fafafa',
    textMuted: '#a1a1aa',
    accent: '#14b8a6',
    secondary: '#84cc16',
    highlight: '#facc15',
    // Branding colors
    brandGold: '#D4AF37',
    brandBronze: '#CD7F32',
    brandDark: '#121212',
    brandDarkGray: '#1E1E1E',
  },
  fontHeading: 'Inter',
  fontBody: 'Inter',
  cardStylePreset: 'solid',
  cardTransparency: 100,
  cardBlur: 0,
  cardBorderRadius: 'md',
  cardBorderWidth: 'thin',
  cardShadow: 'sm',
  buttonStyle: 'solid',
  buttonBorderRadius: 'md',
  enableAnimations: true,
  enableGlow: false,
  // Border settings defaults
  uiBorderColor: 'gold',
  uiBorderCustomColor: '#D4AF37',
  uiBorderOpacity: 30,
  uiBorderWidth: 'thin',
  // Input settings defaults
  uiInputFocusColor: 'gold',
  uiInputFocusCustomColor: '#D4AF37',
  uiInputTextColor: '#ffffff',
  uiInputBgMode: 'lighter', // Default to lighter as requested (+10%) or 'default' if preferred. User asked for +10%.
  uiInputBgCustom: '#18181b',

  // Branding Opacity Defaults
  brandGoldOpacity: 100,
  brandBronzeOpacity: 100,
  brandDarkOpacity: 100,
  brandDarkGrayOpacity: 100,

  // UI Element Defaults
  uiButtonPrimaryColor: 'primary',
  uiButtonCustomColor: '#10b981',
  uiButtonOpacity: 100,
  uiButtonBrightness: 0,

  uiSliderColor: 'primary',
  uiSliderCustomColor: '#10b981',
  uiSliderOpacity: 100,
  uiSliderBrightness: 0,

  uiScrollbarColor: 'gold',
  uiScrollbarCustomColor: '#D4AF37',
  uiScrollbarOpacity: 100,

  uiSelectionColor: 'gold',
  uiSelectionCustomColor: '#D4AF37',
  uiSelectionOpacity: 30, // Semi-transparent default

  uiLinkColor: 'custom',
  uiLinkCustomColor: '#3b82f6', // Standard link blue or accent
  uiLinkOpacity: 100,

  uiTableStripeStrength: 5, // Subtle stripe

  uiLoaderColor: 'primary',
  uiLoaderCustomColor: '#10b981',

  // Branding defaults
  siteName: 'Silkroad Legends',
  siteLogoUrl: '',
  faviconUrl: '',
  // Background defaults
  backgrounds: {
    login: { ...defaultBackgroundSettings },
    register: { ...defaultBackgroundSettings },
    hero: { ...defaultBackgroundSettings },
    page: { ...defaultBackgroundSettings },
    sidebar: { ...defaultBackgroundSettings },
    global: { ...defaultBackgroundSettings },
    heroContainer: { ...defaultBackgroundSettings },
    account: { ...defaultBackgroundSettings },
    admin: { ...defaultBackgroundSettings },
    serverInfo: { ...defaultBackgroundSettings },
    news: { ...defaultBackgroundSettings },
    rankings: { ...defaultBackgroundSettings },
    download: { ...defaultBackgroundSettings },
    guide: { ...defaultBackgroundSettings },
  },
  // Hero text defaults
  heroTitle: 'Welcome to Silkroad Legends',
  heroSubtitle: 'Experience the ultimate Silkroad Online adventure',
  heroCTAText: 'Play Now',
  heroCTAUrl: '/download',
  heroMedia: [],
  // Footer defaults
  footerCopyright: '© 2025 Silkroad Legends. All rights reserved.',
  footerAboutText: 'Silkroad Legends is a private server dedicated to providing the best gaming experience.',
  // Social links defaults
  socialLinks: {
    discord: '',
    facebook: '',
    youtube: '',
    twitter: '',
  },
  // SEO defaults
  seoTitle: 'Silkroad Legends - Private Server',
  seoDescription: 'Join the ultimate Silkroad Online experience on Silkroad Legends private server.',
  // Download
  downloadUrl: '',
  activeTemplate: 'modern-v2', // Default to Modern V2
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Load Google Font dynamically
const loadGoogleFont = (fontFamily: string, weights: string) => {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${weights}&display=swap`;
  document.head.appendChild(link);
};

// Apply CSS variables to document
const applyThemeToDOM = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // Get colors (use custom if colorScheme is 'custom', otherwise use preset)
  const colors = theme.colorScheme === 'custom' ? theme.customColors : COLOR_SCHEMES[theme.colorScheme];

  // Apply color variables
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-hover', colors.primaryHover);
  root.style.setProperty('--theme-background', colors.background);
  root.style.setProperty('--theme-surface', colors.surface);
  root.style.setProperty('--theme-border', colors.border);
  root.style.setProperty('--theme-text', colors.text);
  root.style.setProperty('--theme-text-muted', colors.textMuted);
  root.style.setProperty('--theme-accent', colors.accent);
  root.style.setProperty('--theme-secondary', colors.secondary);
  root.style.setProperty('--theme-highlight', colors.highlight);
  root.style.setProperty('--theme-primary-glow', `${colors.primary}40`);

  // Apply branding color variables as RGB (space-separated) for Tailwind opacity support
  const hexToRgbSpaced = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '212 175 55'; // fallback gold
    return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
  };
  root.style.setProperty('--lafftale-gold', hexToRgbSpaced(theme.customColors.brandGold));
  root.style.setProperty('--lafftale-bronze', hexToRgbSpaced(theme.customColors.brandBronze));
  root.style.setProperty('--lafftale-dark', hexToRgbSpaced(theme.customColors.brandDark));
  root.style.setProperty('--lafftale-darkgray', hexToRgbSpaced(theme.customColors.brandDarkGray));

  // Apply UI border settings
  const getBorderColor = (): string => {
    switch (theme.uiBorderColor) {
      case 'gold':
        return theme.customColors.brandGold;
      case 'bronze':
        return theme.customColors.brandBronze;
      case 'primary':
        return colors.primary;
      case 'custom':
        return theme.uiBorderCustomColor;
      default:
        return theme.customColors.brandGold;
    }
  };
  const borderColorHex = getBorderColor();
  const borderColorRgb = hexToRgbSpaced(borderColorHex);
  const borderOpacityDecimal = theme.uiBorderOpacity / 100;
  // Set the shadcn --border variable as HSL (convert from hex for compatibility)
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '46 64% 53%';
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };
  root.style.setProperty('--border', hexToHsl(borderColorHex));
  root.style.setProperty('--input', hexToHsl(borderColorHex));
  root.style.setProperty('--ui-border-color-rgb', borderColorRgb);
  root.style.setProperty('--ui-border-opacity', String(borderOpacityDecimal));
  // Border width mapping
  const borderWidthMap = { none: '0px', thin: '1px', medium: '2px', thick: '3px' };
  root.style.setProperty('--ui-border-width', borderWidthMap[theme.uiBorderWidth]);

  // Apply Input Settings
  const getInputFocusColor = (): string => {
    switch (theme.uiInputFocusColor) {
      case 'gold':
        return theme.customColors.brandGold;
      case 'bronze':
        return theme.customColors.brandBronze;
      case 'primary':
        return colors.primary;
      case 'border':
        return borderColorHex;
      case 'custom':
        return theme.uiInputFocusCustomColor;
      default:
        return theme.customColors.brandGold;
    }
  };
  const inputFocusHex = getInputFocusColor();
  // Shadcn uses --ring variable for focus rings (HSL)
  root.style.setProperty('--ring', hexToHsl(inputFocusHex));
  root.style.setProperty('--input-text', theme.uiInputTextColor);

  // Apply Input Background
  const getInputBgStartColor = () => {
    if (theme.uiInputBgMode === 'custom') return theme.uiInputBgCustom;
    return colors.surface; // Default base is surface
  };
  const inputBgBase = getInputBgStartColor();
  // Convert to HSL and adjust lightness
  const applyLightnessAdj = (hex: string, adj: number): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 10%';
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    // Apply Adjustment
    let newL = l;
    if (theme.uiInputBgMode === 'lighter') newL = Math.min(1, l + 0.1); // +10%
    if (theme.uiInputBgMode === 'darker') newL = Math.max(0, l - 0.1); // -10%

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(newL * 100)}%`;
  };

  if (theme.uiInputBgMode === 'custom') {
    root.style.setProperty('--input-bg', hexToHsl(theme.uiInputBgCustom));
  } else {
    root.style.setProperty('--input-bg', applyLightnessAdj(inputBgBase, 0));
  }

  // Apply font variables
  root.style.setProperty('--theme-font-heading', `"${theme.fontHeading}", sans-serif`);
  root.style.setProperty('--theme-font-body', `"${theme.fontBody}", sans-serif`);

  // Apply card styling variables
  const surfaceRgb = hexToRgb(colors.surface);
  const transparency = theme.cardTransparency / 100;
  root.style.setProperty('--theme-card-bg', `rgba(${surfaceRgb}, ${transparency})`);
  root.style.setProperty('--theme-card-blur', `${theme.cardBlur}px`);
  root.style.setProperty('--theme-card-radius', BORDER_RADIUS_OPTIONS[theme.cardBorderRadius].value);
  root.style.setProperty('--theme-card-border-width', BORDER_WIDTH_OPTIONS[theme.cardBorderWidth].value);
  root.style.setProperty('--theme-card-shadow', SHADOW_OPTIONS[theme.cardShadow].value);

  // Apply button styling
  root.style.setProperty('--theme-button-radius', BORDER_RADIUS_OPTIONS[theme.buttonBorderRadius].value);
  root.style.setProperty('--theme-button-style', theme.buttonStyle);

  // Apply effects
  root.style.setProperty('--theme-transition-speed', theme.enableAnimations ? '200ms' : '0ms');
  root.style.setProperty('--theme-glow-enabled', theme.enableGlow ? '1' : '0');

  // Load Google Fonts
  const headingFont = FONTS.headings.find((f) => f.id === theme.fontHeading);
  const bodyFont = FONTS.body.find((f) => f.id === theme.fontBody);
  // Helper: Convert Hex + Opacity + Brightness to HSLA
  const getHslaValue = (hex: string, opacity = 100, brightness = 0): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 100%'; // fallback

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    // Apply Brightness Adjustment (-100 to 100 -> affects Lightness)
    // Map -100 to 0 (black), 0 to original, 100 to 1 (white)
    if (brightness !== 0) {
      if (brightness > 0) {
        // Lighten: Move L towards 1
        l = l + (1 - l) * (brightness / 100);
      } else {
        // Darken: Move L towards 0
        l = l + l * (brightness / 100);
      }
    }

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);
    const alpha = opacity / 100;

    return `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${alpha})`;
  };

  // Helper: Resolve Color Choice
  const resolveColor = (
    mode: 'primary' | 'gold' | 'bronze' | 'custom' | 'border' | 'text',
    customValue: string
  ): string => {
    switch (mode) {
      case 'primary':
        return colors.primary;
      case 'gold':
        return theme.customColors.brandGold;
      case 'bronze':
        return theme.customColors.brandBronze;
      case 'border':
        return colors.border;
      case 'text':
        return colors.text;
      case 'custom':
        return customValue;
      default:
        return colors.primary;
    }
  };

  // --- Branding Colors with Opacity Support (Space-separated RGB / Alpha) ---
  // Note: Tailwind opacity modifiers might clash if we bake alpha in, so we use strictly RGB channels for base vars
  // and handle opacity in specific use cases or separate vars.
  // HOWEVER, user requested opacity in settings. We will apply it to the RGB var as a 4th value if possible?
  // CSS Level 4: rgb(R G B / A). Tailwind supports this if using `rgb(var(--color) / <alpha>)` structure.
  // If we change --lafftale-gold to "212 175 55 / 0.5", then `rgb(var(--lafftale-gold) / 1)` becomes `rgb(212 175 55 / 0.5 / 1)` -> Invalid.
  // Strategy: We keep --lafftale-gold as standard RGB. control its opacity via specific UI elements or specific classes. Not changing base definition to avoid breaking existing styles.

  // --- UI Elements Variables ---

  // 1. Buttons
  const btnColor = resolveColor(theme.uiButtonPrimaryColor, theme.uiButtonCustomColor);
  root.style.setProperty('--theme-btn-bg', getHslaValue(btnColor, theme.uiButtonOpacity, theme.uiButtonBrightness));

  // 2. Sliders
  const sliderColor = resolveColor(theme.uiSliderColor, theme.uiSliderCustomColor);
  root.style.setProperty(
    '--theme-slider-thumb',
    getHslaValue(sliderColor, theme.uiSliderOpacity, theme.uiSliderBrightness)
  );

  // 3. Scrollbars
  const scrollColor = resolveColor(theme.uiScrollbarColor, theme.uiScrollbarCustomColor);
  root.style.setProperty('--theme-scrollbar-thumb', getHslaValue(scrollColor, theme.uiScrollbarOpacity, 0));

  // 4. Selection
  const selectColor = resolveColor(theme.uiSelectionColor, theme.uiSelectionCustomColor);
  root.style.setProperty('--theme-selection-bg', getHslaValue(selectColor, theme.uiSelectionOpacity, 0));

  // 5. Links
  // 'text' is not in standard resolveColor 'mode' type but used in uiLinkColor type, so we cast or adjust helper.
  const linkColor = resolveColor(theme.uiLinkColor as any, theme.uiLinkCustomColor);
  root.style.setProperty('--theme-link-color', getHslaValue(linkColor, theme.uiLinkOpacity, 0));

  // 6. Tables (Zebra)
  // Zebra stripe is usually black/white overlay, or a specific color. Let's use Surface or Primary at low opacity.
  // User asked for stripe strength.
  root.style.setProperty('--theme-table-stripe', `rgba(255, 255, 255, ${theme.uiTableStripeStrength / 100})`);
  // Or dark if theme is light? Assuming dark theme context mostly.
  // Better: use --foreground with low opacity to be theme-adaptive?
  // Let's stick to a simple white overlay for "highlight" or black for "shade".
  // Actually, standard is usually alternating background colors.

  // 7. Loaders
  const loaderColor = resolveColor(theme.uiLoaderColor, theme.uiLoaderCustomColor);
  root.style.setProperty('--theme-loader-color', getHslaValue(loaderColor, 100, 0));

  if (headingFont) loadGoogleFont(headingFont.id, headingFont.googleFont);
  if (bodyFont) loadGoogleFont(bodyFont.id, bodyFont.googleFont);
};

// Helper: Convert hex to RGB
const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch theme settings from API on mount
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const response = await fetch(`${weburl}/api/settings`);
        if (response.ok) {
          const data = await response.json();

          const loadedTheme: ThemeSettings = {
            colorScheme: (data.theme_color_scheme as ColorSchemeId) || defaultTheme.colorScheme,
            customColors: {
              primary: data.custom_color_primary || defaultTheme.customColors.primary,
              primaryHover: data.custom_color_primary_hover || defaultTheme.customColors.primaryHover,
              background: data.custom_color_background || defaultTheme.customColors.background,
              surface: data.custom_color_surface || defaultTheme.customColors.surface,
              border: data.custom_color_border || defaultTheme.customColors.border,
              text: data.custom_color_text || defaultTheme.customColors.text,
              textMuted: data.custom_color_text_muted || defaultTheme.customColors.textMuted,
              accent: data.custom_color_accent || defaultTheme.customColors.accent,
              secondary: data.custom_color_secondary || defaultTheme.customColors.secondary,
              highlight: data.custom_color_highlight || defaultTheme.customColors.highlight,
              // Branding colors
              brandGold: data.custom_color_brand_gold || defaultTheme.customColors.brandGold,
              brandBronze: data.custom_color_brand_bronze || defaultTheme.customColors.brandBronze,
              brandDark: data.custom_color_brand_dark || defaultTheme.customColors.brandDark,
              brandDarkGray: data.custom_color_brand_dark_gray || defaultTheme.customColors.brandDarkGray,
            },
            fontHeading: data.font_heading || defaultTheme.fontHeading,
            fontBody: data.font_body || defaultTheme.fontBody,
            cardStylePreset: (data.card_style_preset as CardStylePresetId) || defaultTheme.cardStylePreset,
            cardTransparency: parseInt(data.card_transparency) || defaultTheme.cardTransparency,
            cardBlur: parseInt(data.card_blur) || defaultTheme.cardBlur,
            cardBorderRadius:
              (data.card_border_radius as keyof typeof BORDER_RADIUS_OPTIONS) || defaultTheme.cardBorderRadius,
            cardBorderWidth:
              (data.card_border_width as keyof typeof BORDER_WIDTH_OPTIONS) || defaultTheme.cardBorderWidth,
            cardShadow: (data.card_shadow as keyof typeof SHADOW_OPTIONS) || defaultTheme.cardShadow,
            buttonStyle: (data.button_style as keyof typeof BUTTON_STYLE_OPTIONS) || defaultTheme.buttonStyle,
            buttonBorderRadius:
              (data.button_border_radius as keyof typeof BORDER_RADIUS_OPTIONS) || defaultTheme.buttonBorderRadius,
            enableAnimations: data.enable_animations === 'true',
            enableGlow: data.enable_glow === 'true',

            // Border settings
            uiBorderColor: data.ui_border_color || defaultTheme.uiBorderColor,
            uiBorderCustomColor: data.ui_border_custom_color || defaultTheme.uiBorderCustomColor,
            uiBorderOpacity: parseInt(data.ui_border_opacity) || defaultTheme.uiBorderOpacity,
            uiBorderWidth: data.ui_border_width || defaultTheme.uiBorderWidth,
            // Input settings
            uiInputFocusColor: data.ui_input_focus_color || defaultTheme.uiInputFocusColor,
            uiInputFocusCustomColor: data.ui_input_focus_custom_color || defaultTheme.uiInputFocusCustomColor,
            uiInputTextColor: data.ui_input_text_color || defaultTheme.uiInputTextColor,
            uiInputBgMode: data.ui_input_bg_mode || defaultTheme.uiInputBgMode,
            uiInputBgCustom: data.ui_input_bg_custom || defaultTheme.uiInputBgCustom,

            // Branding settings
            siteName: data.site_name || defaultTheme.siteName,
            siteLogoUrl: data.site_logo_url || defaultTheme.siteLogoUrl,
            faviconUrl: data.favicon_url || defaultTheme.faviconUrl,

            heroTitle: data.hero_title || defaultTheme.heroTitle,
            heroSubtitle: data.hero_subtitle || defaultTheme.heroSubtitle,
            heroCTAText: data.hero_cta_text || defaultTheme.heroCTAText,
            heroCTAUrl: data.hero_cta_url || defaultTheme.heroCTAUrl,

            heroMedia: data.hero_media ? JSON.parse(data.hero_media) : defaultTheme.heroMedia,

            footerCopyright: data.footer_copyright || defaultTheme.footerCopyright,
            footerAboutText: data.footer_about_text || defaultTheme.footerAboutText,

            socialLinks: {
              discord: data.social_discord || defaultTheme.socialLinks.discord,
              facebook: data.social_facebook || defaultTheme.socialLinks.facebook,
              youtube: data.social_youtube || defaultTheme.socialLinks.youtube,
              twitter: data.social_twitter || defaultTheme.socialLinks.twitter,
            },

            seoTitle: data.seo_title || defaultTheme.seoTitle,
            seoDescription: data.seo_description || defaultTheme.seoDescription,

            downloadUrl: data.download_url || defaultTheme.downloadUrl,

            // Backgrounds
            backgrounds: {
              login: data.bg_login ? JSON.parse(data.bg_login) : defaultTheme.backgrounds.login,
              register: data.bg_register ? JSON.parse(data.bg_register) : defaultTheme.backgrounds.register,
              hero: data.bg_hero ? JSON.parse(data.bg_hero) : defaultTheme.backgrounds.hero,
              page: data.bg_page ? JSON.parse(data.bg_page) : defaultTheme.backgrounds.page,
              sidebar: data.bg_sidebar ? JSON.parse(data.bg_sidebar) : defaultTheme.backgrounds.sidebar,
              global: data.bg_global ? JSON.parse(data.bg_global) : defaultTheme.backgrounds.global,
              heroContainer: data.bg_hero_container
                ? JSON.parse(data.bg_hero_container)
                : defaultTheme.backgrounds.heroContainer,
              account: data.bg_account ? JSON.parse(data.bg_account) : defaultTheme.backgrounds.account,
              admin: data.bg_admin ? JSON.parse(data.bg_admin) : defaultTheme.backgrounds.admin,
              serverInfo: data.bg_server_info ? JSON.parse(data.bg_server_info) : defaultTheme.backgrounds.serverInfo,
              news: data.bg_news ? JSON.parse(data.bg_news) : defaultTheme.backgrounds.news,
              rankings: data.bg_rankings ? JSON.parse(data.bg_rankings) : defaultTheme.backgrounds.rankings,
              download: data.bg_download ? JSON.parse(data.bg_download) : defaultTheme.backgrounds.download,
              guide: data.bg_guide ? JSON.parse(data.bg_guide) : defaultTheme.backgrounds.guide,
            },

            // Branding Opacity
            brandGoldOpacity: parseInt(data.brand_gold_opacity) || defaultTheme.brandGoldOpacity,
            brandBronzeOpacity: parseInt(data.brand_bronze_opacity) || defaultTheme.brandBronzeOpacity,
            brandDarkOpacity: parseInt(data.brand_dark_opacity) || defaultTheme.brandDarkOpacity,
            brandDarkGrayOpacity: parseInt(data.brand_dark_gray_opacity) || defaultTheme.brandDarkGrayOpacity,

            // UI Elements
            uiButtonPrimaryColor: data.ui_button_primary_color || defaultTheme.uiButtonPrimaryColor,
            uiButtonCustomColor: data.ui_button_custom_color || defaultTheme.uiButtonCustomColor,
            uiButtonOpacity: parseInt(data.ui_button_opacity) || defaultTheme.uiButtonOpacity,
            uiButtonBrightness: parseInt(data.ui_button_brightness) || defaultTheme.uiButtonBrightness,

            uiSliderColor: data.ui_slider_color || defaultTheme.uiSliderColor,
            uiSliderCustomColor: data.ui_slider_custom_color || defaultTheme.uiSliderCustomColor,
            uiSliderOpacity: parseInt(data.ui_slider_opacity) || defaultTheme.uiSliderOpacity,
            uiSliderBrightness: parseInt(data.ui_slider_brightness) || defaultTheme.uiSliderBrightness,

            uiScrollbarColor: data.ui_scrollbar_color || defaultTheme.uiScrollbarColor,
            uiScrollbarCustomColor: data.ui_scrollbar_custom_color || defaultTheme.uiScrollbarCustomColor,
            uiScrollbarOpacity: parseInt(data.ui_scrollbar_opacity) || defaultTheme.uiScrollbarOpacity,

            uiSelectionColor: data.ui_selection_color || defaultTheme.uiSelectionColor,
            uiSelectionCustomColor: data.ui_selection_custom_color || defaultTheme.uiSelectionCustomColor,
            uiSelectionOpacity: parseInt(data.ui_selection_opacity) || defaultTheme.uiSelectionOpacity,

            uiLinkColor: data.ui_link_color || defaultTheme.uiLinkColor,
            uiLinkCustomColor: data.ui_link_custom_color || defaultTheme.uiLinkCustomColor,
            uiLinkOpacity: parseInt(data.ui_link_opacity) || defaultTheme.uiLinkOpacity,

            uiTableStripeStrength: parseInt(data.ui_table_stripe_strength) || defaultTheme.uiTableStripeStrength,

            uiLoaderColor: data.ui_loader_color || defaultTheme.uiLoaderColor,
            uiLoaderCustomColor: data.ui_loader_custom_color || defaultTheme.uiLoaderCustomColor,

            activeTemplate: (data.active_template as TemplateId) || defaultTheme.activeTemplate,
          };

          // Validate color scheme
          if (!COLOR_SCHEMES[loadedTheme.colorScheme]) {
            loadedTheme.colorScheme = defaultTheme.colorScheme;
          }

          setTheme(loadedTheme);
          applyThemeToDOM(loadedTheme);
        }
      } catch (error) {
        console.warn('Failed to load theme settings, using defaults:', error);
        applyThemeToDOM(defaultTheme);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTheme();
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!isLoading) {
      applyThemeToDOM(theme);
    }
  }, [theme, isLoading]);

  const setColorScheme = (scheme: ColorSchemeId) => {
    setTheme((prev) => ({ ...prev, colorScheme: scheme }));
  };

  const setCustomColor = (key: keyof ThemeSettings['customColors'], value: string) => {
    setTheme((prev) => ({
      ...prev,
      customColors: { ...prev.customColors, [key]: value },
    }));
  };

  const setFontHeading = (font: string) => {
    setTheme((prev) => ({ ...prev, fontHeading: font }));
  };

  const setFontBody = (font: string) => {
    setTheme((prev) => ({ ...prev, fontBody: font }));
  };

  const setCardStylePreset = (preset: CardStylePresetId) => {
    setTheme((prev) => ({ ...prev, cardStylePreset: preset }));
  };

  const setCardSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: CardStylePresetId) => {
    const presetValues = CARD_STYLE_PRESETS[preset];
    setTheme((prev) => ({
      ...prev,
      cardStylePreset: preset,
      cardTransparency: presetValues.transparency,
      cardBlur: presetValues.blur,
      cardBorderRadius: presetValues.borderRadius as keyof typeof BORDER_RADIUS_OPTIONS,
      cardBorderWidth: presetValues.borderWidth as keyof typeof BORDER_WIDTH_OPTIONS,
      cardShadow: presetValues.shadow as keyof typeof SHADOW_OPTIONS,
    }));
  };

  const setBranding = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  const setBackground = (area: keyof ThemeSettings['backgrounds'], settings: Partial<BackgroundSettings>) => {
    setTheme((prev) => ({
      ...prev,
      backgrounds: {
        ...prev.backgrounds,
        [area]: { ...prev.backgrounds[area], ...settings },
      },
    }));
  };

  const setSocialLink = (platform: keyof ThemeSettings['socialLinks'], url: string) => {
    setTheme((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: url },
    }));
  };

  const setHeroMedia = (media: ThemeSettings['heroMedia']) => {
    setTheme((prev) => ({ ...prev, heroMedia: media }));
  };

  const setActiveTemplate = (templateId: TemplateId) => {
    setTheme((prev) => ({ ...prev, activeTemplate: templateId }));
  };

  const staticTemplate = TEMPLATES[theme.activeTemplate] || TEMPLATES['default'];

  // Helper to ensure full URL for assets
  const getFullAssetUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    return `${weburl}${path}`;
  };

  // Merge dynamic settings (images, etc.) into the active template assets
  const currentTemplate: TemplateDefinition = {
    ...staticTemplate,
    assets: {
      ...staticTemplate.assets,
      logo: theme.siteLogoUrl ? getFullAssetUrl(theme.siteLogoUrl) : staticTemplate.assets.logo,
      loginBackground: theme.backgrounds.login.url
        ? getFullAssetUrl(theme.backgrounds.login.url)
        : staticTemplate.assets.loginBackground,
      registerBackground: theme.backgrounds.register.url
        ? getFullAssetUrl(theme.backgrounds.register.url)
        : staticTemplate.assets.registerBackground,
      pageHeaderBackground: theme.backgrounds.page.url
        ? getFullAssetUrl(theme.backgrounds.page.url)
        : staticTemplate.assets.pageHeaderBackground,
      sidebarBackground: theme.backgrounds.sidebar.url
        ? getFullAssetUrl(theme.backgrounds.sidebar.url)
        : staticTemplate.assets.sidebarBackground,
      globalBackground: theme.backgrounds.global.url
        ? getFullAssetUrl(theme.backgrounds.global.url)
        : staticTemplate.assets.globalBackground,
      heroContainerBackground: theme.backgrounds.heroContainer.url
        ? getFullAssetUrl(theme.backgrounds.heroContainer.url)
        : staticTemplate.assets.heroContainerBackground,
      accountHeaderBackground: theme.backgrounds.account.url
        ? getFullAssetUrl(theme.backgrounds.account.url)
        : staticTemplate.assets.accountHeaderBackground,
      adminHeaderBackground: theme.backgrounds.admin.url
        ? getFullAssetUrl(theme.backgrounds.admin.url)
        : staticTemplate.assets.adminHeaderBackground,
      serverInfoHeaderBackground: theme.backgrounds.serverInfo.url
        ? getFullAssetUrl(theme.backgrounds.serverInfo.url)
        : staticTemplate.assets.serverInfoHeaderBackground,
      newsHeaderBackground: theme.backgrounds.news.url
        ? getFullAssetUrl(theme.backgrounds.news.url)
        : staticTemplate.assets.newsHeaderBackground,
      rankingsHeaderBackground: theme.backgrounds.rankings.url
        ? getFullAssetUrl(theme.backgrounds.rankings.url)
        : staticTemplate.assets.rankingsHeaderBackground,
      downloadHeaderBackground: theme.backgrounds.download.url
        ? getFullAssetUrl(theme.backgrounds.download.url)
        : staticTemplate.assets.downloadHeaderBackground,
      guideHeaderBackground: theme.backgrounds.guide.url
        ? getFullAssetUrl(theme.backgrounds.guide.url)
        : staticTemplate.assets.guideHeaderBackground,
    },
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setColorScheme,
        setCustomColor,
        setFontHeading,
        setFontBody,
        setCardStylePreset,
        setCardSetting,
        applyPreset,
        setBranding,
        setBackground,
        setSocialLink,
        setHeroMedia,
        setActiveTemplate,
        currentTemplate,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
