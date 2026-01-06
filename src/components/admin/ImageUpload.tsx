import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon, Copy, Check } from 'lucide-react';
import { weburl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
}

const ImageUpload = ({ onImageUploaded }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      filename: string;
      url: string;
      originalName: string;
    }>
  >([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { token } = useAuth();

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    // Support multiple files
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        formData.append('images', file);
      }
    });

    try {
      console.log('Uploading to:', `${weburl}/api/upload/images`);
      console.log('Token available:', !!token);

      const response = await fetch(`${weburl}/api/upload/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setUploadedImages((prev) => [...prev, ...data.data]);
        toast({
          title: 'Success!',
          description: `${data.data.length} image(s) uploaded`,
          variant: 'default',
        });

        // Auto-select first uploaded image
        if (data.data.length > 0) {
          onImageUploaded(data.data[0].url);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: `Upload failed: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const copyImageUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
      toast({
        title: 'Copied!',
        description: 'Image URL was copied',
        variant: 'default',
      });
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const insertImageMarkdown = (url: string) => {
    const markdown = `![Image](${url})`;
    navigator.clipboard.writeText(markdown).then(() => {
      toast({
        title: 'Markdown copied!',
        description: 'Insert it into the text editor',
        variant: 'default',
      });
    });
  };

  return (
    <Card className='mb-6'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ImageIcon className='h-5 w-5' />
          Image Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-silkroad-gold bg-silkroad-gold/10' : 'border-gray-600 hover:border-silkroad-gold/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className='h-12 w-12 mx-auto mb-4 text-gray-400' />
          <p className='text-lg mb-2'>{uploading ? 'Uploading...' : 'Drop images here or click'}</p>
          <p className='text-sm text-gray-400'>JPG, PNG, WebP, GIF bis 50MB</p>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            multiple
            className='hidden'
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />

          {uploading && (
            <div className='mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-silkroad-gold mx-auto'></div>
            </div>
          )}
        </div>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <div className='mt-6'>
            <h4 className='font-semibold mb-4'>Uploaded Images:</h4>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
              {uploadedImages.map((image) => (
                <div key={image.filename} className='relative group'>
                  <img
                    src={`${weburl}${image.url}`}
                    alt={image.originalName}
                    className='w-full h-24 object-cover rounded border border-gray-600'
                  />

                  <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2'>
                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => copyImageUrl(`${weburl}${image.url}`)}
                      className='text-xs'
                    >
                      {copiedUrl === `${weburl}${image.url}` ? (
                        <Check className='h-3 w-3' />
                      ) : (
                        <Copy className='h-3 w-3' />
                      )}
                    </Button>

                    <Button
                      size='sm'
                      variant='outline'
                      onClick={() => insertImageMarkdown(`${weburl}${image.url}`)}
                      className='text-xs'
                    >
                      MD
                    </Button>
                  </div>

                  <div className='mt-1 text-xs text-gray-400 truncate'>{image.originalName}</div>
                </div>
              ))}
            </div>

            <div className='mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded'>
              <p className='text-sm text-blue-200 mb-2'>
                <strong>How to insert images into text:</strong>
              </p>
              <ol className='text-sm text-blue-200 list-decimal list-inside space-y-1'>
                <li>Click "MD" to copy Markdown</li>
                <li>
                  Insert it into the text editor: <code>![Image](URL)</code>
                </li>
                <li>
                  Or use HTML: <code>&lt;img src="URL" alt="Description" /&gt;</code>
                </li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload;
