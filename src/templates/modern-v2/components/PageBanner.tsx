import { useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';

const PageBanner = () => {
  const { theme, currentTemplate } = useTheme();
  const location = useLocation();
  const path = location.pathname;

  // Determine which background to use based on path
  let bgUrl = currentTemplate.assets.pageHeaderBackground; // Default Fallback
  let bgSettings = theme.backgrounds?.page;

  if (path.startsWith('/news')) {
    bgUrl = currentTemplate.assets.newsHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.news || bgSettings;
  } else if (path.startsWith('/rankings')) {
    bgUrl = currentTemplate.assets.rankingsHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.rankings || bgSettings;
  } else if (path.startsWith('/download')) {
    bgUrl = currentTemplate.assets.downloadHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.download || bgSettings;
  } else if (path.startsWith('/server-info')) {
    bgUrl = currentTemplate.assets.serverInfoHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.serverInfo || bgSettings;
  } else if (path.startsWith('/user') || path.startsWith('/account') || path.startsWith('/donate')) {
    bgUrl = currentTemplate.assets.accountHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.account || bgSettings;
  } else if (path.startsWith('/admin') || path.startsWith('/silk-panel')) {
    bgUrl = currentTemplate.assets.adminHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.admin || bgSettings;
  } else if (path.startsWith('/guide')) {
    bgUrl = currentTemplate.assets.guideHeaderBackground || bgUrl;
    bgSettings = theme.backgrounds?.guide || bgSettings;
  }

  // If no specific or fallback image, don't render anything (or render minimal)
  if (!bgUrl) return null;

  return (
    <div className='relative h-64 w-full overflow-hidden rounded-b-3xl mb-8 border-b border-theme-border'>
      {/* Background Image */}
      <div
        className='absolute inset-0 bg-cover bg-center transition-all'
        style={{
          backgroundImage: `url(${bgUrl})`,
          filter: `blur(${bgSettings?.blur || 0}px)`,
          opacity: (bgSettings?.opacity || 100) / 100,
        }}
      />

      {/* Overlay */}
      <div
        className='absolute inset-0'
        style={{
          backgroundColor: bgSettings?.overlayColor || '#000000',
          opacity: (bgSettings?.overlayOpacity || 50) / 100,
        }}
      />

      {/* Content - Could be breadcrumbs or page title if passed as props */}
      <div className='relative z-10 h-full flex items-end p-8'>
        {/* Placeholder for dynamic title if we decide to pass it */}
      </div>
    </div>
  );
};

export default PageBanner;
