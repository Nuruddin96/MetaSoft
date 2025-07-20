import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content?: string;
  meta_description?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  banner_enabled?: boolean;
  banner_url?: string;
  banner_title?: string;
  images_enabled?: boolean;
  images?: string[];
  videos_enabled?: boolean;
  videos?: string[];
}

export default function CustomPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<CustomPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setPage(data);
        // Update page title for SEO
        document.title = data.title;
        if (data.meta_description) {
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', data.meta_description);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (notFound || !page) {
    return <Navigate to="/404" replace />;
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article className="space-y-8">
          {/* Banner Section */}
          {page.banner_enabled && page.banner_url && (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <img 
                src={page.banner_url} 
                alt={page.banner_title || page.title}
                className="w-full h-full object-cover"
              />
              {page.banner_title && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h1 className="text-white text-4xl md:text-6xl font-bold text-center">{page.banner_title}</h1>
                </div>
              )}
            </div>
          )}

          {/* Page Title (if no banner or no banner title) */}
          {(!page.banner_enabled || !page.banner_title) && (
            <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
          )}

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: page.content || '' }}
          />

          {/* Images Section */}
          {page.images_enabled && page.images && page.images.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {page.images.filter(Boolean).map((image, index) => (
                  <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={image} 
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos Section */}
          {page.videos_enabled && page.videos && page.videos.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">Videos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {page.videos.filter(Boolean).map((video, index) => (
                  <div key={index} className="aspect-video rounded-lg overflow-hidden">
                    {video.includes('youtube.com') || video.includes('youtu.be') ? (
                      <iframe
                        src={video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        title={`Video ${index + 1}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </main>
  );
}