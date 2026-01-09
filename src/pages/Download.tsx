import DownloadSection from '@/components/DownloadSection';
import { useTheme } from '@/context/ThemeContext';

const Download = () => {
  const { currentTemplate, theme } = useTheme();
  const { Layout, PageBanner } = currentTemplate.components;

  return (
    <Layout>
      {PageBanner ? (
        <PageBanner
          title={
            (
              <>
                Download <span className='text-theme-accent font-cinzel font-bold'>{theme.siteName}</span>
              </>
            ) as any
          }
          subtitle='Get ready to embark on your journey through the ancient Silkroad. Download our game client or launcher and start your adventure today.'
        />
      ) : (
        /* Fallback for templates without PageBanner */
        <div
          className='py-12 bg-cover bg-center'
          style={{
            backgroundImage: `url('${currentTemplate.assets.pageHeaderBackground}')`,
          }}
        >
          <div className='container mx-auto px-4 text-center'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
              Download <span className='text-theme-accent font-cinzel text-4xl font-bold'>{theme.siteName}</span>
            </h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
              Get ready to embark on your journey through the ancient Silkroad. Download our game client or launcher and
              start your adventure today.
            </p>
          </div>
        </div>
      )}
      <hr></hr>

      <DownloadSection />
    </Layout>
  );
};

export default Download;
