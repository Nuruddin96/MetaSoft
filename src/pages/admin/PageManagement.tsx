import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Eye, Save, Image, Video, LayoutIcon, X } from "lucide-react";

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

interface PageFormData {
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_published: boolean;
  banner_enabled: boolean;
  banner_url: string;
  banner_title: string;
  images_enabled: boolean;
  images: string[];
  videos_enabled: boolean;
  videos: string[];
}

export default function PageManagement() {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [formData, setFormData] = useState<PageFormData>({
    title: '',
    slug: '',
    content: '',
    meta_description: '',
    is_published: false,
    banner_enabled: false,
    banner_url: '',
    banner_title: '',
    images_enabled: false,
    images: [],
    videos_enabled: false,
    videos: []
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPage ? prev.slug : generateSlug(title)
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error('Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      const pageData = {
        ...formData,
        created_by: profile.id
      };

      let error;
      if (editingPage) {
        ({ error } = await supabase
          .from('custom_pages')
          .update(pageData)
          .eq('id', editingPage.id));
      } else {
        ({ error } = await supabase
          .from('custom_pages')
          .insert([pageData]));
      }

      if (error) throw error;

      toast.success(editingPage ? 'Page updated successfully' : 'Page created successfully');
      setDialogOpen(false);
      resetForm();
      fetchPages();
    } catch (error) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (page: CustomPage) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || '',
      meta_description: page.meta_description || '',
      is_published: page.is_published,
      banner_enabled: page.banner_enabled || false,
      banner_url: page.banner_url || '',
      banner_title: page.banner_title || '',
      images_enabled: page.images_enabled || false,
      images: page.images || [],
      videos_enabled: page.videos_enabled || false,
      videos: page.videos || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('custom_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      meta_description: '',
      is_published: false,
      banner_enabled: false,
      banner_url: '',
      banner_title: '',
      images_enabled: false,
      images: [],
      videos_enabled: false,
      videos: []
    });
    setEditingPage(null);
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addVideo = () => {
    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, '']
    }));
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
  };

  const updateVideo = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.map((vid, i) => i === index ? value : vid)
    }));
  };

  const handleNewPage = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading pages...</div>
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
            <h1 className="text-3xl font-bold">Page Management</h1>
            <p className="text-muted-foreground">
              Create and manage custom pages for your website
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPage} className="bg-gradient-primary hover:opacity-90">
                <Plus className="h-4 w-4 mr-2" />
                Create Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPage ? 'Edit Page' : 'Create New Page'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter page title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="page-url-slug"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      URL will be: /{formData.slug}
                    </p>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="meta_description">Meta Description (SEO)</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description for search engines"
                    rows={2}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Page Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your page content here..."
                    rows={10}
                    className="min-h-[200px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can use plain text or basic HTML. Markdown support coming soon.
                  </p>
                </div>

                {/* Media Elements Section */}
                <div className="space-y-6 border-t pt-6">
                  <h3 className="text-lg font-semibold">Media Elements</h3>
                  
                  {/* Banner Section */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <LayoutIcon className="h-5 w-5" />
                        <Label className="text-base font-medium">Banner</Label>
                      </div>
                      <Switch
                        checked={formData.banner_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, banner_enabled: checked }))}
                      />
                    </div>
                    {formData.banner_enabled && (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="banner_title">Banner Title</Label>
                          <Input
                            id="banner_title"
                            value={formData.banner_title}
                            onChange={(e) => setFormData(prev => ({ ...prev, banner_title: e.target.value }))}
                            placeholder="Enter banner title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="banner_url">Banner Image URL</Label>
                          <Input
                            id="banner_url"
                            value={formData.banner_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, banner_url: e.target.value }))}
                            placeholder="https://example.com/banner.jpg"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images Section */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="h-5 w-5" />
                        <Label className="text-base font-medium">Images</Label>
                      </div>
                      <Switch
                        checked={formData.images_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, images_enabled: checked }))}
                      />
                    </div>
                    {formData.images_enabled && (
                      <div className="space-y-3">
                        {formData.images.map((image, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={image}
                              onChange={(e) => updateImage(index, e.target.value)}
                              placeholder="https://example.com/image.jpg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addImage}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Image
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Videos Section */}
                  <div className="space-y-4 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5" />
                        <Label className="text-base font-medium">Videos</Label>
                      </div>
                      <Switch
                        checked={formData.videos_enabled}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, videos_enabled: checked }))}
                      />
                    </div>
                    {formData.videos_enabled && (
                      <div className="space-y-3">
                        {formData.videos.map((video, index) => (
                          <div key={index} className="flex space-x-2">
                            <Input
                              value={video}
                              onChange={(e) => updateVideo(index, e.target.value)}
                              placeholder="https://youtube.com/embed/VIDEO_ID or video URL"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeVideo(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addVideo}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Video
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          You can add YouTube embed URLs or direct video file URLs
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="is_published">Publish page</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : editingPage ? 'Update Page' : 'Create Page'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Pages</CardTitle>
          </CardHeader>
          <CardContent>
            {pages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No custom pages created yet</p>
                <Button onClick={handleNewPage} className="bg-gradient-primary hover:opacity-90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Page
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          /{page.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={page.is_published ? "default" : "secondary"}>
                          {page.is_published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(page.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {page.is_published && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/${page.slug}`, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(page)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(page.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}