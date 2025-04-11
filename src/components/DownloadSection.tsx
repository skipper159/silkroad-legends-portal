
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Monitor, LayoutList } from "lucide-react";

const clientRequirements = {
  minimum: {
    os: "Windows 7/8/10/11",
    processor: "Intel Core i3 or AMD equivalent",
    memory: "4 GB RAM",
    graphics: "DirectX 9.0c compatible card with 512 MB",
    storage: "5 GB available space",
    network: "Broadband Internet connection"
  },
  recommended: {
    os: "Windows 10/11",
    processor: "Intel Core i5 or AMD equivalent",
    memory: "8 GB RAM",
    graphics: "DirectX 11 compatible card with 2 GB",
    storage: "10 GB available space",
    network: "Broadband Internet connection (10+ Mbps)"
  }
};

const DownloadSection = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = (type: string) => {
    setDownloading(true);
    // Simulate download start
    setTimeout(() => {
      setDownloading(false);
    }, 2000);
  };

  return (
    <section className="py-20 bg-silkroad-darkgray/60">
      <div className="container mx-auto px-4">


        <div className="max-w-4xl mx-auto mt-10">
          <div className="card">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                onClick={() => handleDownload('launcher')} 
                className="btn-primary flex items-center gap-2"
                disabled={downloading}
              >
                <Download size={20} />
                {downloading ? 'Downloading...' : 'Download Launcher'} 
                <span className="text-xs bg-silkroad-dark/70 px-2 py-1 rounded-full">450 MB</span>
              </Button>
              
              <Button
                onClick={() => handleDownload('client')} 
                className="btn-secondary flex items-center gap-2"
                disabled={downloading}
              >
                <Download size={20} />
                {downloading ? 'Downloading...' : 'Full Client'} 
                <span className="text-xs bg-black/30 px-2 py-1 rounded-full">4.2 GB</span>
              </Button>
            </div>

            <Tabs defaultValue="requirements" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="requirements" className="flex gap-2 items-center">
                  <Monitor size={18} /> System Requirements
                </TabsTrigger>
                <TabsTrigger value="instructions" className="flex gap-2 items-center">
                  <LayoutList size={18} /> Installation Guide
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="requirements">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="card bg-silkroad-dark/50">
                    <h3 className="text-center text-xl mb-4">Minimum Requirements</h3>
                    <ul className="space-y-2">
                      {Object.entries(clientRequirements.minimum).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span className="text-silkroad-gold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span className="text-gray-300">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="card bg-silkroad-dark/50">
                    <h3 className="text-center text-xl mb-4">Recommended</h3>
                    <ul className="space-y-2">
                      {Object.entries(clientRequirements.recommended).map(([key, value]) => (
                        <li key={key} className="flex justify-between">
                          <span className="text-silkroad-gold">{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                          <span className="text-gray-300">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="instructions">
                <div className="card bg-silkroad-dark/50">
                  <h3 className="text-center text-xl mb-4">Installation Steps</h3>
                  <ol className="list-decimal list-inside space-y-4 text-left pl-4">
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Download the Launcher</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Download our easy-to-use launcher for the simplest installation experience.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Run the Installer</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Execute the downloaded file and follow the on-screen instructions.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Create Your Account</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Register a new account through the launcher or on our website.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Login and Play</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Enter your credentials, click Play, and begin your adventure!
                      </p>
                    </li>
                  </ol>
                  
                  <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-amber-200 text-sm">
                      <strong>Note:</strong> Our launcher will automatically download required files and keep your game updated. If you choose the full client download, you will need to manually update when new patches are released.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
