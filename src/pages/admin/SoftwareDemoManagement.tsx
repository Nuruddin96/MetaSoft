import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, Edit, Plus } from "lucide-react";

interface SoftwareDemo {
  id: string;
  title: string;
  description?: string;
  demo_url: string;
  thumbnail_url?: string;
  category: string;
  is_active: boolean;
  order_index: number;
}

export default function SoftwareDemoManagement() {
  const [demos, setDemos] = useState<SoftwareDemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDemo, setEditingDemo] = useState<SoftwareDemo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    demo_url: '',
    thumbnail_url: '',
    category: 'software',
    is_active: true,
    order_index: 1
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDemos();
  }, []);

  const fetchDemos = async () => {
    try {
      const { data, error } = await supabase
        .from('software_demos')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setDemos(data || []);
    } catch (error) {
      console.error('Error fetching demos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch software demos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingDemo) {
        const { error } = await supabase
          .from('software_demos')
          .update(formData)
          .eq('id', editingDemo.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Software demo updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('software_demos')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Software demo created successfully",
        });
      }

      setFormData({
        title: '',
        description: '',
        demo_url: '',
        thumbnail_url: '',
        category: 'software',
        is_active: true,
        order_index: 1
      });
      setEditingDemo(null);
      fetchDemos();
    } catch (error) {
      console.error('Error saving demo:', error);
      toast({
        title: "Error",
        description: "Failed to save software demo",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (demo: SoftwareDemo) => {
    setEditingDemo(demo);
    setFormData({
      title: demo.title,
      description: demo.description || '',
      demo_url: demo.demo_url,
      thumbnail_url: demo.thumbnail_url || '',
      category: demo.category,
      is_active: demo.is_active,
      order_index: demo.order_index
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this demo?')) return;

    try {
      const { error } = await supabase
        .from('software_demos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Software demo deleted successfully",
      });

      fetchDemos();
    } catch (error) {
      console.error('Error deleting demo:', error);
      toast({
        title: "Error",
        description: "Failed to delete software demo",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Software Demo Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {editingDemo ? 'Edit Software Demo' : 'Add New Software Demo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="web">Web Application</SelectItem>
                    <SelectItem value="mobile">Mobile App</SelectItem>
                    <SelectItem value="desktop">Desktop Application</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="demo_url">Demo URL</Label>
                <Input
                  id="demo_url"
                  type="url"
                  value={formData.demo_url}
                  onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="order_index">Order Index</Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  min="1"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                {editingDemo ? 'Update Demo' : 'Add Demo'}
              </Button>
              {editingDemo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingDemo(null);
                    setFormData({
                      title: '',
                      description: '',
                      demo_url: '',
                      thumbnail_url: '',
                      category: 'software',
                      is_active: true,
                      order_index: 1
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Software Demos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demos.map((demo) => (
              <div key={demo.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{demo.title}</h3>
                  <p className="text-sm text-muted-foreground">{demo.description}</p>
                  <p className="text-xs text-muted-foreground">
                    Category: {demo.category} | Order: {demo.order_index} | 
                    Status: {demo.is_active ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(demo)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(demo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}