import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { ArrowRight, Play, ChevronLeft, ChevronRight } from 'lucide-react';

import { weburl } from '@/lib/api';

const HeroSection = () => {
  const { theme, currentTemplate } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  const getBgUrl = (url: string) => {
    if (!url) return '/image/Web/top-player-bg.jpg';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return `${weburl}${url}`;
  };

  // Get YouTube video ID from URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Filter valid media items
  const mediaItems = theme.heroMedia.filter((item) => item.url && item.url.trim() !== '');

  // Auto-advance slider only for images (not for videos)
  useEffect(() => {
    if (mediaItems.length > 1 && mediaItems.every((m) => m.type === 'image')) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % mediaItems.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mediaItems.length]);

  // Hero Image fallback (inside the graphic slot)
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

  // Render the hero media content
  const renderHeroMedia = () => {
    // Check if there's a YouTube video in heroMedia
    const youtubeItem = mediaItems.find((item) => item.type === 'youtube');
    if (youtubeItem) {
      const videoId = getYouTubeId(youtubeItem.url);
      if (videoId) {
        return (
          <div className='relative aspect-video rounded-2xl overflow-hidden border border-theme-border bg-theme-background/50 shadow-2xl'>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
              title='Hero Video'
              className='w-full h-full'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
              allowFullScreen
            />
          </div>
        );
      }
    }

    // Check if there are multiple images for slider
    const imageItems = mediaItems.filter((item) => item.type === 'image');
    if (imageItems.length > 1) {
      return (
        <div className='relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-theme-border bg-theme-background/50 shadow-2xl'>
          {/* Slider Images */}
          {imageItems.map((item, index) => (
            <img
              key={index}
              src={getBgUrl(item.url)}
              alt={`Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Slider Controls */}
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + imageItems.length) % imageItems.length)}
            className='absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition z-10'
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % imageItems.length)}
            className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition z-10'
          >
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators */}
          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
            {imageItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </div>
      );
    }

    // Single image or fallback
    if (imageItems.length === 1) {
      return (
        <div className='relative aspect-square md:aspect-video rounded-2xl overflow-hidden border border-theme-border bg-theme-background/50 shadow-2xl skew-y-3 transform transition hover:skew-y-0 duration-700'>
          <img src={getBgUrl(imageItems[0].url)} alt='Hero' className='w-full h-full object-cover' />
        </div>
      );
    }

    // Fallback to original hero background
    return (
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
    );
  };

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
        <div className='md:w-1/2 relative'>{renderHeroMedia()}</div>
      </div>
    </section>
  );
};

export default HeroSection;
