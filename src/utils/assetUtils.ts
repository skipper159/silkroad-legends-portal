/**
 * Asset URL utilities for handling development and production environments
 */

/**
 * Generate a complete asset URL for the given path
 * @param assetPath - Relative path to the asset (e.g., 'assets/chars/char_ch_man1.png')
 * @returns Complete URL to the asset
 */
export const getAssetUrl = (assetPath: string): string => {
  // Remove leading slash if present and collapse any repeated slashes to avoid internal '//' sequences
  let cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
  // Collapse multiple slashes (e.g. 'assets/items//Premium///etc' -> 'assets/items/Premium/etc')
  cleanPath = cleanPath.replace(/\/+/g, '/');

  // In development mode
  if (import.meta.env.DEV) {
    // Check if custom dev URL is set
    const devAssetUrl = import.meta.env.VITE_ASSETS_DEV_URL;
    if (devAssetUrl) {
      const baseUrl = devAssetUrl.endsWith('/') ? devAssetUrl.slice(0, -1) : devAssetUrl;
      return `${baseUrl}/${cleanPath}`;
    }

    // For localhost:8080 (your dev setup), assets are served from root
    const currentOrigin = window.location.origin;
    if (currentOrigin.includes('8080')) {
      return `${currentOrigin}/${cleanPath}`;
    } else {
      // Standard Vite dev server (5173)
      return `/${cleanPath}`;
    }
  }

  // In production, use configured base URL
  const baseUrl = import.meta.env.VITE_ASSETS_weburl || import.meta.env.VITE_API_weburl || '';

  if (baseUrl) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${cleanPath}`;
  }

  // Fallback to relative path
  return `/${cleanPath}`;
};

/**
 * Generate URL for files in the /image directory (SRO game assets)
 * @param imagePath - Path relative to image directory (e.g., 'sro/item/icon.png')
 * @returns Complete URL to the image
 */
export const getImageUrl = (imagePath: string): string => {
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return getAssetUrl(`image/${cleanPath}`);
};

/**
 * Generate URL for files in the /images directory (web assets like logos)
 * @param imagePath - Path relative to images directory (e.g., 'logos/lafftale.png')
 * @returns Complete URL to the image
 */
export const getWebImageUrl = (imagePath: string): string => {
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return getAssetUrl(`image/${cleanPath}`);
};

/**
 * Generate URL for SRO game interface elements in /image/sro/interface/
 * @param category - Interface category (e.g., 'equipment', 'inventory')
 * @param filename - Interface element filename
 * @returns Complete URL to interface element
 */
export const getSROInterfaceUrl = (category: string, filename: string): string => {
  return getImageUrl(`sro/interface/${category}/${filename}`);
};

/**
 * Generate URL for SRO game effects and animations in /image/sro/
 * @param effectPath - Path relative to sro directory (e.g., 'SOX.gif', 'seal.gif')
 * @returns Complete URL to SRO effect
 */
export const getSROEffectUrl = (effectPath: string): string => {
  return getImageUrl(`sro/${effectPath}`);
};

/**
 * Generate URL for files in the public directory (legacy compatibility)
 * @param publicPath - Path relative to public directory (e.g., 'images/logo.png', 'image/sro/item.png')
 * @returns Complete URL to public file
 */
export const getPublicUrl = (publicPath: string): string => {
  // Remove leading slash if present
  const cleanPath = publicPath.startsWith('/') ? publicPath.substring(1) : publicPath;

  // In development
  if (import.meta.env.DEV) {
    const devAssetUrl = import.meta.env.VITE_ASSETS_DEV_URL;
    if (devAssetUrl) {
      const baseUrl = devAssetUrl.endsWith('/') ? devAssetUrl.slice(0, -1) : devAssetUrl;
      return `${baseUrl}/${cleanPath}`;
    }
    const currentOrigin = window.location.origin;
    return `${currentOrigin}/${cleanPath}`;
  }

  // In production
  const baseUrl = import.meta.env.VITE_ASSETS_weburl || import.meta.env.VITE_API_weburl || '';

  if (baseUrl) {
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${cleanPath}`;
  }

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
  // Normalize category and filename to avoid double slashes when category is empty
  const cleanCategory = category ? `${category.replace(/^\/+|\/+$/g, '')}/` : '';
  const cleanFilename = filename.startsWith('/') ? filename.substring(1) : filename;
  return getAssetUrl(`assets/items/${cleanCategory}${cleanFilename}`);
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
