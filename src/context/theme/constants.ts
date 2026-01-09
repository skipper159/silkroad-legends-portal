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
    {
      id: 'Playfair Display',
      name: 'Playfair Display',
      googleFont: 'Playfair+Display:wght@700;800;900',
    },
    { id: 'Cinzel', name: 'Cinzel', googleFont: 'Cinzel:wght@600;700;800' },
    { id: 'Oswald', name: 'Oswald', googleFont: 'Oswald:wght@600;700' },
  ],
  body: [
    { id: 'Inter', name: 'Inter', googleFont: 'Inter:wght@400;500;600' },
    { id: 'Roboto', name: 'Roboto', googleFont: 'Roboto:wght@400;500;700' },
    { id: 'Open Sans', name: 'Open Sans', googleFont: 'Open+Sans:wght@400;500;600' },
    { id: 'Lato', name: 'Lato', googleFont: 'Lato:wght@400;700' },
    {
      id: 'Source Sans Pro',
      name: 'Source Sans Pro',
      googleFont: 'Source+Sans+3:wght@400;500;600',
    },
    { id: 'Nunito', name: 'Nunito', googleFont: 'Nunito:wght@400;500;600;700' },
  ],
};
