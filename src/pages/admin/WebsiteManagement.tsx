import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Save, Upload, Eye } from "lucide-react";

interface WebsiteSettings {
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
}

export default function WebsiteManagement() {
  const [settings, setSettings] = useState<WebsiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWebsiteSettings();
  }, []);

  const fetchWebsiteSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      // Convert array of settings to object
      const settingsObj: { [key: string]: any } = {};
      data?.forEach((setting) => {
        if (setting.value && typeof setting.value === 'object' && !Array.isArray(setting.value)) {
          const valueObj = setting.value as { [key: string]: any };
          if ('value' in valueObj) {
            settingsObj[setting.key] = valueObj.value;
          }
        }
      });

      setSettings(settingsObj as WebsiteSettings);
    } catch (error) {
      console.error('Error fetching website settings:', error);
      toast.error('Failed to fetch website settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof WebsiteSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value: { value },
          description: `${key.replace(/_/g, ' ')} setting`
        });

      if (error) throw error;
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      throw error;
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        saveSetting(key, value)
      );

      await Promise.all(promises);
      toast.success('All settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (sectionKeys: string[]) => {
    setSaving(true);
    try {
      const promises = sectionKeys.map(key => 
        saveSetting(key, settings[key as keyof WebsiteSettings])
      );

      await Promise.all(promises);
      toast.success('Section saved successfully');
    } catch (error) {
      toast.error('Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading website settings...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Website Management</h1>
            <p className="text-muted-foreground">
              Manage your website's content, hero section, footer, and branding
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              onClick={handleSaveAll} 
              disabled={saving}
              className="bg-gradient-primary hover:opacity-90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save All'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="banner">Banner</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>

          {/* Hero Section */}
          <TabsContent value="hero">
            <Card>
              <CardHeader>
                <CardTitle>Hero Section Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="hero_title">Hero Title</Label>
                  <Input
                    id="hero_title"
                    value={settings.hero_title || ''}
                    onChange={(e) => updateSetting('hero_title', e.target.value)}
                    placeholder="Enter hero title"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={settings.hero_subtitle || ''}
                    onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                    placeholder="Enter hero subtitle"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="hero_cta_text">Call to Action Text</Label>
                  <Input
                    id="hero_cta_text"
                    value={settings.hero_cta_text || ''}
                    onChange={(e) => updateSetting('hero_cta_text', e.target.value)}
                    placeholder="Enter CTA button text"
                  />
                </div>
                <div>
                  <Label htmlFor="hero_background_image">Background Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hero_background_image"
                      value={settings.hero_background_image || ''}
                      onChange={(e) => updateSetting('hero_background_image', e.target.value)}
                      placeholder="Enter image URL or upload"
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSaveSection(['hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_background_image'])}
                  disabled={saving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Hero Section
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Footer */}
          <TabsContent value="footer">
            <Card>
              <CardHeader>
                <CardTitle>Footer Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footer_description">Footer Description</Label>
                  <Textarea
                    id="footer_description"
                    value={settings.footer_description || ''}
                    onChange={(e) => updateSetting('footer_description', e.target.value)}
                    placeholder="Enter footer description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="footer_contact_email">Contact Email</Label>
                    <Input
                      id="footer_contact_email"
                      type="email"
                      value={settings.footer_contact_email || ''}
                      onChange={(e) => updateSetting('footer_contact_email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="footer_contact_phone">Contact Phone</Label>
                    <Input
                      id="footer_contact_phone"
                      value={settings.footer_contact_phone || ''}
                      onChange={(e) => updateSetting('footer_contact_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="footer_address">Address</Label>
                  <Textarea
                    id="footer_address"
                    value={settings.footer_address || ''}
                    onChange={(e) => updateSetting('footer_address', e.target.value)}
                    placeholder="Enter business address"
                    rows={2}
                  />
                </div>
                <Button 
                  onClick={() => handleSaveSection(['footer_description', 'footer_contact_email', 'footer_contact_phone', 'footer_address'])}
                  disabled={saving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Footer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banner */}
          <TabsContent value="banner">
            <Card>
              <CardHeader>
                <CardTitle>Banner Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="banner_enabled"
                    checked={settings.banner_enabled || false}
                    onChange={(e) => updateSetting('banner_enabled', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="banner_enabled">Enable Banner</Label>
                </div>
                <div>
                  <Label htmlFor="banner_text">Banner Text</Label>
                  <Input
                    id="banner_text"
                    value={settings.banner_text || ''}
                    onChange={(e) => updateSetting('banner_text', e.target.value)}
                    placeholder="Enter banner announcement text"
                  />
                </div>
                <Button 
                  onClick={() => handleSaveSection(['banner_enabled', 'banner_text'])}
                  disabled={saving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Banner
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="site_name">Site Name</Label>
                  <Input
                    id="site_name"
                    value={settings.site_name || ''}
                    onChange={(e) => updateSetting('site_name', e.target.value)}
                    placeholder="Enter site name"
                  />
                </div>
                <div>
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={settings.site_description || ''}
                    onChange={(e) => updateSetting('site_description', e.target.value)}
                    placeholder="Enter site description for SEO"
                    rows={3}
                  />
                </div>
                <Button 
                  onClick={() => handleSaveSection(['site_name', 'site_description'])}
                  disabled={saving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pages Management */}
          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Page Management</CardTitle>
                  <Button 
                    onClick={() => window.open('/admin/pages', '_blank')}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    Open Page Manager
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">What you can do:</h4>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Create custom pages (About, Terms, etc.)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Edit page content with HTML support
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Control page visibility (publish/draft)
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        SEO meta descriptions
                      </li>
                      <li className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                        Custom URL slugs
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold">Quick Actions:</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => window.open('/admin/pages', '_blank')}
                      >
                        View All Pages
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => window.open('/admin/pages', '_blank')}
                      >
                        Create New Page
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}