import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Monitor, LayoutList, AlertCircle } from 'lucide-react';
import { weburl } from '@/lib/api';

// Download Interface Definition
interface DownloadItem {
  id: number;
  title: string;
  description: string;
  file_url: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

const clientRequirements = {
  minimum: {
    os: 'Windows 7/8/10/11',
    processor: 'Intel Core i3 or AMD equivalent',
    memory: '4 GB RAM',
    graphics: 'DirectX 9.0c compatible card with 512 MB',
    storage: '5 GB available space',
    network: 'Broadband Internet connection',
  },
  recommended: {
    os: 'Windows 10/11',
    processor: 'Intel Core i5 or AMD equivalent',
    memory: '8 GB RAM',
    graphics: 'DirectX 11 compatible card with 2 GB',
    storage: '10 GB available space',
    network: 'Broadband Internet connection (10+ Mbps)',
  },
};

const DownloadSection = () => {
  const [downloading, setDownloading] = useState<Record<number, boolean>>({});
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Legacy download link (als Fallback)
  const megaLink = 'https://mega.nz/file/8JFiWKoL#RKox6jJpDbdqpgP2ABWuYC9V7uzSXJ3QcZJT30ANNog';

  useEffect(() => {
    // Fetch downloads from the API
    const fetchDownloads = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${weburl}/api/downloads`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          setDownloads(data.data);
        } else {
          setDownloads([]);
          console.warn('No downloads available or unexpected API response format');
        }
      } catch (error) {
        console.error('Error fetching downloads:', error);
        setError('Failed to load downloads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, []);
  const handleDownload = (downloadId: number, url: string) => {
    // Set downloading status for this specific download
    setDownloading((prev) => ({ ...prev, [downloadId]: true }));

    // Simulate download start
    setTimeout(() => {
      // Open the link in a new tab
      window.open(url, '_blank');
      setDownloading((prev) => ({ ...prev, [downloadId]: false }));
    }, 1000);
  };

  // Component for a single download item
  const DownloadCard = ({ download }: { download: DownloadItem }) => {
    const isDownloading = downloading[download.id] || false;

    return (
      <div className='bg-silkroad-dark/30 border border-silkroad-gold/20 rounded-lg overflow-hidden flex flex-col mb-6'>
        <div className='flex flex-col md:flex-row'>
          {/* Image Section */}
          {download.image && (
            <div className='w-full md:w-1/3 p-2'>
              <img
                src={download.image.startsWith('http') ? download.image : `${weburl}${download.image}`}
                alt={download.title}
                className='w-full h-40 object-cover rounded-lg'
                onError={(e) => {
                  console.log('Image failed to load:', download.image);
                  // If image fails to load, hide it
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Content Section */}
          <div className={`w-full ${download.image ? 'md:w-2/3' : 'md:w-full'} p-4`}>
            <h3 className='text-xl font-semibold text-lafftale-gold mb-2'>{download.title}</h3>
            <p className='text-gray-300 text-sm mb-4'>{download.description}</p>

            <Button
              onClick={() => handleDownload(download.id, download.file_url)}
              className='btn-primary flex items-center gap-2'
              disabled={isDownloading}
              size='sm'
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'Download'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Fallback download button for when no downloads are available from API
  const FallbackDownload = () => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [fileSize, setFileSize] = useState<string>('1.24 GB');

    const handleFallbackDownload = () => {
      setIsDownloading(true);
      setTimeout(() => {
        window.open(megaLink, '_blank');
        setIsDownloading(false);
      }, 2000);
    };

    return (
      <Button onClick={handleFallbackDownload} className='btn-primary flex items-center gap-2' disabled={isDownloading}>
        <Download size={20} />
        {isDownloading ? 'Downloading...' : 'Lafftale Client'}
        <span className='text-xs bg-silkroad-dark/70 px-2 py-1 rounded-full'>{fileSize}</span>
      </Button>
    );
  };

  return (
    <section className='py-20 bg-silkroad-darkgray/60'>
      <div className='container mx-auto px-4'>
        <div className='max-w-5xl mx-auto mt-10'>
          <div className='card'>
            <h2 className='text-2xl font-bold text-center text-lafftale-gold mb-8'>Available Downloads</h2>

            {/* Loading State */}
            {loading && (
              <div className='flex justify-center items-center py-12'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lafftale-gold'></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className='bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3'>
                <AlertCircle className='text-red-400' size={24} />
                <p className='text-red-300'>{error}</p>
              </div>
            )}

            {/* Downloads List */}
            {!loading && !error && (
              <div className='space-y-4'>
                {downloads.length > 0 ? (
                  <div className='space-y-6'>
                    {downloads.map((download) => (
                      <DownloadCard key={download.id} download={download} />
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-col items-center justify-center py-6'>
                    <p className='text-gray-400 mb-4'>No downloads available in the system.</p>
                    <FallbackDownload />
                  </div>
                )}
              </div>
            )}

            {/* System Requirements and Installation Guide */}
            <div className='mt-10'>
              <Tabs defaultValue='requirements' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-8'>
                  <TabsTrigger value='requirements' className='flex gap-2 items-center'>
                    <Monitor size={18} /> System Requirements
                  </TabsTrigger>
                  <TabsTrigger value='instructions' className='flex gap-2 items-center'>
                    <LayoutList size={18} /> Installation Guide
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='requirements'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div className='card bg-silkroad-dark/50'>
                      <h3 className='text-center text-xl mb-4'>Minimum Requirements</h3>
                      <ul className='space-y-2'>
                        {Object.entries(clientRequirements.minimum).map(([key, value]) => (
                          <li key={key} className='flex justify-between'>
                            <span className='text-silkroad-gold'>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className='text-gray-300'>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className='card bg-silkroad-dark/50'>
                      <h3 className='text-center text-xl mb-4'>Recommended</h3>
                      <ul className='space-y-2'>
                        {Object.entries(clientRequirements.recommended).map(([key, value]) => (
                          <li key={key} className='flex justify-between'>
                            <span className='text-silkroad-gold'>{key.charAt(0).toUpperCase() + key.slice(1)}:</span>
                            <span className='text-gray-300'>{value}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='instructions'>
                  <div className='card bg-silkroad-dark/50'>
                    <h3 className='text-center text-xl mb-4'>Installation Steps</h3>
                    <ol className='list-decimal list-inside space-y-4 text-left pl-4'>
                      <li className='text-gray-300'>
                        <span className='text-silkroad-gold font-medium'>Download the Client</span>
                        <p className='mt-1 text-sm text-gray-400 pl-5'>
                          Download the client files using one of the download options above.
                        </p>
                      </li>
                      <li className='text-gray-300'>
                        <span className='text-silkroad-gold font-medium'>Extract the File</span>
                        <p className='mt-1 text-sm text-gray-400 pl-5'>
                          Extract the downloaded client with a suitable program like WinRAR or 7-Zip.
                        </p>
                      </li>
                      <li className='text-gray-300'>
                        <span className='text-silkroad-gold font-medium'>Create Your Account</span>
                        <p className='mt-1 text-sm text-gray-400 pl-5'>Register a new account on our website.</p>
                      </li>
                      <li className='text-gray-300'>
                        <span className='text-silkroad-gold font-medium'>Start the Game</span>
                        <p className='mt-1 text-sm text-gray-400 pl-5'>
                          Run sro_client.exe, enter your login credentials and begin your adventure!
                        </p>
                      </li>
                    </ol>

                    <div className='mt-8 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg'>
                      <p className='text-amber-200 text-sm'>
                        <strong>Note:</strong> Information about game updates will be provided on the website or in the
                        Discord server.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
