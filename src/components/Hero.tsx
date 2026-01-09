import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Hero = () => {
  const { theme } = useTheme();
  return (
    <div className='bg-hero-pattern bg-cover bg-center min-h-[calc(100vh-4rem)] flex items-center justify-center'>
      <div className='container mx-auto px-4 py-28 text-center'>
        <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in'>
          Experience <span className='text-theme-accent'>{theme.siteName}</span>
        </h1>
        <p className='text-lg md:text-xl max-w-2xl mx-auto mb-10 text-theme-text-muted'>
          Journey through the ancient Silkroad, discover mystical powers, and forge legendary alliances in the ultimate
          MMORPG experience.
        </p>
        <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
          <Button asChild className='btn-primary w-48 h-14 text-lg'>
            <Link to='/download'>
              Play Now <ChevronRight className='ml-2' size={20} />
            </Link>
          </Button>
          <Button asChild variant='outline' className='btn-outline w-48 h-14 text-lg'>
            <Link to='/register'>Register</Link>
          </Button>
        </div>
        <div className='mt-16 animate-float'>
          <div className='bg-theme-surface/60 backdrop-blur-sm w-fit mx-auto px-6 py-3 rounded-lg border border-theme-primary/20'>
            <p className='text-theme-accent font-medium'>
              <span className='font-bold'>250+</span> Players Online Now
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
