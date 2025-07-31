import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileUpload } from "@/components/admin/FileUpload";
import { Plus, Edit, Trash2, Save, X, ExternalLink } from "lucide-react";

interface CompanyPartner {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  order_index: number;
  is_active: boolean;
}

export default function PartnersManagement() {
  const [partners, setPartners] = useState<CompanyPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPartner, setEditingPartner] = useState<CompanyPartner | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website_url: '',
    order_index: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('company_partners')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast({
        title: "Error",
        description: "Failed to load partners",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPartner) {
        const { error } = await supabase
          .from('company_partners')
          .update(formData)
          .eq('id', editingPartner.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Partner updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('company_partners')
          .insert([formData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Partner created successfully",
        });
      }

      resetForm();
      fetchPartners();
    } catch (error) {
      console.error('Error saving partner:', error);
      toast({
        title: "Error",
        description: "Failed to save partner",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (partner: CompanyPartner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name,
      logo_url: partner.logo_url,
      website_url: partner.website_url,
      order_index: partner.order_index,
      is_active: partner.is_active
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this partner?')) return;

    try {
      const { error } = await supabase
        .from('company_partners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
      fetchPartners();
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('company_partners')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
      fetchPartners();
    } catch (error) {
      console.error('Error toggling partner status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      website_url: '',
      order_index: partners.length + 1,
      is_active: true
    });
    setEditingPartner(null);
    setIsCreating(false);
  };

  const handleLogoUpload = (url: string) => {
    setFormData(prev => ({ ...prev, logo_url: url }));
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
          <h1 className="text-3xl font-bold">Partners Management</h1>
          <p className="text-muted-foreground">
            Manage company logos and partners displayed on the homepage
          </p>
        </div>

        {/* Add New Partner Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Company Partners</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Partner
          </Button>
        </div>

        {/* Partner Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="logo">Company Logo</Label>
                  <FileUpload
                    onUploadComplete={handleLogoUpload}
                  />
                  {formData.logo_url && (
                    <div className="mt-2">
                      <img
                        src={formData.logo_url}
                        alt="Logo preview"
                        className="w-32 h-24 object-contain border rounded-lg"
                      />
                    </div>
                  )}
                  <Input
                    id="logo"
                    value={formData.logo_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                    placeholder="Or enter logo URL directly"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="website_url">Website URL (Optional)</Label>
                  <Input
                    id="website_url"
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://company-website.com"
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
                  <Button type="submit" disabled={!formData.logo_url}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingPartner ? 'Update Partner' : 'Create Partner'}
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

        {/* Partners List */}
        <div className="grid gap-4">
          {partners.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No partners created yet.</p>
                <Button onClick={() => setIsCreating(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Partner
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partners.map((partner) => (
                <Card key={partner.id} className={!partner.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <img
                        src={partner.logo_url}
                        alt={partner.name}
                        className="w-24 h-16 object-contain mx-auto border rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold">{partner.name}</h3>
                        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground mt-2">
                          <span>Order: {partner.order_index}</span>
                          <span>Status: {partner.is_active ? 'Active' : 'Inactive'}</span>
                        </div>
                        {partner.website_url && (
                          <a
                            href={partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center space-x-1 text-primary hover:underline text-xs mt-2"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Visit Website</span>
                          </a>
                        )}
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Switch
                          checked={partner.is_active}
                          onCheckedChange={() => toggleActive(partner.id, partner.is_active)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(partner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(partner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}