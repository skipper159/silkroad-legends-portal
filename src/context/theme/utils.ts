import { ThemeSettings } from './types';
import {
  COLOR_SCHEMES,
  FONTS,
  BORDER_RADIUS_OPTIONS,
  BORDER_WIDTH_OPTIONS,
  SHADOW_OPTIONS,
} from './constants';

// Load Google Font dynamically
export const loadGoogleFont = (fontFamily: string, weights: string) => {
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(fontId)) return;

  const link = document.createElement('link');
  link.id = fontId;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${weights}&display=swap`;
  document.head.appendChild(link);
};

// Helper: Convert Hex + Opacity + Brightness to HSLA
export const getHslaValue = (hex: string, opacity = 100, brightness = 0): string => {
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
  if (brightness !== 0) {
    if (brightness > 0) {
      // Lighten
      l = l + (1 - l) * (brightness / 100);
    } else {
      // Darken
      l = l + l * (brightness / 100);
    }
  }

  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);
  const alpha = opacity / 100;

  return `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${alpha})`;
};

// Helper: Convert hex to RGB (comma separated)
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

// Helper: Convert hex to RGB (space separated) for Tailwind opacity support
export const hexToRgbSpaced = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '212 175 55'; // fallback gold
  return `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`;
};

// Helper: Convert hex to HSL
export const hexToHsl = (hex: string): string => {
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

// Helper: Resolve Color Choice
export const resolveColor = (
  theme: ThemeSettings,
  mode: 'primary' | 'gold' | 'bronze' | 'custom' | 'border' | 'text',
  customValue: string,
  colors: any
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

// Apply CSS variables to document
export const applyThemeToDOM = (theme: ThemeSettings) => {
  const root = document.documentElement;

  // Get colors (use custom if colorScheme is 'custom', otherwise use preset)
  const colors =
    theme.colorScheme === 'custom' ? theme.customColors : COLOR_SCHEMES[theme.colorScheme];

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

  // Branding Colors
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

  root.style.setProperty('--border', hexToHsl(borderColorHex));
  root.style.setProperty('--input', hexToHsl(borderColorHex));
  root.style.setProperty('--ui-border-color-rgb', borderColorRgb);
  root.style.setProperty('--ui-border-opacity', String(borderOpacityDecimal));

  // Border width mapping
  const borderWidthMap = {
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '3px',
  };
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
  root.style.setProperty(
    '--theme-card-radius',
    BORDER_RADIUS_OPTIONS[theme.cardBorderRadius].value
  );
  root.style.setProperty(
    '--theme-card-border-width',
    BORDER_WIDTH_OPTIONS[theme.cardBorderWidth].value
  );
  root.style.setProperty('--theme-card-shadow', SHADOW_OPTIONS[theme.cardShadow].value);

  // Apply button styling
  root.style.setProperty(
    '--theme-button-radius',
    BORDER_RADIUS_OPTIONS[theme.buttonBorderRadius].value
  );
  root.style.setProperty('--theme-button-style', theme.buttonStyle);

  // Apply effects
  root.style.setProperty('--theme-transition-speed', theme.enableAnimations ? '200ms' : '0ms');
  root.style.setProperty('--theme-glow-enabled', theme.enableGlow ? '1' : '0');

  // Load Google Fonts
  const headingFont = FONTS.headings.find((f) => f.id === theme.fontHeading);
  const bodyFont = FONTS.body.find((f) => f.id === theme.fontBody);

  // UI Elements Variables

  // 1. Buttons
  const btnColor = resolveColor(
    theme,
    theme.uiButtonPrimaryColor,
    theme.uiButtonCustomColor,
    colors
  );
  root.style.setProperty(
    '--theme-btn-bg',
    getHslaValue(btnColor, theme.uiButtonOpacity, theme.uiButtonBrightness)
  );

  // 2. Sliders
  const sliderColor = resolveColor(theme, theme.uiSliderColor, theme.uiSliderCustomColor, colors);
  root.style.setProperty(
    '--theme-slider-thumb',
    getHslaValue(sliderColor, theme.uiSliderOpacity, theme.uiSliderBrightness)
  );

  // 3. Scrollbars
  const scrollColor = resolveColor(
    theme,
    theme.uiScrollbarColor,
    theme.uiScrollbarCustomColor,
    colors
  );
  root.style.setProperty(
    '--theme-scrollbar-thumb',
    getHslaValue(scrollColor, theme.uiScrollbarOpacity, 0)
  );

  // 4. Selection
  const selectColor = resolveColor(
    theme,
    theme.uiSelectionColor,
    theme.uiSelectionCustomColor,
    colors
  );
  root.style.setProperty(
    '--theme-selection-bg',
    getHslaValue(selectColor, theme.uiSelectionOpacity, 0)
  );

  // 5. Links
  const linkColor = resolveColor(theme, theme.uiLinkColor as any, theme.uiLinkCustomColor, colors);
  root.style.setProperty('--theme-link-color', getHslaValue(linkColor, theme.uiLinkOpacity, 0));

  // 6. Tables (Zebra)
  root.style.setProperty(
    '--theme-table-stripe',
    `rgba(255, 255, 255, ${theme.uiTableStripeStrength / 100})`
  );

  // 7. Loaders
  const loaderColor = resolveColor(theme, theme.uiLoaderColor, theme.uiLoaderCustomColor, colors);
  root.style.setProperty('--theme-loader-color', getHslaValue(loaderColor, 100, 0));

  if (headingFont) loadGoogleFont(headingFont.id, headingFont.googleFont);
  if (bodyFont) loadGoogleFont(bodyFont.id, bodyFont.googleFont);
};
