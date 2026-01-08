import DownloadSection from '@/components/DownloadSection';
import ActiveTemplate from '@/config/theme-config';

const { Layout } = ActiveTemplate.components;

const Download = () => {
  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6'>
            Download <span className='text-theme-accent font-cinzel text-4xl font-bold'>Lafftale</span>
          </h1>
          <p className='text-lg max-w-2xl mx-auto mb-10 text-theme-text-muted'>
            Get ready to embark on your journey through the ancient Silkroad. Download our game client or launcher and
            start your adventure today.
          </p>
        </div>
      </div>
      <hr></hr>

      <DownloadSection />
    </Layout>
  );
};

export default Download;
