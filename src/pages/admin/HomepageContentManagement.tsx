import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

interface DynamicFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
}

interface SectionSettings {
  features_section_title: string;
  features_section_description: string;
}

const iconOptions = [
  'Video', 'FileText', 'Users', 'Award', 'Clock', 'Shield', 
  'Smartphone', 'BookOpen', 'MessageCircle', 'Star', 'Target',
  'Heart', 'Zap', 'Gift', 'TrendingUp', 'CheckCircle'
];

export default function HomepageContentManagement() {
  const [features, setFeatures] = useState<DynamicFeature[]>([]);
  const [sectionSettings, setSectionSettings] = useState<SectionSettings>({
    features_section_title: '',
    features_section_description: ''
  });
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingFeature, setEditingFeature] = useState<DynamicFeature | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Video',
    order_index: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchFeatures();
    fetchSectionSettings();
  }, []);

  const fetchFeatures = async () => {
    try {
      const { data, error } = await supabase
        .from('dynamic_features')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error fetching features:', error);
      toast({
        title: "Error",
        description: "Failed to load features",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['features_section_title', 'features_section_description']);

      if (error) throw error;

      const settings: any = {};
      data?.forEach(setting => {
        settings[setting.key] = typeof setting.value === 'string' ? JSON.parse(setting.value || '""') : setting.value;
      });
      setSectionSettings(settings);
    } catch (error) {
      console.error('Error fetching section settings:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingFeature) {
        const { error } = await supabase
          .from('dynamic_features')
          .update(formData)
          .eq('id', editingFeature.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Feature updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('dynamic_features')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Feature created successfully",
        });
      }

      resetForm();
      fetchFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast({
        title: "Error",
        description: "Failed to save feature",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (feature: DynamicFeature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      order_index: feature.order_index,
      is_active: feature.is_active
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;

    try {
      const { error } = await supabase
        .from('dynamic_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Feature deleted successfully",
      });
      fetchFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast({
        title: "Error",
        description: "Failed to delete feature",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('dynamic_features')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
      fetchFeatures();
    } catch (error) {
      console.error('Error toggling feature status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Video',
      order_index: features.length + 1,
      is_active: true
    });
    setEditingFeature(null);
    setIsCreating(false);
  };

  const saveSectionSettings = async () => {
    try {
      const updates = [
        {
          key: 'features_section_title',
          value: JSON.stringify(sectionSettings.features_section_title)
        },
        {
          key: 'features_section_description',
          value: JSON.stringify(sectionSettings.features_section_description)
        }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Section settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving section settings:', error);
      toast({
        title: "Error",
        description: "Failed to save section settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Content Management</h1>
          <p className="text-muted-foreground">
            Manage the dynamic features section and other homepage content
          </p>
        </div>

        {/* Section Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Features Section Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="section-title">Section Title</Label>
              <Input
                id="section-title"
                value={sectionSettings.features_section_title}
                onChange={(e) => setSectionSettings(prev => ({
                  ...prev,
                  features_section_title: e.target.value
                }))}
                placeholder="Why Choose MetaSoft BD?"
              />
            </div>
            <div>
              <Label htmlFor="section-description">Section Description</Label>
              <Textarea
                id="section-description"
                value={sectionSettings.features_section_description}
                onChange={(e) => setSectionSettings(prev => ({
                  ...prev,
                  features_section_description: e.target.value
                }))}
                placeholder="Everything you need to master e-commerce..."
                rows={3}
              />
            </div>
            <Button onClick={saveSectionSettings}>
              <Save className="h-4 w-4 mr-2" />
              Save Section Settings
            </Button>
          </CardContent>
        </Card>

        {/* Add New Feature Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Features</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Feature
          </Button>
        </div>

        {/* Feature Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>{editingFeature ? 'Edit Feature' : 'Add New Feature'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon</Label>
                    <Select 
                      value={formData.icon} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map(icon => (
                          <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="order">Order Index</Label>
                    <Input
                      id="order"
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) }))}
                      min="1"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingFeature ? 'Update Feature' : 'Create Feature'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Features List */}
        <div className="grid gap-4">
          {features.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No features created yet.</p>
                <Button onClick={() => setIsCreating(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Feature
                </Button>
              </CardContent>
            </Card>
          ) : (
            features.map((feature) => (
              <Card key={feature.id} className={!feature.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-medium">{feature.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{feature.title}</h3>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Order: {feature.order_index} | Status: {feature.is_active ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={feature.is_active}
                        onCheckedChange={() => toggleActive(feature.id, feature.is_active)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(feature)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(feature.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}