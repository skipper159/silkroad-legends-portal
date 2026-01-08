import { Link } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  return (
    <header className='h-16 border-b border-theme-border bg-theme-background/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40'>
      {/* Mobile Toggle */}
      <div className='md:hidden'>
        <Button variant='ghost' size='icon' className='text-theme-text-muted'>
          <Menu />
        </Button>
      </div>

      {/* Search Area */}
      <div className='hidden md:flex items-center gap-4 flex-1 max-w-md'>
        <div className='relative w-full'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-theme-text-muted' />
          <Input
            type='search'
            placeholder='Search news, players...'
            className='w-full bg-theme-surface border-theme-border focus:border-theme-primary/50 focus:ring-theme-primary/20 rounded-full pl-9 h-9'
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className='flex items-center gap-4'>
        <Button
          variant='ghost'
          size='icon'
          className='text-theme-text-muted hover:text-theme-primary hover:bg-theme-primary/10 rounded-full relative'
        >
          <Bell size={20} />
          <span className='absolute top-2 right-2.5 w-2 h-2 bg-theme-primary rounded-full'></span>
        </Button>

        {/* Play Button */}
        <Link to='/download'>
          <Button className='bg-theme-primary hover:bg-theme-primary-hover text-white rounded-full font-semibold shadow-lg'>
            Play Now
          </Button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
