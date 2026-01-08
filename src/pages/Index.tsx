import ActiveTemplate from '@/config/theme-config';

const { Layout, HeroSection, ServerStatusWidget, FeaturesSection, NewsSection, RankingPreviewSection } =
  ActiveTemplate.components;

const Index = () => {
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
