import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_cta_link?: string;
  hero_background_image?: string;
  hero_enabled?: string;
  footer_description?: string;
  footer_contact_email?: string;
  footer_contact_phone?: string;
  footer_address?: string;
  banner_text?: string;
  banner_enabled?: boolean;
  site_name?: string;
  site_description?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_linkedin?: string;
  social_twitter?: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      const settingsObj: SiteSettings = {};
      data?.forEach((setting) => {
        let value = setting.value;
        
        // Handle different value formats from database
        if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) {
          // Handle wrapped format: { value: actualValue }
          value = (value as any).value;
        }
        
        // Now handle the actual value
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            (settingsObj as any)[setting.key] = parsed;
          } catch {
            (settingsObj as any)[setting.key] = value;
          }
        } else {
          (settingsObj as any)[setting.key] = value;
        }
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSetting = (key: keyof SiteSettings) => {
    return settings[key];
  };

  return { settings, loading, refetch: fetchSettings, getSetting };
};