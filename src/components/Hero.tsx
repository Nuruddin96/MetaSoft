import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Star, Users, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  background_image: string | null;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active: boolean;
}

export const Hero = () => {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchHeroBanners();
  }, []);

  useEffect(() => {
    // Get hero slide images from settings
    const slides = [];
    if (settings.hero_slide_1) slides.push(settings.hero_slide_1);
    if (settings.hero_slide_2) slides.push(settings.hero_slide_2);
    if (settings.hero_slide_3) slides.push(settings.hero_slide_3);
    setHeroImages(slides);
  }, [settings]);

  const fetchHeroBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching hero banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Auto-slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [banners.length]);

  useEffect(() => {
    if (heroImages.length > 1 && settings.hero_slideshow_enabled) {
      const interval = setInterval(() => {
        setImageIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Auto-slide images every 4 seconds

      return () => clearInterval(interval);
    }
  }, [heroImages.length, settings.hero_slideshow_enabled]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return <div className="min-h-screen bg-gradient-hero animate-pulse" />;
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const currentHeroImage = heroImages[imageIndex];

  // Use hero slide images if slideshow is enabled and images exist
  const backgroundImage = settings.hero_slideshow_enabled && heroImages.length > 0 
    ? currentHeroImage 
    : currentBanner?.background_image;

  return (
    <section 
      className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center transition-all duration-1000"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="text-center">
            {settings.banner_text && (
              <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in">
                <Star className="h-4 w-4 mr-2 text-yellow-300" />
                {settings.banner_text}
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
              {settings.hero_title || currentBanner.title}
            </h1>
            
            {(settings.hero_subtitle || currentBanner.subtitle) && (
              <p className="text-xl text-white/90 mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                {settings.hero_subtitle || currentBanner.subtitle}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up justify-center" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to={settings.hero_cta_link || currentBanner.cta_link}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  {settings.hero_cta_text || currentBanner.cta_text}
                </Link>
              </Button>
            </div>
            
            
            {/* Dots indicator */}
            {(banners.length > 1 || (heroImages.length > 1 && settings.hero_slideshow_enabled)) && (
              <div className="flex justify-center space-x-2 mt-8">
                {banners.length > 1 ? (
                  banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))
                ) : heroImages.length > 1 && settings.hero_slideshow_enabled ? (
                  heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === imageIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))
                ) : null}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
};