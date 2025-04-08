
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DownloadSection from "@/components/DownloadSection";
import NewsSection from "@/components/NewsSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <Features />
      <DownloadSection />
      <NewsSection />
      <Footer />
    </div>
  );
};

export default Index;
