import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { weburl } from '@/lib/api';
import {
  Home,
  Newspaper,
  TrendingUp,
  Info,
  HelpCircle,
  Download,
  LayoutDashboard,
  User,
  LogOut,
  Swords,
} from 'lucide-react';

const Sidebar = ({ className }: { className?: string }) => {
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { theme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  // Modern V2 Sidebar Navigation Items
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'Rankings', path: '/rankings', icon: TrendingUp },
    { name: 'Server Specs', path: '/server-info', icon: Info },
    { name: 'Guide', path: '/guide', icon: HelpCircle },
    { name: 'Download', path: '/download', icon: Download },
  ];

  return (
    <aside className={`bg-theme-background border-r border-theme-border text-theme-text-muted ${className}`}>
      {/* Logo Area */}
      <div className='h-20 flex items-center justify-center border-b border-theme-border/50'>
        <Link to='/' className='flex items-center gap-2'>
          {theme.siteLogoUrl ? (
            <img
              src={`${weburl}${theme.siteLogoUrl}`}
              alt={theme.siteName}
              className='h-10 max-w-[140px] object-contain'
            />
          ) : (
            <span className='text-2xl font-bold text-theme-primary'>{theme.siteName}</span>
          )}
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
        <div className='text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-4 mt-2 px-2'>Menu</div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
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
        <div className='text-xs font-medium text-theme-text-muted uppercase tracking-wider mb-4 mt-8 px-2'>Account</div>

        {isAuthenticated ? (
          <>
            {isAdmin && (
              <Link
                to='/AdminDashboard'
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive('/account') ? 'text-theme-primary bg-theme-primary/10' : 'hover:bg-theme-surface'
              }`}
            >
              <User size={18} />
              <span>My Profile</span>
            </Link>
            <button
              onClick={() => logout()}
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive('/login') ? 'text-theme-primary' : 'hover:bg-theme-surface'
              }`}
            >
              <User size={18} />
              <span>Login</span>
            </Link>
            <Link
              to='/register'
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

      {/* Footer in Sidebar */}
      <div className='p-4 border-t border-theme-border'>
        <div className='text-xs text-theme-text-muted text-center'>
          &copy; {new Date().getFullYear()} {theme.siteName}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
