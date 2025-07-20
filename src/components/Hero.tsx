import { Button } from "@/components/ui/button";
import { Play, Star, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Hero = () => {
  const { settings } = useSiteSettings();
  return (
    <section className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in">
              <Star className="h-4 w-4 mr-2 text-yellow-300" />
              Bangladesh's #1 E-commerce Learning Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up">
              {settings.hero_title || "Master E-commerce with MetaSoft BD"}
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
              {settings.hero_subtitle || "Learn from Bangladesh's top e-commerce experts. Build your online business with our comprehensive video courses and expert guidance."}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-glow transition-all duration-300 hover:scale-105"
                asChild
              >
                <Link to="/courses">
                  <BookOpen className="h-5 w-5 mr-2" />
                  {settings.hero_cta_text || "Explore Courses"}
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