
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
  currentImage?: string;
}

export function ImageUpload({ onImageUpload, onImageRemove, currentImage }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Create a data URL for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // In a real implementation, you would upload to Supabase Storage here
      // For now, we'll just use the data URL
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="Uploaded incident"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-4">
            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCameraCapture}
                disabled={isUploading}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGallerySelect}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              {isUploading ? 'Uploading...' : 'Add a photo to help emergency responders'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
