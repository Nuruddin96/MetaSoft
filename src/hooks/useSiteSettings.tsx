import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  hero_title?: string;
  hero_subtitle?: string;
  hero_cta_text?: string;
  hero_background_image?: string;
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
        if (setting.value && typeof setting.value === 'object' && !Array.isArray(setting.value)) {
          const valueObj = setting.value as { [key: string]: any };
          if ('value' in valueObj) {
            (settingsObj as any)[setting.key] = valueObj.value;
          }
        }
      });

      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, refetch: fetchSettings };
};