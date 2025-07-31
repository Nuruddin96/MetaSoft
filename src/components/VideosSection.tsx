import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  video_id: string;
  thumbnail_url: string;
  order_index: number;
  is_active: boolean;
}

export const VideosSection = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (videos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === videos.length - 1 ? 0 : prevIndex + 1
        );
      }, 6000); // Auto-slide every 6 seconds

      return () => clearInterval(interval);
    }
  }, [videos.length]);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === videos.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? videos.length - 1 : prevIndex - 1
    );
  };

  const openVideoModal = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 w-64 mx-auto"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-muted animate-pulse rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {settings.videos_section_title || "Learning Videos"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings.videos_section_description || "Watch our expert-led tutorials and masterclasses"}
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Video Player Area */}
          <div className="relative overflow-hidden rounded-xl shadow-2xl group">
            <div className="aspect-video relative">
              <img
                src={currentVideo.thumbnail_url}
                alt={currentVideo.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={() => openVideoModal(currentVideo.video_id)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                >
                  <Play className="h-8 w-8 text-white mr-2" />
                  <span className="text-white">Watch Video</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Video Navigation */}
          {videos.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Previous video"
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                aria-label="Next video"
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </>
          )}

          {/* Video Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-xl">{currentVideo.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{currentVideo.description}</p>
            </CardContent>
          </Card>

          {/* Video Dots Indicator */}
          {videos.length > 1 && (
            <div className="flex justify-center space-x-2 mt-6">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* All Videos Grid */}
          {videos.length > 1 && (
            <div className="mt-12">
              <h3 className="text-xl font-semibold mb-6 text-center">All Videos</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((video, index) => (
                  <Card 
                    key={video.id} 
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      index === currentIndex ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <CardContent className="p-3">
                      <div className="aspect-video rounded-lg overflow-hidden mb-3">
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};