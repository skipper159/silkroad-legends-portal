
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import DownloadSection from "@/components/DownloadSection";
import NewsSection from "@/components/NewsSection";
import ServerOverview from "@/components/ServerOverview";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AdminTeaser from "@/components/AdminTeaser";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <ServerOverview />
      <Features />
      <DownloadSection />
      <NewsSection />
      <AdminTeaser />
      <Footer />
    </div>
  );
};

export default Index;
