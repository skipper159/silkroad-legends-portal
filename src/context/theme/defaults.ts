import { ThemeSettings } from './types';

// Default background settings
const defaultBackgroundSettings = {
  url: '',
  opacity: 100,
  overlayColor: '#000000',
  overlayOpacity: 50,
  blur: 0,
};

export const defaultTheme: ThemeSettings = {
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
  footerAboutText:
    'Silkroad Legends is a private server dedicated to providing the best gaming experience.',
  // Social links defaults
  socialLinks: {
    discord: '',
    facebook: '',
    youtube: '',
    twitter: '',
  },
  // SEO defaults
  seoTitle: 'Silkroad Legends - Private Server',
  seoDescription:
    'Join the ultimate Silkroad Online experience on Silkroad Legends private server.',
  // Download
  downloadUrl: '',
  activeTemplate: 'modern-v2', // Default to Modern V2
};
