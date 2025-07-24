import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";

interface HeroBanner {
  id: string;
  title: string;
  subtitle: string | null;
  background_image: string | null;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function HeroBannerManagement() {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    background_image: "",
    cta_text: "Get Started",
    cta_link: "/courses",
    order_index: 1,
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('hero_banners')
          .update(formData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Banner updated successfully');
      } else {
        const { error } = await supabase
          .from('hero_banners')
          .insert([formData]);

        if (error) throw error;
        toast.success('Banner created successfully');
      }

      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleEdit = (banner: HeroBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      background_image: banner.background_image || "",
      cta_text: banner.cta_text,
      cta_link: banner.cta_link,
      order_index: banner.order_index,
      is_active: banner.is_active,
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Banner ${is_active ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast.error('Failed to update banner status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      background_image: "",
      cta_text: "Get Started",
      cta_link: "/courses",
      order_index: banners.length + 1,
      is_active: true,
    });
    setEditingBanner(null);
    setIsCreating(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Hero Banner Management</h1>
          <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Banner
          </Button>
        </div>

        {/* Banner Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter banner title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="order_index">Order</Label>
                    <Input
                      id="order_index"
                      type="number"
                      min="1"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle</Label>
                  <Textarea
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Enter banner subtitle"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background_image">Background Image URL</Label>
                  <Input
                    id="background_image"
                    value={formData.background_image}
                    onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cta_text">CTA Button Text</Label>
                    <Input
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      placeholder="Get Started"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cta_link">CTA Button Link</Label>
                    <Input
                      id="cta_link"
                      value={formData.cta_link}
                      onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                      placeholder="/courses"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingBanner ? 'Update Banner' : 'Create Banner'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Banners List */}
        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold">{banner.title}</h3>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    {banner.subtitle && (
                      <p className="text-muted-foreground mb-2 line-clamp-2">
                        {banner.subtitle}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Order: {banner.order_index}</span>
                      <span>CTA: {banner.cta_text}</span>
                      <span>Link: {banner.cta_link}</span>
                    </div>
                    
                    {banner.background_image && (
                      <div className="mt-2">
                        <img 
                          src={banner.background_image} 
                          alt="Banner background" 
                          className="w-32 h-20 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(banner.id, !banner.is_active)}
                    >
                      {banner.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(banner)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {banners.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2">No hero banners found</h3>
                  <p className="mb-4">Create your first hero banner to get started.</p>
                  <Button onClick={() => setIsCreating(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Banner
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}