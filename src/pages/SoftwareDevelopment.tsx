import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ExternalLink, Eye, Calendar, Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface SoftwareDemo {
  id: string;
  title: string;
  description?: string;
  demo_url: string;
  thumbnail_url?: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function SoftwareDevelopment() {
  const [demos, setDemos] = useState<SoftwareDemo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const { data, error } = await supabase
        .from('software_demos')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      setDemos(data || []);
    } catch (error) {
      console.error('Error fetching software demos:', error);
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
          <h1 className="text-4xl font-bold mb-4">Software Development</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our software development projects and see live demos of our work
          </p>
        </div>

        {demos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No software demos available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo) => (
              <Card key={demo.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  {demo.thumbnail_url && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={demo.thumbnail_url}
                        alt={demo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {demo.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(demo.created_at).toLocaleDateString()}</span>
                    <Badge variant="secondary" className="ml-2">
                      <Tag className="h-3 w-3 mr-1" />
                      {demo.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {demo.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {demo.description}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-300"
                      asChild
                    >
                      <a href={demo.demo_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}