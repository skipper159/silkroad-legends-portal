
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsSection from "@/components/NewsSection";
import ServerOverview from "@/components/ServerOverview";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ServerOverview />
      <Features />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;
