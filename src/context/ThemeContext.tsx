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
  // === NEW: Hero Section Text ===
  heroTitle: string;
  heroSubtitle: string;
  heroCTAText: string;
  heroCTAUrl: string;
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
            },
            fontHeading: data.font_heading || defaultTheme.fontHeading,
            fontBody: data.font_body || defaultTheme.fontBody,
            cardStylePreset: (data.card_style_preset as CardStylePresetId) || defaultTheme.cardStylePreset,
            cardTransparency: parseInt(data.card_transparency) || defaultTheme.cardTransparency,
            cardBlur: parseInt(data.card_blur) || defaultTheme.cardBlur,
            cardBorderRadius: data.card_border_radius || defaultTheme.cardBorderRadius,
            cardBorderWidth: data.card_border_width || defaultTheme.cardBorderWidth,
            cardShadow: data.card_shadow || defaultTheme.cardShadow,
            buttonStyle: data.button_style || defaultTheme.buttonStyle,
            buttonBorderRadius: data.button_border_radius || defaultTheme.buttonBorderRadius,
            enableAnimations: data.enable_animations !== 'false',
            enableGlow: data.enable_glow === 'true',
            // Branding
            siteName: data.site_name || defaultTheme.siteName,
            siteLogoUrl: data.site_logo_url || defaultTheme.siteLogoUrl,
            faviconUrl: data.favicon_url || defaultTheme.faviconUrl,
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
            // Hero text
            heroTitle: data.hero_title || defaultTheme.heroTitle,
            heroSubtitle: data.hero_subtitle || defaultTheme.heroSubtitle,
            heroCTAText: data.hero_cta_text || defaultTheme.heroCTAText,
            heroCTAUrl: data.hero_cta_url || defaultTheme.heroCTAUrl,
            // Footer
            footerCopyright: data.footer_copyright || defaultTheme.footerCopyright,
            footerAboutText: data.footer_about_text || defaultTheme.footerAboutText,
            // Social
            socialLinks: {
              discord: data.social_discord || defaultTheme.socialLinks.discord,
              facebook: data.social_facebook || defaultTheme.socialLinks.facebook,
              youtube: data.social_youtube || defaultTheme.socialLinks.youtube,
              twitter: data.social_twitter || defaultTheme.socialLinks.twitter,
            },
            // SEO
            seoTitle: data.seo_title || defaultTheme.seoTitle,
            seoDescription: data.seo_description || defaultTheme.seoDescription,
            // Download
            downloadUrl: data.download_url || defaultTheme.downloadUrl,
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
