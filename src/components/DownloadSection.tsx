import { useState, useEffect } from "react";
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
  const [fileSize, setFileSize] = useState<string>("Lädt...");
  const megaLink = "https://mega.nz/file/8JFiWKoL#RKox6jJpDbdqpgP2ABWuYC9V7uzSXJ3QcZJT30ANNog";

  useEffect(() => {
    // In einer realen Implementierung würde hier eine API-Anfrage erfolgen,
    // um die tatsächliche Dateigröße zu ermitteln
    // Da wir nicht direkt auf die Mega-API zugreifen können, simulieren wir dies
    const fetchFileSize = async () => {
      try {
        // In einer realen Implementierung:
        // const response = await fetch('api/getFileSize', { 
        //   method: 'POST',
        //   body: JSON.stringify({ url: megaLink })
        // });
        // const data = await response.json();
        // setFileSize(data.size);
        
        // Für dieses Beispiel setzen wir nach einer kurzen Verzögerung eine Größe
        setTimeout(() => {
          setFileSize("1.24 GB");
        }, 1500);
      } catch (error) {
        console.error("Fehler beim Abrufen der Dateigröße:", error);
        setFileSize("1.24 GB"); // Fallback-Größe
      }
    };

    fetchFileSize();
  }, []);

  const handleDownload = () => {
    setDownloading(true);
    // Simuliere Download-Start
    setTimeout(() => {
      // Öffne den Mega-Link in einem neuen Tab
      window.open(megaLink, '_blank');
      setDownloading(false);
    }, 2000);
  };

  return (
    <section className="py-20 bg-silkroad-darkgray/60">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mt-10">
          <div className="card">
            <div className="flex items-center justify-center mb-8">
              <Button
                onClick={handleDownload} 
                className="btn-primary flex items-center gap-2"
                disabled={downloading}
              >
                <Download size={20} />
                {downloading ? 'Downloading...' : 'Lafftale Client'} 
                <span className="text-xs bg-silkroad-dark/70 px-2 py-1 rounded-full">{fileSize}</span>
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
                      <span className="text-silkroad-gold font-medium">Download den Lafftale Client</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Lade den kompletten Lafftale Client über den Download-Button herunter.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Entpacke die Datei</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Entpacke den heruntergeladenen Client mit einem geeigneten Programm wie WinRAR oder 7-Zip.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Create Your Account</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Registriere einen neuen Account auf unserer Website.
                      </p>
                    </li>
                    <li className="text-gray-300">
                      <span className="text-silkroad-gold font-medium">Starte das Spiel</span>
                      <p className="mt-1 text-sm text-gray-400 pl-5">
                        Führe die sro_client.exe aus, gib deine Zugangsdaten ein und beginne dein Abenteuer!
                      </p>
                    </li>
                  </ol>
                  
                  <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
                    <p className="text-amber-200 text-sm">
                      <strong>Hinweis:</strong> Bei Aktualisierungen des Spiels werden entsprechende Informationen auf der Website oder im Discord-Server bereitgestellt.
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