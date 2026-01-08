import { useTheme } from '@/context/ThemeContext';

const Index = () => {
  const { currentTemplate } = useTheme();
  const { Layout, HeroSection, ServerStatusWidget, FeaturesSection, NewsSection, RankingPreviewSection } =
    currentTemplate.components;

  return (
    <Layout>
      <HeroSection />
      <ServerStatusWidget />
      <FeaturesSection />
      <NewsSection />
      <RankingPreviewSection />
    </Layout>
  );
};

export default Index;
