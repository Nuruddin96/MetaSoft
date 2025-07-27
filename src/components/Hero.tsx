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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in">
              <Star className="h-4 w-4 mr-2 text-yellow-300" />
              Bangladesh's #1 E-commerce Learning Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
              {currentBanner.title}
            </h1>
            
            {currentBanner.subtitle && (
              <p className="text-xl text-white/90 mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                {currentBanner.subtitle}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to={currentBanner.cta_link}>
                  <BookOpen className="h-5 w-5 mr-2" />
                  {currentBanner.cta_text}
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link to="/demo">
                  <Play className="h-5 w-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-white/90 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold">5000+</div>
                <div className="text-sm">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">150+</div>
                <div className="text-sm">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-sm">Expert Instructors</div>
              </div>
            </div>
            
            {/* Dots indicator */}
            {banners.length > 1 && (
              <div className="flex justify-center lg:justify-start space-x-2 mt-8">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Right Content - Video/Image placeholder */}
          <div className="relative animate-float">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-glow">
              <div className="aspect-video bg-gradient-card rounded-xl flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-white ml-1" />
                </div>
              </div>
              
              <div className="text-white space-y-4">
                <h3 className="text-xl font-semibold">Featured Course Preview</h3>
                <p className="text-white/80">
                  "Complete E-commerce Mastery" - Learn how to build and scale your online business from zero to millions.
                </p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>2,340 students</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-300" />
                    <span>4.9 rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};