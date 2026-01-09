import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  X,
  Home,
  Newspaper,
  TrendingUp,
  Info,
  HelpCircle,
  Download,
  User,
  LogOut,
  LayoutDashboard,
  Swords,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { weburl } from '@/lib/api';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'Rankings', path: '/rankings', icon: TrendingUp },
    { name: 'Server Specs', path: '/server-info', icon: Info },
    { name: 'Guide', path: '/guide', icon: HelpCircle },
    { name: 'Download', path: '/download', icon: Download },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header className='h-16 border-b border-theme-border bg-theme-background/80 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40'>
        {/* Mobile Toggle */}
        <div className='md:hidden'>
          <Button
            variant='ghost'
            size='icon'
            className='text-theme-text-muted'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className='md:hidden fixed inset-0 z-50'>
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' onClick={closeMobileMenu} />

          {/* Slide-in Panel */}
          <aside className='absolute left-0 top-0 h-full w-72 bg-theme-background border-r border-theme-border shadow-2xl animate-slide-in-left overflow-y-auto'>
            {/* Logo/Close Area */}
            <div className='h-16 flex items-center justify-between px-4 border-b border-theme-border'>
              <Link to='/' onClick={closeMobileMenu} className='flex items-center gap-2'>
                {theme.siteLogoUrl ? (
                  <img
                    src={`${weburl}${theme.siteLogoUrl}`}
                    alt={theme.siteName}
                    className='h-8 max-w-[120px] object-contain'
                  />
                ) : (
                  <span className='text-xl font-bold text-theme-primary'>{theme.siteName}</span>
                )}
              </Link>
              <Button variant='ghost' size='icon' onClick={closeMobileMenu}>
                <X className='h-5 w-5' />
              </Button>
            </div>

            {/* Navigation */}
            <nav className='p-4 space-y-1'>
              <div className='text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-4 mt-2 px-2'>
                Menu
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-theme-primary/10 text-theme-primary border border-theme-primary/20'
                        : 'hover:bg-theme-surface hover:text-theme-text'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={active ? 'text-theme-primary' : 'text-theme-text-muted group-hover:text-theme-text'}
                    />
                    <span className='font-medium'>{item.name}</span>
                  </Link>
                );
              })}

              {/* User Section */}
              <div className='text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-4 mt-8 px-2'>
                Account
              </div>

              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to='/AdminDashboard'
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                        isActive('/AdminDashboard')
                          ? 'text-theme-accent bg-theme-accent/10'
                          : 'hover:bg-theme-surface text-theme-accent/80 hover:text-theme-accent'
                      }`}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                  )}
                  <Link
                    to='/account'
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/account') ? 'text-theme-primary bg-theme-primary/10' : 'hover:bg-theme-surface'
                    }`}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                    className='w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 text-theme-text-muted hover:text-red-400 transition-colors text-left'
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to='/login'
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/login') ? 'text-theme-primary' : 'hover:bg-theme-surface'
                    }`}
                  >
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to='/register'
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive('/register') ? 'text-theme-primary' : 'hover:bg-theme-surface'
                    }`}
                  >
                    <Swords size={18} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export default Header;
