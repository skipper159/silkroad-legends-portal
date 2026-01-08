import { TemplateDefinition } from '../../lib/template-system/types';
import Layout from './Layout';
import AuthLayout from './AuthLayout';
import Header from './components/Header';
import Footer from './components/Footer';
import ServerStatusWidget from './components/ServerStatusWidget';
import HeroSection from './components/HeroSection';
import NewsSection from './components/NewsSection';
import RankingPreviewSection from './components/RankingPreviewSection';
import FeaturesSection from './components/FeaturesSection';
import PageBanner from './components/PageBanner';
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
    AuthLayout,
    Header,
    Footer,
    ServerStatusWidget,
    HeroSection,
    NewsSection,
    RankingPreviewSection,
    FeaturesSection,
    PageBanner: PageBanner,
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
  customizationConfig: [
    {
      key: 'logo',
      label: 'Site Logo',
      type: 'image',
      section: 'branding.images',
      description: 'The main logo displayed in the sidebar',
    },
    {
      key: 'sidebarBackground',
      label: 'Sidebar Background Image',
      type: 'image',
      section: 'branding.images',
      description: 'Background image for the navigation sidebar',
    },
    {
      key: 'pageHeaderBackground',
      label: 'Page Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header image for pages like Download and Rankings',
    },
    {
      key: 'loginBackground',
      label: 'Login Screen Background',
      type: 'image',
      section: 'branding.images',
      description: 'Full screen background for the login page',
    },
    {
      key: 'registerBackground',
      label: 'Register Screen Background',
      type: 'image',
      section: 'branding.images',
      description: 'Full screen background for the register page',
    },
    {
      key: 'globalBackground',
      label: 'Global Site Background',
      type: 'image',
      section: 'branding.images',
      description: 'Main background image for the entire application (under content)',
    },
    {
      key: 'heroContainerBackground',
      label: 'Home Hero Area Background',
      type: 'image',
      section: 'branding.images',
      description: 'Background for the area surrounding the hero video/slider',
    },
    {
      key: 'accountHeaderBackground',
      label: 'Account Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Account pages',
    },
    {
      key: 'adminHeaderBackground',
      label: 'Admin Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Admin pages',
    },
    {
      key: 'serverInfoHeaderBackground',
      label: 'Server Info Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Server Info page',
    },
    {
      key: 'newsHeaderBackground',
      label: 'News Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for News page',
    },
    {
      key: 'rankingsHeaderBackground',
      label: 'Rankings Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Rankings page',
    },
    {
      key: 'downloadHeaderBackground',
      label: 'Download Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Download page',
    },
    {
      key: 'guideHeaderBackground',
      label: 'Guide Header Background',
      type: 'image',
      section: 'branding.images',
      description: 'Header banner for Guide page',
    },
  ],
};

export default ModernV2Template;
