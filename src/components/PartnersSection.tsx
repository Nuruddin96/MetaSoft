import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ExternalLink } from "lucide-react";

interface CompanyPartner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  order_index: number;
  is_active: boolean;
}

export const PartnersSection = () => {
  const [partners, setPartners] = useState<CompanyPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('company_partners')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 w-48 mx-auto"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-80 mx-auto"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                <div className="w-24 h-16 bg-muted animate-pulse rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {settings.partners_section_title || "Our Partners"}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings.partners_section_description || "Trusted by leading companies and organizations"}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-center group"
            >
              {partner.website_url ? (
                <a
                  href={partner.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white border border-gray-100"
                >
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-full h-16 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="h-4 w-4 text-primary" />
                  </div>
                </a>
              ) : (
                <div className="p-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white border border-gray-100">
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-full h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Partner Marquee Effect for many partners */}
        {partners.length > 6 && (
          <div className="mt-12 overflow-hidden">
            <div className="flex animate-scroll space-x-8">
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 w-32 h-20 flex items-center justify-center"
                >
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};