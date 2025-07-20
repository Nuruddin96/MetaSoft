import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Video, File, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourseMaterial {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'document' | 'quiz' | 'assignment';
  file_url?: string;
  file_size?: number;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
}

interface CourseMaterialsManagerProps {
  courseId: string;
  courseName: string;
}

export const CourseMaterialsManager = ({ courseId, courseName }: CourseMaterialsManagerProps) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<CourseMaterial | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'video' as CourseMaterial['type'],
    file_url: '',
    duration_minutes: 0,
    is_free: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchMaterials();
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (error) throw error;
      setMaterials((data || []) as CourseMaterial[]);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch course materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'video',
      file_url: '',
      duration_minutes: 0,
      is_free: false,
    });
    setEditingMaterial(null);
  };

  const handleOpenForm = (material?: CourseMaterial) => {
    if (material) {
      setFormData({
        title: material.title,
        description: material.description || '',
        type: material.type,
        file_url: material.file_url || '',
        duration_minutes: material.duration_minutes || 0,
        is_free: material.is_free,
      });
      setEditingMaterial(material);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const nextOrderIndex = editingMaterial 
        ? editingMaterial.order_index 
        : Math.max(...materials.map(m => m.order_index), 0) + 1;

      const materialData = {
        course_id: courseId,
        title: formData.title,
        description: formData.description || null,
        type: formData.type,
        file_url: formData.file_url || null,
        duration_minutes: formData.duration_minutes || null,
        order_index: nextOrderIndex,
        is_free: formData.is_free,
      };

      if (editingMaterial) {
        const { error } = await supabase
          .from('course_materials')
          .update(materialData)
          .eq('id', editingMaterial.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Material updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('course_materials')
          .insert(materialData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Material added successfully",
        });
      }

      setIsFormOpen(false);
      resetForm();
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      toast({
        title: "Error",
        description: "Failed to save material",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    try {
      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
      
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'document':
        return <File className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Materials</h2>
          <p className="text-muted-foreground">{courseName}</p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Material title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Material description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file_url">File URL</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
                  placeholder="https://example.com/file.mp4"
                />
              </div>

              {formData.type === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="0"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Label>Free Preview</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow non-enrolled students to access this material
                  </p>
                </div>
                <Switch
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMaterial ? 'Update' : 'Add'} Material
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by adding videos, documents, or other learning materials to your course.
            </p>
            <Button onClick={() => handleOpenForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {materials.map((material, index) => (
            <Card key={material.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      {getTypeIcon(material.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{material.title}</h4>
                        {material.is_free && (
                          <Badge variant="secondary" className="text-xs">
                            Free
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>#{index + 1}</span>
                        <span className="capitalize">{material.type}</span>
                        {material.duration_minutes && (
                          <span>{material.duration_minutes} min</span>
                        )}
                        {material.file_size && (
                          <span>{formatFileSize(material.file_size)}</span>
                        )}
                      </div>
                      
                      {material.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {material.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {material.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(material.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenForm(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
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
  );
};