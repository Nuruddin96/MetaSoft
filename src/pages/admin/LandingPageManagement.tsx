import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Download } from "lucide-react";

interface LandingPageSection {
  id?: string;
  section_type: string;
  order_index: number;
  title?: string;
  content?: string;
  video_url?: string;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  bullet_points?: string[];
  is_active?: boolean;
}

interface ReviewVideo {
  id?: string;
  title: string;
  video_url: string;
  thumbnail_url?: string;
  customer_name?: string;
  order_index: number;
  is_active?: boolean;
}

interface Order {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address?: string;
  product?: string;
  notes?: string;
  status: string;
  created_at: string;
}

export const LandingPageManagement = () => {
  const [sections, setSections] = useState<LandingPageSection[]>([]);
  const [reviewVideos, setReviewVideos] = useState<ReviewVideo[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null);
  const [editingVideo, setEditingVideo] = useState<ReviewVideo | null>(null);
  const [newBulletPoint, setNewBulletPoint] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      await Promise.all([
        fetchSections(),
        fetchReviewVideos(),
        fetchOrders()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('landing_page_sections')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to fetch sections');
    } else {
      setSections(data?.map(section => ({
        ...section,
        bullet_points: Array.isArray(section.bullet_points) ? section.bullet_points as string[] : []
      })) || []);
    }
  };

  const fetchReviewVideos = async () => {
    const { data, error } = await supabase
      .from('customer_review_videos')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching review videos:', error);
      toast.error('Failed to fetch review videos');
    } else {
      setReviewVideos(data || []);
    }
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('landing_page_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } else {
      setOrders(data || []);
    }
  };

  const saveSection = async () => {
    if (!editingSection) return;

    try {
      const sectionData = {
        ...editingSection,
        bullet_points: editingSection.bullet_points || []
      };

      if (editingSection.id) {
        const { error } = await supabase
          .from('landing_page_sections')
          .update(sectionData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast.success('Section updated successfully');
      } else {
        const { error } = await supabase
          .from('landing_page_sections')
          .insert([sectionData]);

        if (error) throw error;
        toast.success('Section created successfully');
      }

      setEditingSection(null);
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error('Failed to save section');
    }
  };

  const saveReviewVideo = async () => {
    if (!editingVideo) return;

    try {
      if (editingVideo.id) {
        const { error } = await supabase
          .from('customer_review_videos')
          .update(editingVideo)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast.success('Review video updated successfully');
      } else {
        const { error } = await supabase
          .from('customer_review_videos')
          .insert([editingVideo]);

        if (error) throw error;
        toast.success('Review video created successfully');
      }

      setEditingVideo(null);
      fetchReviewVideos();
    } catch (error) {
      console.error('Error saving review video:', error);
      toast.error('Failed to save review video');
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;

    try {
      const { error } = await supabase
        .from('landing_page_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Section deleted successfully');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error('Failed to delete section');
    }
  };

  const deleteReviewVideo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review video?')) return;

    try {
      const { error } = await supabase
        .from('customer_review_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review video deleted successfully');
      fetchReviewVideos();
    } catch (error) {
      console.error('Error deleting review video:', error);
      toast.error('Failed to delete review video');
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('landing_page_orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const exportOrders = () => {
    const csv = [
      ['Name', 'Phone', 'Email', 'Address', 'Product', 'Notes', 'Status', 'Date'],
      ...orders.map(order => [
        order.customer_name,
        order.phone,
        order.email,
        order.address || '',
        order.product || '',
        order.notes || '',
        order.status,
        new Date(order.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'landing-page-orders.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addBulletPoint = () => {
    if (!newBulletPoint.trim() || !editingSection) return;
    
    setEditingSection({
      ...editingSection,
      bullet_points: [...(editingSection.bullet_points || []), newBulletPoint.trim()]
    });
    setNewBulletPoint('');
  };

  const removeBulletPoint = (index: number) => {
    if (!editingSection) return;
    
    const updatedPoints = editingSection.bullet_points?.filter((_, i) => i !== index) || [];
    setEditingSection({
      ...editingSection,
      bullet_points: updatedPoints
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Landing Page Management</h1>
        </div>

        <Tabs defaultValue="sections" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sections">Page Sections</TabsTrigger>
            <TabsTrigger value="reviews">Review Videos</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Landing Page Sections</h2>
              <Button onClick={() => setEditingSection({
                section_type: 'header',
                order_index: sections.length + 1,
                is_active: true
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            <div className="grid gap-4">
              {sections.map((section) => (
                <Card key={section.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Step {section.order_index}</Badge>
                      <Badge>{section.section_type}</Badge>
                      <CardTitle className="text-lg">{section.title || 'Untitled'}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={section.is_active}
                        onCheckedChange={async (checked) => {
                          try {
                            const { error } = await supabase
                              .from('landing_page_sections')
                              .update({ is_active: checked })
                              .eq('id', section.id);
                            
                            if (error) throw error;
                            fetchSections();
                          } catch (error) {
                            toast.error('Failed to update section status');
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingSection(section)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => section.id && deleteSection(section.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {section.content?.substring(0, 100)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Customer Review Videos</h2>
              <Button onClick={() => setEditingVideo({
                title: '',
                video_url: '',
                order_index: reviewVideos.length + 1,
                is_active: true
              })}>
                <Plus className="w-4 h-4 mr-2" />
                Add Review Video
              </Button>
            </div>

            <div className="grid gap-4">
              {reviewVideos.map((video) => (
                <Card key={video.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">#{video.order_index}</Badge>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={video.is_active}
                        onCheckedChange={async (checked) => {
                          try {
                            const { error } = await supabase
                              .from('customer_review_videos')
                              .update({ is_active: checked })
                              .eq('id', video.id);
                            
                            if (error) throw error;
                            fetchReviewVideos();
                          } catch (error) {
                            toast.error('Failed to update video status');
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingVideo(video)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => video.id && deleteReviewVideo(video.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Customer: {video.customer_name || 'Anonymous'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Customer Orders</h2>
              <Button onClick={exportOrders}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            <div className="grid gap-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.customer_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {order.phone} • {order.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.product && (
                        <p><strong>Product:</strong> {order.product}</p>
                      )}
                      {order.address && (
                        <p><strong>Address:</strong> {order.address}</p>
                      )}
                      {order.notes && (
                        <p><strong>Notes:</strong> {order.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Section Edit Modal */}
        {editingSection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingSection.id ? 'Edit Section' : 'Add Section'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Section Type</label>
                  <Select
                    value={editingSection.section_type}
                    onValueChange={(value) => setEditingSection({ ...editingSection, section_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="cta">Call to Action</SelectItem>
                      <SelectItem value="bullet_points">Bullet Points</SelectItem>
                      <SelectItem value="text_content">Text Content</SelectItem>
                      <SelectItem value="image_with_text">Image with Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order Index</label>
                  <Input
                    type="number"
                    value={editingSection.order_index}
                    onChange={(e) => setEditingSection({ ...editingSection, order_index: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={editingSection.title || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <Textarea
                    value={editingSection.content || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                    rows={4}
                  />
                </div>

                {(editingSection.section_type === 'video' || editingSection.section_type === 'image_with_text') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {editingSection.section_type === 'video' ? 'Video URL' : 'Image URL'}
                      </label>
                      <Input
                        value={editingSection.section_type === 'video' ? editingSection.video_url || '' : editingSection.image_url || ''}
                        onChange={(e) => setEditingSection({ 
                          ...editingSection, 
                          [editingSection.section_type === 'video' ? 'video_url' : 'image_url']: e.target.value 
                        })}
                      />
                    </div>
                  </>
                )}

                {editingSection.section_type === 'cta' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA Text</label>
                      <Input
                        value={editingSection.cta_text || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, cta_text: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">CTA URL</label>
                      <Input
                        value={editingSection.cta_url || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, cta_url: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {editingSection.section_type === 'bullet_points' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Bullet Points</label>
                    <div className="space-y-2">
                      {editingSection.bullet_points?.map((point, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input value={point} readOnly />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeBulletPoint(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          value={newBulletPoint}
                          onChange={(e) => setNewBulletPoint(e.target.value)}
                          placeholder="Add new bullet point"
                          onKeyPress={(e) => e.key === 'Enter' && addBulletPoint()}
                        />
                        <Button onClick={addBulletPoint}>Add</Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingSection(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveSection}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Review Video Edit Modal */}
        {editingVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>
                  {editingVideo.id ? 'Edit Review Video' : 'Add Review Video'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    value={editingVideo.title}
                    onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Video URL</label>
                  <Input
                    value={editingVideo.video_url}
                    onChange={(e) => setEditingVideo({ ...editingVideo, video_url: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Customer Name</label>
                  <Input
                    value={editingVideo.customer_name || ''}
                    onChange={(e) => setEditingVideo({ ...editingVideo, customer_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order Index</label>
                  <Input
                    type="number"
                    value={editingVideo.order_index}
                    onChange={(e) => setEditingVideo({ ...editingVideo, order_index: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingVideo(null)}>
                    Cancel
                  </Button>
                  <Button onClick={saveReviewVideo}>
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};