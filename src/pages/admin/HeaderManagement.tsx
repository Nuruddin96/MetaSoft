import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/admin/FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface SiteBranding {
  id: string;
  site_name: string;
  logo_url: string | null;
}

export default function HeaderManagement() {
  const [branding, setBranding] = useState<SiteBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const { data, error } = await supabase
        .from('site_branding')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBranding(data);
      } else {
        // Create default branding if none exists
        const { data: newBranding, error: createError } = await supabase
          .from('site_branding')
          .insert({ site_name: 'MetaSoft BD', logo_url: null })
          .select()
          .single();

        if (createError) throw createError;
        setBranding(newBranding);
      }
    } catch (error) {
      console.error('Error fetching site branding:', error);
      toast.error('Failed to load site branding');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!branding) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('site_branding')
        .update({
          site_name: branding.site_name,
          logo_url: branding.logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', branding.id);

      if (error) throw error;
      
      toast.success('Site branding updated successfully');
    } catch (error) {
      console.error('Error updating site branding:', error);
      toast.error('Failed to update site branding');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (url: string) => {
    setBranding(prev => prev ? { ...prev, logo_url: url } : null);
    setShowFileUpload(false);
    toast.success('Logo uploaded successfully');
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Header Management</h1>
            <p className="text-muted-foreground">
              Manage your website's header logo and site name
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Site Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={branding?.site_name || ''}
                onChange={(e) => setBranding(prev => prev ? { ...prev, site_name: e.target.value } : null)}
                placeholder="Enter site name"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="space-y-4">
                {branding?.logo_url && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={branding.logo_url}
                      alt="Current logo"
                      className="h-12 w-12 object-contain rounded border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBranding(prev => prev ? { ...prev, logo_url: null } : null)}
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => setShowFileUpload(!showFileUpload)}
                >
                  {branding?.logo_url ? 'Change Logo' : 'Upload Logo'}
                </Button>

                {showFileUpload && (
                  <FileUpload
                    acceptedTypes="image/*"
                    maxSize={5}
                    bucketName="course-thumbnails"
                    folder="logos"
                    onFileUploaded={handleLogoUpload}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}