
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const DownloadLinks = () => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold mb-6">Download</h3>
      <div className="space-y-6">
        <div className="p-4 rounded-lg border border-lafftale-gold/20 bg-lafftale-darkgray/50">
          <h4 className="font-bold text-lg mb-2">Game Launcher</h4>
          <p className="text-gray-400 mb-4">
            Our recommended way to play. The launcher keeps your game updated automatically.
          </p>
          <Button className="btn-primary flex items-center gap-2">
            <Download size={16} /> Download Launcher (450 MB)
          </Button>
        </div>
        
        <div className="p-4 rounded-lg border border-lafftale-gold/20 bg-lafftale-darkgray/50">
          <h4 className="font-bold text-lg mb-2">Full Client</h4>
          <p className="text-gray-400 mb-4">
            Complete game installation package. Manual updates required.
          </p>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download size={16} /> Download Full Client (4.2 GB)
          </Button>
        </div>
        
        <div className="p-4 rounded-lg border border-lafftale-gold/20 bg-lafftale-darkgray/50">
          <h4 className="font-bold text-lg mb-2">Patch Notes</h4>
          <p className="text-gray-400 mb-4">
            Latest game updates and changes.
          </p>
          <Button variant="outline" className="btn-outline">
            View Patch Notes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadLinks;
