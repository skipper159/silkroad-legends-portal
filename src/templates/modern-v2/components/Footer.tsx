import { Link } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import { Facebook, Twitter, Youtube, MessageCircle } from 'lucide-react';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className='border-t border-theme-border bg-theme-background py-12 mt-auto'>
      <div className='container mx-auto px-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-8'>
          <div className='col-span-1 md:col-span-2'>
            <div className='flex items-center gap-2 mb-4'>
              <span className='text-2xl font-bold text-theme-text'>{theme.siteName}</span>
              <span className='text-xs px-2 py-0.5 rounded bg-theme-surface text-theme-text-muted'>Online</span>
            </div>
            <p className='text-theme-text-muted max-w-sm mb-6'>
              {theme.footerAboutText ||
                'A next-generation private server experience. Join thousands of players in the ultimate Silkroad journey.'}
            </p>
            <div className='flex gap-4'>
              {theme.socialLinks?.discord && (
                <a
                  href={theme.socialLinks.discord}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-theme-text-muted hover:text-theme-text transition-colors'
                >
                  <MessageCircle size={20} />
                </a>
              )}
              {theme.socialLinks?.facebook && (
                <a
                  href={theme.socialLinks.facebook}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-theme-text-muted hover:text-theme-text transition-colors'
                >
                  <Facebook size={20} />
                </a>
              )}
              {theme.socialLinks?.twitter && (
                <a
                  href={theme.socialLinks.twitter}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-theme-text-muted hover:text-theme-text transition-colors'
                >
                  <Twitter size={20} />
                </a>
              )}
              {theme.socialLinks?.youtube && (
                <a
                  href={theme.socialLinks.youtube}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-theme-text-muted hover:text-theme-text transition-colors'
                >
                  <Youtube size={20} />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className='font-bold text-theme-text mb-4'>Platform</h4>
            <ul className='space-y-2 text-sm text-theme-text-muted'>
              <li>
                <Link to='/download' className='hover:text-theme-primary transition-colors'>
                  Download Client
                </Link>
              </li>
              <li>
                <Link to='/register' className='hover:text-theme-primary transition-colors'>
                  Create Account
                </Link>
              </li>
              <li>
                <Link to='/rankings' className='hover:text-theme-primary transition-colors'>
                  Rankings
                </Link>
              </li>
              <li>
                <Link to='/server-info' className='hover:text-theme-primary transition-colors'>
                  Server Info
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className='font-bold text-theme-text mb-4'>Support</h4>
            <ul className='space-y-2 text-sm text-theme-text-muted'>
              <li>
                <Link to='/guide' className='hover:text-theme-primary transition-colors'>
                  Game Guide
                </Link>
              </li>
              <li>
                <Link to='/rules' className='hover:text-theme-primary transition-colors'>
                  Server Rules
                </Link>
              </li>
              <li>
                <Link to='/terms' className='hover:text-theme-primary transition-colors'>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to='/privacy-policy' className='hover:text-theme-primary transition-colors'>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-theme-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-theme-text-muted'>
          <p>{theme.footerCopyright || `© ${new Date().getFullYear()} ${theme.siteName}. All rights reserved.`}</p>
          <p className='mt-2 md:mt-0'>Not affiliated with Joymax Co., Ltd.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
