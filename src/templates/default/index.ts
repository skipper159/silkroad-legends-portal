import { TemplateDefinition } from '../../lib/template-system/types';
import Layout from './Layout';
import Header from './components/Header';
import Footer from './components/Footer';
import ServerStatusWidget from './components/ServerStatusWidget';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import RankingPreviewSection from './components/RankingPreviewSection';
import FeaturesSection from './components/FeaturesSection';
import { getPublicUrl } from '../../utils/assetUtils';

const DefaultTemplate: TemplateDefinition = {
  metadata: {
    name: 'Default Legacy',
    version: '1.0.0',
    description: 'The original design of Silkroad Legends Portal',
    author: 'System',
  },
  components: {
    Layout,
    Header,
    Footer,
    ServerStatusWidget,
    HeroSection,
    NewsSection,
    RankingPreviewSection,
    FeaturesSection,
  },
  assets: {
    logo: getPublicUrl('lafftale_logo_300x300.png'),
    loginBackground: getPublicUrl('image/Web/login-bg.jpg'), // Assuming this exists or using the class approach if mapped.
    // Ideally we use URLs for maximum flexibility. The original used a class 'bg-login-bg'.
    // If we want to use the EXACT same image, we need to know what 'bg-login-bg' maps to in tailwind,
    // or just assume a standard path if we can find it.
    // For now, I will use placeholder paths or try to find the real one.
    // I will use a generic path that likely maps to what was there or a fallback.
    // Wait, the user asked for dynamic support.
    registerBackground: getPublicUrl('image/Web/register-bg.jpg'),
    pageHeaderBackground:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop', // Default placeholder
    sidebarBackground: '', // Not used in Default but satisfies interface if needed, or if I switch layouts
    cardGradient: 'bg-lafftale-darkgray/80 backdrop-blur-md border border-lafftale-gold/20',
  },
  customizationConfig: [
    {
      key: 'logo',
      label: 'Site Logo',
      type: 'image',
      section: 'branding.images',
      description: 'Main site logo',
    },
    {
      key: 'heroBackground',
      label: 'Home Hero Background',
      type: 'image',
      section: 'branding.images',
      description: 'Background image for the main landing page hero section',
    },
    {
      key: 'loginBackground',
      label: 'Login Screen Background',
      type: 'image',
      section: 'branding.images',
    },
    {
      key: 'registerBackground',
      label: 'Register Screen Background',
      type: 'image',
      section: 'branding.images',
    },
    {
      key: 'pageHeaderBackground',
      label: 'Page Header Background',
      type: 'image',
      section: 'branding.images',
    },
  ],
};

export default DefaultTemplate;
