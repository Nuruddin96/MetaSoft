import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface LandingPageSection {
  id: string;
  section_type: string;
  order_index: number;
  title?: string;
  content?: string;
  video_url?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  bullet_points?: any;
}

interface ReviewVideo {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  customer_name?: string;
}

interface OrderForm {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  product: string;
  notes: string;
}

export const LandingPage = () => {
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [reviewVideos, setReviewVideos] = useState<ReviewVideo[]>([]);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    product: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSections();
    fetchReviewVideos();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('landing_page_sections')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching sections:', error);
    } else {
      setSections(data?.map(section => ({
        ...section,
        bullet_points: Array.isArray(section.bullet_points) ? section.bullet_points : []
      })) || []);
    }
  };

  const fetchReviewVideos = async () => {
    const { data, error } = await supabase
      .from('customer_review_videos')
      .select('*')
      .eq('is_active', true)
      .order('order_index');

    if (error) {
      console.error('Error fetching review videos:', error);
    } else {
      setReviewVideos(data || []);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('landing_page_orders')
        .insert([orderForm]);

      if (error) throw error;

      toast.success("Order submitted successfully! We'll contact you soon.");
      setOrderForm({
        customer_name: '',
        phone: '',
        email: '',
        address: '',
        product: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderVideoEmbed = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('/').pop()?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      
      return (
        <iframe
          className="w-full h-64 md:h-96 rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    
    return (
      <video controls className="w-full h-64 md:h-96 rounded-lg">
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  const renderSection = (section: LandingPageSection, index: number) => {
    const stepNumber = index + 1;

    return (
      <div key={section.id} className="mb-16">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
            {stepNumber}
          </div>
        </div>

        {section.section_type === 'header' && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              {section.title}
            </h1>
            {section.content && (
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {section.content}
              </p>
            )}
          </div>
        )}

        {section.section_type === 'video' && section.video_url && (
          <div className="max-w-4xl mx-auto mb-8">
            {renderVideoEmbed(section.video_url)}
          </div>
        )}

        {section.section_type === 'cta' && section.cta_text && (
          <div className="text-center mb-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4"
              onClick={() => section.cta_url && window.open(section.cta_url, '_blank')}
            >
              {section.cta_text}
            </Button>
          </div>
        )}

        {section.section_type === 'bullet_points' && section.bullet_points && (
          <Card className="max-w-2xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="grid gap-4">
                {(section.bullet_points as string[]).map((point, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <span className="text-foreground">{point}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {section.section_type === 'text_content' && (
          <div className="max-w-4xl mx-auto text-center mb-8">
            {section.title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {section.title}
              </h2>
            )}
            {section.content && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            )}
          </div>
        )}

        {section.section_type === 'image_with_text' && (
          <div className="max-w-6xl mx-auto mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {section.image_url && (
                <div>
                  <img 
                    src={section.image_url} 
                    alt={section.title || "Product image"}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div>
                {section.title && (
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    {section.title}
                  </h3>
                )}
                {section.content && (
                  <p className="text-muted-foreground text-lg">
                    {section.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Render all sections in order */}
        {sections.map((section, index) => renderSection(section, index))}

        {/* Customer Review Videos Slider */}
        {reviewVideos.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                {sections.length + 1}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-center text-foreground mb-8">
              Customer Reviews
            </h2>
            
            <div className="max-w-6xl mx-auto">
              <Carousel className="w-full">
                <CarouselContent>
                  {reviewVideos.map((video) => (
                    <CarouselItem key={video.id} className="md:basis-1/2 lg:basis-1/3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-4">
                            {renderVideoEmbed(video.video_url)}
                            <div>
                              <h4 className="font-semibold text-foreground">{video.title}</h4>
                              {video.customer_name && (
                                <p className="text-sm text-muted-foreground">- {video.customer_name}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          </div>
        )}

        {/* Order Form */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
              {sections.length + (reviewVideos.length > 0 ? 2 : 1)}
            </div>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-center text-foreground mb-6">
                Place Your Order
              </h2>
              
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Full Name *
                  </label>
                  <Input
                    required
                    value={orderForm.customer_name}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Phone Number *
                  </label>
                  <Input
                    required
                    type="tel"
                    value={orderForm.phone}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Email *
                  </label>
                  <Input
                    required
                    type="email"
                    value={orderForm.email}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Address
                  </label>
                  <Textarea
                    value={orderForm.address}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter your address"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Product/Service
                  </label>
                  <Input
                    value={orderForm.product}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, product: e.target.value }))}
                    placeholder="Which product are you ordering?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Additional Notes
                  </label>
                  <Textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any special requirements or notes"
                    rows={3}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full text-lg py-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};