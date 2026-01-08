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

const ModernV2Template: TemplateDefinition = {
  metadata: {
    name: 'Modern V2',
    version: '2.0.0',
    description: 'A modern, sidebar-based dark interface with emerald accents.',
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
    loginBackground:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    registerBackground:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    pageHeaderBackground:
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    cardGradient: 'bg-zinc-900 border border-zinc-800',
  },
};

export default ModernV2Template;
