import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X, ExternalLink } from "lucide-react";

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  video_id: string;
  thumbnail_url: string;
  order_index: number;
  is_active: boolean;
}

export default function VideoManagement() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingVideo, setEditingVideo] = useState<YouTubeVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_id: '',
    thumbnail_url: '',
    order_index: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url;
  };

  const getThumbnailUrl = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const videoId = extractVideoId(formData.video_id);
      const thumbnailUrl = formData.thumbnail_url || getThumbnailUrl(videoId);
      
      const submitData = {
        ...formData,
        video_id: videoId,
        thumbnail_url: thumbnailUrl
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('youtube_videos')
          .update(submitData)
          .eq('id', editingVideo.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Video updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('youtube_videos')
          .insert([submitData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Video created successfully",
        });
      }

      resetForm();
      fetchVideos();
    } catch (error) {
      console.error('Error saving video:', error);
      toast({
        title: "Error",
        description: "Failed to save video",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (video: YouTubeVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      video_id: video.video_id,
      thumbnail_url: video.thumbnail_url,
      order_index: video.order_index,
      is_active: video.is_active
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    try {
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
      fetchVideos();
    } catch (error) {
      console.error('Error toggling video status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_id: '',
      thumbnail_url: '',
      order_index: videos.length + 1,
      is_active: true
    });
    setEditingVideo(null);
    setIsCreating(false);
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
          <h1 className="text-3xl font-bold">Video Management</h1>
          <p className="text-muted-foreground">
            Manage YouTube videos for the homepage video section
          </p>
        </div>

        {/* Add New Video Button */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">YouTube Videos</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Video
          </Button>
        </div>

        {/* Video Form */}
        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>{editingVideo ? 'Edit Video' : 'Add New Video'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Video Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Enter video title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description of the video"
                  />
                </div>
                <div>
                  <Label htmlFor="video_id">YouTube Video URL or ID</Label>
                  <Input
                    id="video_id"
                    value={formData.video_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, video_id: e.target.value }))}
                    required
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID or just VIDEO_ID"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can paste the full YouTube URL or just the video ID
                  </p>
                </div>
                <div>
                  <Label htmlFor="thumbnail_url">Custom Thumbnail URL (Optional)</Label>
                  <Input
                    id="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    placeholder="Leave empty to use YouTube's default thumbnail"
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
                    {editingVideo ? 'Update Video' : 'Create Video'}
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

        {/* Videos List */}
        <div className="grid gap-4">
          {videos.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No videos created yet.</p>
                <Button onClick={() => setIsCreating(true)} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Video
                </Button>
              </CardContent>
            </Card>
          ) : (
            videos.map((video) => (
              <Card key={video.id} className={!video.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-32 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getThumbnailUrl(video.video_id);
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{video.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Order: {video.order_index}</span>
                        <span>Status: {video.is_active ? 'Active' : 'Inactive'}</span>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View on YouTube</span>
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={video.is_active}
                        onCheckedChange={() => toggleActive(video.id, video.is_active)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(video)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(video.id)}
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