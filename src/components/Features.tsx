import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { 
  Video, 
  FileText, 
  Users, 
  Award, 
  Clock, 
  Shield,
  Smartphone,
  BookOpen,
  MessageCircle,
  Star,
  Target,
  Heart,
  Zap,
  Gift,
  TrendingUp,
  CheckCircle
} from "lucide-react";

interface DynamicFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

// Icon mapping
const iconMap = {
  Video, FileText, Users, Award, Clock, Shield, Smartphone, BookOpen, 
  MessageCircle, Star, Target, Heart, Zap, Gift, TrendingUp, CheckCircle
};

export const Features = () => {
  const [features, setFeatures] = useState<DynamicFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_features')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 w-96 mx-auto"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-[600px] mx-auto"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-muted rounded-lg mx-auto mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (features.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {settings.features_section_title || "Why Choose MetaSoft BD?"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings.features_section_description || "Everything you need to master e-commerce and build a successful online business in Bangladesh"}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || BookOpen;
            
            return (
              <Card 
                key={feature.id} 
                className="border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card"
              >
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};