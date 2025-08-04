import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

interface CoursePreviewProps {
  thumbnailUrl?: string;
  videoPreviewUrl?: string;
  title: string;
  className?: string;
}

export const CoursePreview = ({ 
  thumbnailUrl, 
  videoPreviewUrl, 
  title, 
  className = "" 
}: CoursePreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoPreviewUrl) {
    return thumbnailUrl ? (
      <img 
        src={thumbnailUrl} 
        alt={title}
        className={`w-full h-48 object-cover rounded-lg ${className}`}
      />
    ) : (
      <div className={`w-full h-48 bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-muted-foreground">No preview available</span>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    // YouTube URL processing
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    // For direct video files
    if (url.match(/\.(mp4|webm|ogg)$/)) {
      return url;
    }
    return url;
  };

  const renderVideoPlayer = () => {
    const embedUrl = getEmbedUrl(videoPreviewUrl);
    
    if (videoPreviewUrl.includes('youtube.com') || videoPreviewUrl.includes('youtu.be')) {
      return (
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    return (
      <video
        src={embedUrl}
        controls
        autoPlay
        className="w-full h-full object-contain"
        title={title}
      />
    );
  };

  return (
    <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
      <DialogTrigger asChild>
        <div className={`relative group cursor-pointer ${className}`}>
          {thumbnailUrl ? (
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="w-full h-48 object-cover rounded-lg transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Preview Available</span>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="lg" 
              className="rounded-full bg-white/90 text-black hover:bg-white"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>
          
          {/* Preview badge */}
          <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded">
            Preview
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl w-full p-0">
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <Button 
            variant="ghost" 
            size="sm"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={() => setIsPlaying(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          {renderVideoPlayer()}
        </div>
      </DialogContent>
    </Dialog>
  );
};