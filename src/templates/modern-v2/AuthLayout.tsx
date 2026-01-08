import { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';

interface LayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: LayoutProps) => {
  const { currentTemplate, theme } = useTheme();
  const globalBg = currentTemplate.assets.globalBackground;
  const bgSettings = theme.backgrounds?.global || {
    opacity: 100,
    overlayColor: '#000000',
    overlayOpacity: 50,
    blur: 0,
  };

  return (
    <div className='min-h-screen bg-theme-background text-theme-text font-sans flex flex-col relative'>
      {/* Global Background Layer */}
      {globalBg && (
        <div
          className='fixed inset-0 z-0 bg-cover bg-center pointer-events-none'
          style={{
            backgroundImage: `url(${globalBg})`,
            filter: `blur(${bgSettings.blur}px)`,
            opacity: bgSettings.opacity / 100,
          }}
        />
      )}

      {/* Global Overlay (if needed or independent of image) */}
      <div
        className='fixed inset-0 z-0 pointer-events-none'
        style={{
          backgroundColor: globalBg ? bgSettings.overlayColor : 'transparent',
          opacity: globalBg ? bgSettings.overlayOpacity / 100 : 0,
        }}
      />

      {/* Full width header */}
      <Header />

      {/* Main Content - Full width, centered */}
      <main className='flex-1 flex flex-col relative w-full z-10'>{children}</main>

      <Footer />
    </div>
  );
};

export default AuthLayout;
