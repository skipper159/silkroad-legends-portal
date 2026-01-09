import { useTheme } from '@/context/ThemeContext';
import { Card, CardContent } from '@/components/ui/card';

const TermsOfService = () => {
  const { currentTemplate } = useTheme();
  const { Layout } = currentTemplate.components;
  return (
    <Layout>
      <div
        className='py-12 bg-cover bg-center'
        style={{
          backgroundImage: `url('${currentTemplate.assets.pageHeaderBackground}')`,
        }}
      >
        <div className='container mx-auto px-4 text-center'>
          <div className='bg-black/50 p-6 rounded-lg inline-block backdrop-blur-sm'>
            <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white'>
              Terms of <span className='text-lafftale-bronze font-cinzel text-4xl font-bold'>Service</span>
            </h1>
            <p className='text-lg max-w-2xl mx-auto mb-10 text-gray-200'>
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <Card className='bg-lafftale-dark/80 border-lafftale-gold/20 backdrop-blur-sm'>
          <CardContent className='p-8 space-y-6 text-gray-300'>
            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>1. Acceptance of Terms</h2>
              <p>
                By accessing and using this website and the game services provided, you accept and agree to be bound by
                the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>2. Account Security</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account and password. You agree to
                accept responsibility for all activities that occur under your account or password.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>3. Code of Conduct</h2>
              <p>
                Users agree to follow the Server Rules and maintain respectful behavior towards other players and staff.
                Harassment, cheating, or exploitation of bugs is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-bold text-lafftale-gold mb-4'>4. Virtual Items</h2>
              <p>
                All virtual items, currency, and characters remain the property of the server. We reserve the right to
                modify or remove them at any time.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
