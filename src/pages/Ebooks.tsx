import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Eye, User, FileText, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface Ebook {
  id: string;
  title: string;
  description?: string;
  author?: string;
  category?: string;
  pages?: number;
  price: number;
  thumbnail_url?: string;
  file_url?: string;
  is_published: boolean;
  created_at: string;
}

export default function Ebooks() {
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEbooks();
  }, []);

  const fetchEbooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEbooks(data || []);
    } catch (error) {
      console.error('Error fetching ebooks:', error);
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
          <h1 className="text-4xl font-bold mb-4">E-books</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Download our comprehensive e-books and guides to enhance your learning
          </p>
        </div>

        {ebooks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No e-books available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ebooks.map((ebook) => (
              <Card key={ebook.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  {ebook.thumbnail_url && (
                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-4">
                      <img
                        src={ebook.thumbnail_url}
                        alt={ebook.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {ebook.title}
                  </CardTitle>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {ebook.author && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{ebook.author}</span>
                      </div>
                    )}
                    {ebook.pages && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>{ebook.pages} pages</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {ebook.category && (
                      <Badge variant="secondary">
                        {ebook.category}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(ebook.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {ebook.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {ebook.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-primary">
                      {ebook.price === 0 ? 'Free' : `৳${ebook.price.toLocaleString()}`}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-all duration-300"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-primary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {ebook.price === 0 ? 'Download' : 'Buy'}
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