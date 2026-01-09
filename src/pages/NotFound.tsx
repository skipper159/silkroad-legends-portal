import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';

const NotFound = () => {
  const { currentTemplate, theme } = useTheme();
  const { Layout } = currentTemplate.components;
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <main
        className='flex-grow bg-cover bg-center flex items-center justify-center'
        style={{
          backgroundImage: `url('${currentTemplate.assets.loginBackground}')`,
        }}
      >
        <div className='text-center px-4'>
          <div className='card backdrop-blur-sm border-theme-primary/30 max-w-md mx-auto'>
            <h1 className='text-6xl font-bold mb-4 text-destructive'>404</h1>
            <p className='text-xl text-theme-text-muted mb-6'>
              This realm does not exist in the {theme.siteName} universe
            </p>
            <Button asChild className='btn-primary'>
              <Link to='/'>Return to the Known World</Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default NotFound;
