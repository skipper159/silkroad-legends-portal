import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { weburl } from '@/lib/api';
import { TEMPLATES } from '@/templates/registry';
import { TemplateDefinition } from '@/lib/template-system/types';
import { ThemeSettings, ThemeContextType, ColorSchemeId, BackgroundSettings } from './theme/types';
import {
  COLOR_SCHEMES,
  CARD_STYLE_PRESETS,
  FONTS,
  BORDER_RADIUS_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  SHADOW_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  CardStylePresetId,
} from './theme/constants';
import { defaultTheme } from './theme/defaults';
import { applyThemeToDOM } from './theme/utils';
import { TemplateId } from '@/templates/registry';

// Re-export types and constants for consumers
export type { ThemeSettings, ThemeContextType, ColorSchemeId, CardStylePresetId };
export {
  COLOR_SCHEMES,
  CARD_STYLE_PRESETS,
  BORDER_RADIUS_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  SHADOW_OPTIONS,
  BUTTON_STYLE_OPTIONS,
  FONTS,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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
