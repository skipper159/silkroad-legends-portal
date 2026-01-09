import { TemplateId } from '@/templates/registry';
import { CardStylePresetId } from './constants';
import {
  BORDER_RADIUS_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  SHADOW_OPTIONS,
} from './constants';

// Color scheme definitions
export type ColorSchemeId =
  | 'emerald-dark'
  | 'crimson-fire'
  | 'royal-purple'
  | 'ocean-blue'
  | 'gold-prestige'
  | 'custom';

// Background image settings interface
export interface BackgroundSettings {
  url: string;
  opacity: number; // 0-100
  overlayColor: string;
  overlayOpacity: number; // 0-100
  blur: number; // 0-20
}

// Extended theme settings interface
export interface ThemeSettings {
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

export interface ThemeContextType {
  theme: ThemeSettings;
  setColorScheme: (scheme: ColorSchemeId) => void;
  setCustomColor: (key: keyof ThemeSettings['customColors'], value: string) => void;
  setFontHeading: (font: string) => void;
  setFontBody: (font: string) => void;
  setCardStylePreset: (preset: CardStylePresetId) => void;
  setCardSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  applyPreset: (preset: CardStylePresetId) => void;
  setBranding: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  setBackground: (
    area: keyof ThemeSettings['backgrounds'],
    settings: Partial<BackgroundSettings>
  ) => void;
  setSocialLink: (platform: keyof ThemeSettings['socialLinks'], url: string) => void;
  setHeroMedia: (media: ThemeSettings['heroMedia']) => void;
  setActiveTemplate: (templateId: TemplateId) => void;
  currentTemplate: import('@/lib/template-system/types').TemplateDefinition;
  isLoading: boolean;
}
