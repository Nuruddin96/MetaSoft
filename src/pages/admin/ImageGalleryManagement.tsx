import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { FileUpload } from "@/components/admin/FileUpload";

interface GalleryImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  order_index: number;
  is_active: boolean;
}

export const ImageGalleryManagement = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [newImage, setNewImage] = useState({
    title: "",
    description: "",
    image_url: "",
    order_index: 1,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('image_gallery')
        .select('*')
        .order('order_index');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Error",
        description: "Failed to load images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string, updatedData: Partial<GalleryImage>) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('image_gallery')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setImages(images.map(img => 
        img.id === id ? { ...img, ...updatedData } : img
      ));
      setEditingId(null);
      toast({
        title: "Success",
        description: "Image updated successfully",
      });
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newImage.title || !newImage.image_url) {
      toast({
        title: "Error",
        description: "Title and image are required",
        variant: "destructive",
      });
      return;
    }

    setSaving('new');
    try {
      const { data, error } = await supabase
        .from('image_gallery')
        .insert([newImage])
        .select()
        .single();

      if (error) throw error;

      setImages([...images, data]);
      setNewImage({ title: "", description: "", image_url: "", order_index: 1 });
      setShowUpload(false);
      toast({
        title: "Success",
        description: "Image added successfully",
      });
    } catch (error) {
      console.error('Error creating image:', error);
      toast({
        title: "Error",
        description: "Failed to add image",
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('image_gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Image Gallery Management</h1>
        <Button onClick={() => setShowUpload(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>
      <div className="grid gap-6">
        {showUpload && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Image title"
                value={newImage.title}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              />
              <Textarea
                placeholder="Image description"
                value={newImage.description}
                onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Order index"
                value={newImage.order_index}
                onChange={(e) => setNewImage({ ...newImage, order_index: parseInt(e.target.value) || 1 })}
              />
              <Input
                placeholder="Image URL"
                value={newImage.image_url}
                onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
              />
              <FileUpload
                onFileUploaded={(url) => setNewImage({ ...newImage, image_url: url })}
                bucketName="course-thumbnails"
                folder="gallery"
                acceptedTypes="image/*"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreate}
                  disabled={saving === 'new'}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpload(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {images.map((image) => (
          <Card key={image.id}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <img 
                  src={image.image_url} 
                  alt={image.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-3">
                  {editingId === image.id ? (
                    <>
                      <Input
                        value={image.title}
                        onChange={(e) => setImages(images.map(img => 
                          img.id === image.id ? { ...img, title: e.target.value } : img
                        ))}
                      />
                      <Textarea
                        value={image.description || ""}
                        onChange={(e) => setImages(images.map(img => 
                          img.id === image.id ? { ...img, description: e.target.value } : img
                        ))}
                      />
                      <Input
                        type="number"
                        value={image.order_index}
                        onChange={(e) => setImages(images.map(img => 
                          img.id === image.id ? { ...img, order_index: parseInt(e.target.value) || 1 } : img
                        ))}
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold">{image.title}</h3>
                      {image.description && (
                        <p className="text-muted-foreground">{image.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Order: {image.order_index}</p>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingId === image.id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave(image.id, image)}
                        disabled={saving === image.id}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(image.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};