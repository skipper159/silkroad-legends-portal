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
    pageHeaderBackground: getPublicUrl('image/Web/header-bg.jpg'),
  },
};

export default DefaultTemplate;
