import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { weburl } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

interface FooterLink {
  id: number;
  title: string;
  url: string;
  image?: string;
  display_order: number;
}

interface FooterSections {
  quick_links?: boolean;
  community_links?: boolean;
  legal_links?: boolean;
}

interface HardcodedLinks {
  quick_links: Array<{ key: string; title: string; url: string; order: number }>;
  legal_links: Array<{ key: string; title: string; url: string; order: number }>;
}

const Footer = () => {
  const { theme } = useTheme();
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  const [hardcodedLinks, setHardcodedLinks] = useState<HardcodedLinks>({
    quick_links: [],
    legal_links: [],
  });
  const [sections, setSections] = useState<FooterSections>({
    quick_links: true,
    community_links: true,
    legal_links: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterLinks();
    fetchSections();
    fetchHardcodedLinks();
  }, []);

  const fetchHardcodedLinks = async () => {
    try {
      const response = await fetch(`${weburl}/api/footer-hardcoded-links`);
      const data = await response.json();

      if (data.success) {
        setHardcodedLinks(data.data);
      }
    } catch (error) {
      console.error('Error fetching hardcoded links:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await fetch(`${weburl}/api/footer-sections`);
      const data = await response.json();

      if (data.success) {
        setSections(data.data);
      }
    } catch (error) {
      console.error('Error fetching footer sections:', error);
    }
  };

  const fetchFooterLinks = async () => {
    try {
      const response = await fetch(`${weburl}/api/footer-links`);
      const data = await response.json();

      if (data.success) {
        setFooterLinks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching footer links:', error);
    } finally {
      setLoading(false);
    }
  };

  // Count visible sections to determine grid layout
  const visibleSectionsCount = [
    sections.quick_links,
    sections.community_links && footerLinks.length > 0,
    sections.legal_links,
  ].filter(Boolean).length;

  // Calculate grid class based on visible sections
  let gridClass = 'md:grid-cols-3'; // Default: description + 1 section
  if (visibleSectionsCount === 1) gridClass = 'md:grid-cols-3';
  if (visibleSectionsCount === 2) gridClass = 'md:grid-cols-4';
  if (visibleSectionsCount === 3) gridClass = 'md:grid-cols-5';

  return (
    <footer className='bg-lafftale-darkgray border-t border-lafftale-gold/20'>
      <div className='container mx-auto px-4 py-12'>
        <div className={`grid grid-cols-1 gap-8 ${gridClass}`}>
          <div className={footerLinks.length > 0 ? 'col-span-1 md:col-span-2' : 'col-span-1 md:col-span-2'}>
            <h3 className='text-2xl font-bold mb-4 text-lafftale-gold'>{theme.siteName}</h3>
            <p className='text-gray-400 mb-4 max-w-md'>
              Experience the revival of a classic MMORPG with upgraded features, balanced gameplay, and a thriving
              community. Begin your journey along the ancient Silkroad today.
            </p>
            <div className='flex space-x-4'>
              <a
                href='https://discord.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-lafftale-bronze transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M8.5 14.5A2.5 2.5 0 0 0 11 12c0-.5-.15-.968-.411-1.36a2.5 2.5 0 1 0-2.218 3.72.5.5 0 0 0 .129.14' />
                  <path d='M15.5 14.5a2.5 2.5 0 0 0 2.5-2.5c0-.5-.15-.968-.411-1.36a2.5 2.5 0 1 0-2.218 3.72.5.5 0 0 0 .129.14' />
                  <path d='M3 6.5h18' />
                  <path d='M3 17.5h18' />
                  <path d='M5 6.5l.5 11' />
                  <path d='M19 6.5l-.5 11' />
                </svg>
              </a>
              <a
                href='https://facebook.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-lafftale-bronze transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
                </svg>
              </a>
              <a
                href='https://youtube.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-gray-400 hover:text-lafftale-bronze transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' />
                  <path d='m10 15 5-3-5-3z' />
                </svg>
              </a>
            </div>
          </div>

          {sections.quick_links && (
            <div>
              <h4 className='text-lg font-bold mb-4 text-lafftale-gold'>Quick Links</h4>
              <ul className='space-y-2'>
                {hardcodedLinks.quick_links.length > 0 ? (
                  hardcodedLinks.quick_links.map((link) => (
                    <li key={link.key}>
                      <Link to={link.url} className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        {link.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link to='/' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link to='/download' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Download
                      </Link>
                    </li>
                    <li>
                      <Link to='/rankings' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Rankings
                      </Link>
                    </li>
                    <li>
                      <Link to='/server-info' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Server Info
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          {sections.community_links && footerLinks.length > 0 ? (
            <div>
              <h4 className='text-lg font-bold mb-4 text-lafftale-gold'>Community Links</h4>
              <ul className='space-y-2'>
                {footerLinks.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-gray-400 hover:text-lafftale-gold transition-colors flex items-center gap-2'
                    >
                      {link.image && (
                        <img
                          src={link.image.startsWith('http') ? link.image : `${weburl}${link.image}`}
                          alt={link.title}
                          className='w-5 h-5 object-contain'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      {link.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {sections.legal_links && (
            <div>
              <h4 className='text-lg font-bold mb-4 text-lafftale-gold'>Legal</h4>
              <ul className='space-y-2'>
                {hardcodedLinks.legal_links.length > 0 ? (
                  hardcodedLinks.legal_links.map((link) => (
                    <li key={link.key}>
                      <Link to={link.url} className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        {link.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link to='/terms' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Terms of Service
                      </Link>
                    </li>
                    <li>
                      <Link to='/privacy-policy' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Datenschutz
                      </Link>
                    </li>
                    <li>
                      <Link to='/rules' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Server Rules
                      </Link>
                    </li>
                    <li>
                      <Link to='/impressum' className='text-gray-400 hover:text-lafftale-gold transition-colors'>
                        Impressum
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className='border-t border-lafftale-gold/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='text-gray-500 text-sm'>
            &copy; {new Date().getFullYear()} {theme.siteName}. All rights reserved.
          </p>
          <p className='text-gray-500 text-sm mt-2 md:mt-0'>
            Silkroad Online is a registered trademark of Joymax Co., Ltd. This is a private server not affiliated with
            Joymax.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
