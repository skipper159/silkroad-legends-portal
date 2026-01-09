import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, Server, Scroll } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const Guide = () => {
  const { currentTemplate, theme } = useTheme();
  const { Layout, PageBanner } = currentTemplate.components;
  return (
    <Layout>
      <PageBanner
        title='Game Guides'
        subtitle='Your comprehensive resource center for mastering Silkroad Online on our server'
      />

      <div className='container mx-auto px-4 py-12 space-y-8'>
        {/* Welcome Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className='text-3xl'>Welcome to {theme.siteName} Guides</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground leading-relaxed'>
                Whether you're a complete beginner or a seasoned veteran, our guides will help you navigate the vast
                world of Silkroad Online. We've organized everything you need into easy-to-follow sections covering
                gameplay mechanics, server-specific features, and advanced strategies.
              </p>
              <p className='text-muted-foreground leading-relaxed'>
                Choose a guide below to get started on your journey through the ancient Silk Road!
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Guide Cards */}
        <section className='grid md:grid-cols-2 gap-6'>
          {/* Beginner Guide */}
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex items-center gap-3 mb-2'>
                <BookOpen className='w-8 h-8 text-primary' />
                <CardTitle className='text-2xl'>Beginner Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground'>
                Perfect for new players! Learn the fundamentals of Silkroad Online, from character creation to your
                first trades. Covers leveling routes, mastery systems, job mechanics, equipment, and essential gameplay
                tips.
              </p>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm'>What you'll learn:</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Character races and builds</li>
                  <li>• Leveling routes and grinding spots</li>
                  <li>• Job system (Trader, Hunter, Thief)</li>
                  <li>• Equipment and alchemy basics</li>
                  <li>• Economy and trading strategies</li>
                </ul>
              </div>
              <Link to='/guide/beginner'>
                <Button className='w-full'>Start Learning</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Server Guide */}
          <Card className='hover:shadow-lg transition-shadow'>
            <CardHeader>
              <div className='flex items-center gap-3 mb-2'>
                <Server className='w-8 h-8 text-primary' />
                <CardTitle className='text-2xl'>Server Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-muted-foreground'>
                Everything you need to know about our server! Get information about server specifications, features,
                rates, download instructions, events, and technical support.
              </p>
              <div className='space-y-2'>
                <h4 className='font-semibold text-sm'>What you'll find:</h4>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>• Server specifications and rates</li>
                  <li>• Download and installation guide</li>
                  <li>• Server-specific features</li>
                  <li>• Events and community info</li>
                  <li>• Technical support and FAQ</li>
                </ul>
              </div>
              <Link to='/guide/server'>
                <Button className='w-full'>View Server Info</Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Quick Links */}
        <section>
          <Card>
            <CardHeader>
              <div className='flex items-center gap-3'>
                <Scroll className='w-6 h-6 text-primary' />
                <CardTitle className='text-2xl'>Additional Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid md:grid-cols-3 gap-4'>
                <Link to='/rules' className='block bg-muted/20 p-4 rounded-lg hover:bg-muted/30 transition-colors'>
                  <h3 className='font-semibold mb-2'>Server Rules</h3>
                  <p className='text-sm text-muted-foreground'>Read our community guidelines</p>
                </Link>
                <Link to='/download' className='block bg-muted/20 p-4 rounded-lg hover:bg-muted/30 transition-colors'>
                  <h3 className='font-semibold mb-2'>Downloads</h3>
                  <p className='text-sm text-muted-foreground'>Get the game client</p>
                </Link>
                <Link to='/account' className='block bg-muted/20 p-4 rounded-lg hover:bg-muted/30 transition-colors'>
                  <h3 className='font-semibold mb-2'>Support</h3>
                  <p className='text-sm text-muted-foreground'>Need help? Contact us</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Layout>
  );
};

export default Guide;
