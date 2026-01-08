import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { ArrowRight, Play } from 'lucide-react';

import { weburl } from '@/lib/api';

const HeroSection = () => {
  const { theme } = useTheme();

  const getBgUrl = (url: string) => {
    if (!url) return '/image/Web/top-player-bg.jpg';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `${weburl}${url}`;
  };

  const { currentTemplate } = useTheme();

  // Hero Image (inside the graphic slot)
  const heroImage = getBgUrl(theme.backgrounds.hero.url);
  const opacity = theme.backgrounds.hero.url ? theme.backgrounds.hero.opacity / 100 : 0.6;

  // Container Background (New request: "Area around the Hero Section")
  const containerBg = currentTemplate.assets.heroContainerBackground;
  // If no container bg, fallback to default theme surface
  const containerStyle = containerBg
    ? {
        backgroundImage: `url(${containerBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  return (
    <section
      className={`relative py-20 overflow-hidden rounded-3xl border border-theme-border ${
        !containerBg && 'bg-theme-surface'
      }`}
      style={containerStyle}
    >
      <div className="absolute inset-0 bg-[url('/bg-pattern.svg')] opacity-5"></div>
      <div className='absolute top-0 right-0 w-96 h-96 bg-theme-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>

      <div className='relative z-10 px-8 md:px-12 flex flex-col md:flex-row items-center gap-12'>
        <div className='md:w-1/2 space-y-8'>
          <div className='inline-block px-4 py-2 rounded-full bg-theme-highlight/10 text-theme-highlight text-xs font-bold tracking-wider uppercase border border-theme-highlight/20'>
            Season 4 Live Now
          </div>
          <h1 className='text-5xl md:text-7xl font-sans font-black tracking-tight text-theme-text leading-[0.9]'>
            {theme.heroTitle || 'Welcome'}
          </h1>
          <p className='text-theme-text-muted text-lg max-w-md leading-relaxed'>
            {theme.heroSubtitle || 'Experience the ultimate adventure on our private server.'}
          </p>
          <div className='flex flex-wrap gap-4'>
            <Button
              asChild
              className='bg-theme-primary hover:bg-theme-primary-hover text-white font-bold px-8 py-6 rounded-xl shadow-lg'
            >
              <Link to={theme.heroCTAUrl || '/download'} className='flex items-center gap-2'>
                {theme.heroCTAText || 'Download Client'} <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              asChild
              variant='outline'
              className='border-theme-border text-theme-text-muted hover:text-theme-text hover:bg-theme-surface px-8 py-6 rounded-xl'
            >
              <Link to='/register'>Create Account</Link>
            </Button>
          </div>
        </div>

        {/* Visual */}
        <div className='md:w-1/2 relative'>
          <div className='relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-theme-border bg-theme-background/50 shadow-2xl skew-y-3 transform transition hover:skew-y-0 duration-700'>
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='w-20 h-20 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-sm border border-white/10 cursor-pointer hover:scale-110 transition'>
                <Play size={32} className='fill-white text-white ml-1' />
              </div>
            </div>
            <img
              src={heroImage}
              alt='Trailer'
              className='w-full h-full object-cover mix-blend-overlay'
              style={{ opacity }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
