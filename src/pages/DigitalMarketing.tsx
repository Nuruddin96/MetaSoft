import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Calendar, Building, Star } from "lucide-react";
import { Link } from "react-router-dom";

interface MarketingPerformance {
  id: string;
  client_name: string;
  client_logo_url?: string;
  industry?: string;
  campaign_type?: string;
  results_summary?: string;
  metrics: any;
  start_date?: string;
  end_date?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export default function DigitalMarketing() {
  const [performances, setPerformances] = useState<MarketingPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformances();
  }, []);

  const fetchPerformances = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_performance')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPerformances(data || []);
    } catch (error) {
      console.error('Error fetching marketing performances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-card rounded-lg h-64"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Digital Marketing</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how we've helped businesses grow with our digital marketing strategies
          </p>
        </div>

        {performances.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No marketing case studies available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performances.map((performance) => (
              <Card key={performance.id} className={`group hover:shadow-lg transition-all duration-300 ${performance.is_featured ? 'ring-2 ring-primary/20' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {performance.client_logo_url && (
                        <img
                          src={performance.client_logo_url}
                          alt={performance.client_name}
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {performance.client_name}
                      </CardTitle>
                    </div>
                    {performance.is_featured && (
                      <Badge variant="default" className="bg-gradient-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Building className="h-3 w-3" />
                    <span>{performance.industry || 'General'}</span>
                    {performance.campaign_type && (
                      <>
                        <span>•</span>
                        <span>{performance.campaign_type}</span>
                      </>
                    )}
                  </div>

                  {performance.start_date && performance.end_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(performance.start_date).toLocaleDateString()} - {new Date(performance.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  {performance.results_summary && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {performance.results_summary}
                    </p>
                  )}

                  {performance.metrics && Object.keys(performance.metrics).length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {Object.entries(performance.metrics).slice(0, 4).map(([key, value]) => (
                        <div key={key} className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-sm font-medium text-primary">
                            {String(value)}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {key.replace(/_/g, ' ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-300"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Full Case Study
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}