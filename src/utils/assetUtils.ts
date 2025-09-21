/**
 * Asset URL utilities for handling development and production environments
 */

/**
 * Generate a complete asset URL for the given path
 * @param assetPath - Relative path to the asset (e.g., 'assets/chars/char_ch_man1.png')
 * @returns Complete URL to the asset
 */
export const getAssetUrl = (assetPath: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;

  // In development mode
  if (import.meta.env.DEV) {
    // Check if custom dev URL is set
    const devAssetUrl = import.meta.env.VITE_ASSETS_DEV_URL;
    if (devAssetUrl) {
      return `${devAssetUrl}/${cleanPath}`;
    }

    // Fallback: detect port and handle accordingly
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('8080')) {
      return `${currentOrigin}/public/${cleanPath}`;
    } else {
      // Standard Vite dev server (5173)
      return `/${cleanPath}`;
    }
  }

  // In production, use configured base URL
  const baseUrl = import.meta.env.VITE_ASSETS_weburl || import.meta.env.VITE_API_weburl || '';

  if (baseUrl) {
    return `${baseUrl}/${cleanPath}`;
  }

  // Fallback to relative path
  return `/${cleanPath}`;
};

/**
 * Get interface element URL (equipment, inventory, etc.)
 * @param category - 'equipment' or 'inventory'
 * @param filename - Interface element filename
 * @returns Complete URL to interface element
 */
export const getInterfaceUrl = (category: string, filename: string): string => {
  return getAssetUrl(`assets/interface/${category}/${filename}`);
};

/**
 * Get character portrait URL
 * @param race - 'ch' for Chinese, 'eu' for European
 * @param gender - 'm' for male, 'f' for female
 * @param model - Model number (1-13)
 * @returns Complete URL to character portrait
 */
export const getCharacterImageUrl = (
  race: 'ch' | 'eu',
  gender: 'm' | 'f',
  model: number
): string => {
  const genderName = gender === 'm' ? 'man' : 'woman';
  const filename = `char_${race}_${genderName}${model}.png`;
  return getAssetUrl(`assets/chars/${filename}`);
};

/**
 * Get race icon URL
 * @param race - 'china' or 'europe'
 * @returns Complete URL to race icon
 */
export const getRaceIconUrl = (race: 'china' | 'europe'): string => {
  return getAssetUrl(`assets/race/${race}.png`);
};

/**
 * Get job icon URL
 * @param jobType - 'hunter', 'merchant', 'thief', 'trader'
 * @returns Complete URL to job icon
 */
export const getJobIconUrl = (jobType: 'hunter' | 'merchant' | 'thief' | 'trader'): string => {
  return getAssetUrl(`assets/job/${jobType}.png`);
};

/**
 * Get item icon URL
 * @param category - Item category ('china', 'europe', 'common', etc.)
 * @param filename - Item filename
 * @returns Complete URL to item icon
 */
export const getItemIconUrl = (category: string, filename: string): string => {
  return getAssetUrl(`assets/items/${category}/${filename}`);
};

/**
 * Get UI element URL
 * @param filename - UI element filename
 * @returns Complete URL to UI element
 */
export const getUIElementUrl = (filename: string): string => {
  return getAssetUrl(`assets/ui/${filename}`);
};

/**
 * Environment-aware asset configuration
 */
export const assetConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: !import.meta.env.DEV,
  // In development, assets are served from Vite dev server root
  // In production, they can be served from CDN or custom domain
  getBaseUrl: () => {
    if (import.meta.env.DEV) {
      return window.location.origin; // http://localhost:5173
    }
    return (
      import.meta.env.VITE_ASSETS_weburl ||
      import.meta.env.VITE_API_weburl ||
      window.location.origin
    );
  },
};
