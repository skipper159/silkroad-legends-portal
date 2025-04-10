
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import DownloadSection from "@/components/DownloadSection";

const Download = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="py-12 bg-hero-pattern bg-cover bg-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Download <span className="text-lafftale-darkred">Lafftale</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 text-gray-300">
            Get ready to embark on your journey through the ancient Silkroad. Download our game client or launcher and start your adventure today.
          </p>
        </div>
      </div>
      <DownloadSection />
      <Footer />
    </div>
  );
};

export default Download;
