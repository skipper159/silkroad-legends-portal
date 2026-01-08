import ActiveTemplate from '@/config/theme-config';
import { Card, CardContent } from '@/components/ui/card';

const { Layout } = ActiveTemplate.components;

const Impressum = () => {
  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${ActiveTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <div className='bg-black/50 p-6 rounded-lg inline-block backdrop-blur-sm'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white'>Impressum</h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-gray-200'>Legal Information / Anbieterkennzeichnung</p>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <Card className='bg-lafftale-dark/80 border-lafftale-gold/20 backdrop-blur-sm'>
          <CardContent className='p-8 space-y-6 text-gray-300'>
            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>Angaben gemäß § 5 TMG</h2>
              <p className='mb-2'>Max Mustermann</p>
              <p className='mb-2'>Musterstraße 1</p>
              <p className='mb-2'>12345 Musterstadt</p>
            </section>

            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>Kontakt</h2>
              <p className='mb-2'>Telefon: +49 (0) 123 44 55 66</p>
              <p className='mb-2'>E-Mail: muster@beispiel.de</p>
            </section>

            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>
                Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
              </h2>
              <p className='mb-2'>Max Mustermann</p>
              <p className='mb-2'>Musterstraße 1</p>
              <p className='mb-2'>12345 Musterstadt</p>
            </section>

            <section className='text-sm text-gray-400 mt-8 border-t border-gray-700 pt-4'>
              <p>
                Quelle:{' '}
                <a
                  href='https://www.e-recht24.de'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lafftale-gold hover:underline'
                >
                  e-recht24.de
                </a>
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Impressum;
