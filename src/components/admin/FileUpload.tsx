import { useState } from 'react';
import { Upload, X, FileText, Video, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string, fileSize: number) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  bucketName?: 'course-materials' | 'course-thumbnails';
  folder?: string;
}

export const FileUpload = ({ 
  onFileUploaded, 
  acceptedTypes = "*",
  maxSize = 100,
  bucketName = 'course-materials',
  folder = 'uploads'
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-8 w-8 text-green-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    // Check file type if specified
    if (acceptedTypes !== "*") {
      const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type);
        } else if (type.includes('*')) {
          // Handle patterns like "image/*"
          const mainType = type.split('/')[0];
          return fileType.startsWith(mainType + '/');
        } else {
          return fileType.startsWith(type);
        }
      });

      if (!isAllowed) {
        return `File type not allowed. Accepted types: ${acceptedTypes}`;
      }
    }

    return null;
  };

  const generateFileName = (originalName: string) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = originalName.split('.').pop();
    return `${folder}/${timestamp}-${randomString}.${extension}`;
  };

  const uploadFile = async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      toast({
        title: "Invalid File",
        description: validation,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const fileName = generateFileName(file.name);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      let publicUrl: string;
      
      if (bucketName === 'course-thumbnails') {
        // Public bucket
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      } else {
        // Private bucket - create signed URL (valid for 1 year)
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 year

        if (signedUrlError) throw signedUrlError;
        publicUrl = signedUrlData.signedUrl;
      }

      setUploadProgress(100);
      
      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      onFileUploaded(publicUrl, file.name, file.size);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          onChange={handleFileInput}
          accept={acceptedTypes}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className={`mx-auto h-12 w-12 ${dragActive ? 'text-primary' : 'text-gray-400'}`} />
          <div className="mt-4">
            <p className="text-sm font-medium">
              {dragActive ? 'Drop your file here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Max file size: {maxSize}MB
            </p>
            {acceptedTypes !== "*" && (
              <p className="text-xs text-muted-foreground mt-1">
                Accepted types: {acceptedTypes}
              </p>
            )}
          </div>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
    </div>
  );
};