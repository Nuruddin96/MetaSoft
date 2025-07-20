import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { FileUpload } from './FileUpload';
import { CourseMaterialsManager } from './CourseMaterialsManager';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  short_description: z.string().min(1, 'Short description is required'),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  discounted_price: z.number().optional(),
  duration_hours: z.number().min(1, 'Duration must be at least 1 hour'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  thumbnail_url: z.string().optional(),
  video_preview_url: z.string().optional(),
  requirements: z.array(z.string()),
  what_you_learn: z.array(z.string()),
  tags: z.array(z.string()),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  description: string;
  short_description: string;
  category_id?: string;
  price: number;
  discounted_price?: number;
  duration_hours?: number;
  level: string;
  is_published: boolean;
  is_featured: boolean;
  thumbnail_url?: string;
  video_preview_url?: string;
  requirements?: string[];
  what_you_learn?: string[];
  tags?: string[];
}

interface CourseCategory {
  id: string;
  name: string;
}

interface CourseFormProps {
  course?: Course | null;
  categories: CourseCategory[];
  onSubmit: () => void;
  onCancel: () => void;
}

export const CourseForm = ({ course, categories, onSubmit, onCancel }: CourseFormProps) => {
  const [loading, setLoading] = useState(false);
  const [newRequirement, setNewRequirement] = useState('');
  const [newLearning, setNewLearning] = useState('');
  const [newTag, setNewTag] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      category_id: '',
      price: 0,
      discounted_price: 0,
      duration_hours: 1,
      level: 'beginner',
      is_published: false,
      is_featured: false,
      thumbnail_url: '',
      video_preview_url: '',
      requirements: [],
      what_you_learn: [],
      tags: [],
    },
  });

  const watchedRequirements = watch('requirements');
  const watchedLearning = watch('what_you_learn');
  const watchedTags = watch('tags');

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        short_description: course.short_description,
        category_id: course.category_id || '',
        price: course.price,
        discounted_price: course.discounted_price || 0,
        duration_hours: course.duration_hours || 1,
        level: course.level as 'beginner' | 'intermediate' | 'advanced',
        is_published: course.is_published,
        is_featured: course.is_featured,
        thumbnail_url: course.thumbnail_url || '',
        video_preview_url: course.video_preview_url || '',
        requirements: course.requirements || [],
        what_you_learn: course.what_you_learn || [],
        tags: course.tags || [],
      });
    }
  }, [course, reset]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const onFormSubmit = async (data: CourseFormData) => {
    setLoading(true);
    
    try {
      const slug = generateSlug(data.title);
      
      const courseData = {
        title: data.title,
        description: data.description,
        short_description: data.short_description,
        category_id: data.category_id,
        price: data.price,
        discounted_price: data.discounted_price || null,
        duration_hours: data.duration_hours,
        level: data.level,
        is_published: data.is_published,
        is_featured: data.is_featured,
        thumbnail_url: data.thumbnail_url || null,
        video_preview_url: data.video_preview_url || null,
        requirements: data.requirements,
        what_you_learn: data.what_you_learn,
        tags: data.tags,
        slug,
        instructor_id: profile?.id,
      };

      if (course) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', course.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Course updated successfully",
        });
      } else {
        // Create new course
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert(courseData)
          .select('id')
          .single();

        if (error) throw error;

        setCreatedCourseId(newCourse.id);
        
        toast({
          title: "Success",
          description: "Course created successfully. Now add course materials!",
        });
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Error",
        description: "Failed to save course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToArray = (field: 'requirements' | 'what_you_learn' | 'tags', value: string) => {
    if (!value.trim()) return;
    
    const currentArray = watch(field);
    if (!currentArray.includes(value.trim())) {
      setValue(field, [...currentArray, value.trim()]);
    }
    
    // Clear the input
    if (field === 'requirements') setNewRequirement('');
    if (field === 'what_you_learn') setNewLearning('');
    if (field === 'tags') setNewTag('');
  };

  const removeFromArray = (field: 'requirements' | 'what_you_learn' | 'tags', index: number) => {
    const currentArray = watch(field);
    setValue(field, currentArray.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="Enter course title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description</Label>
                <Textarea
                  id="short_description"
                  {...register('short_description')}
                  placeholder="Brief description for course cards"
                  rows={2}
                />
                {errors.short_description && (
                  <p className="text-sm text-destructive">{errors.short_description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Detailed course description"
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select onValueChange={(value) => setValue('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-destructive">{errors.category_id.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Select onValueChange={(value) => setValue('level', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.level && (
                    <p className="text-sm text-destructive">{errors.level.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  min="1"
                  {...register('duration_hours', { valueAsNumber: true })}
                />
                {errors.duration_hours && (
                  <p className="text-sm text-destructive">{errors.duration_hours.message}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Requirements */}
              <div className="space-y-3">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a requirement"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('requirements', newRequirement);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToArray('requirements', newRequirement)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedRequirements.map((req, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {req}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('requirements', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* What you'll learn */}
              <div className="space-y-3">
                <Label>What You'll Learn</Label>
                <div className="flex gap-2">
                  <Input
                    value={newLearning}
                    onChange={(e) => setNewLearning(e.target.value)}
                    placeholder="Add a learning outcome"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('what_you_learn', newLearning);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToArray('what_you_learn', newLearning)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedLearning.map((learning, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {learning}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('what_you_learn', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addToArray('tags', newTag);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addToArray('tags', newTag)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromArray('tags', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Materials</CardTitle>
            </CardHeader>
            <CardContent>
              {course || createdCourseId ? (
                <CourseMaterialsManager 
                  courseId={course?.id || createdCourseId!} 
                  courseName={watch('title') || 'New Course'}
                />
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <p className="text-muted-foreground">
                    Save the course first to add materials
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Fill in the basic information and create the course, then you can add videos, documents, and other materials.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (৳)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discounted_price">Discounted Price (৳)</Label>
                  <Input
                    id="discounted_price"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register('discounted_price', { valueAsNumber: true })}
                  />
                  {errors.discounted_price && (
                    <p className="text-sm text-destructive">{errors.discounted_price.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media & Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Course Thumbnail</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a high-quality image for your course thumbnail (recommended: 1280x720px)
                  </p>
                  
                  <FileUpload
                    onFileUploaded={(url) => setValue('thumbnail_url', url)}
                    acceptedTypes="image/*,.jpg,.jpeg,.png,.webp"
                    maxSize={10}
                    bucketName="course-thumbnails"
                    folder="thumbnails"
                  />
                </div>

                {watch('thumbnail_url') && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm font-medium mb-2">Current Thumbnail:</p>
                    <img 
                      src={watch('thumbnail_url')} 
                      alt="Course thumbnail" 
                      className="w-32 h-18 object-cover rounded border"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url_manual">Or Enter Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url_manual"
                    {...register('thumbnail_url')}
                    placeholder="https://example.com/thumbnail.jpg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Preview Video</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a short preview video to showcase your course content
                  </p>
                  
                  <FileUpload
                    onFileUploaded={(url) => setValue('video_preview_url', url)}
                    acceptedTypes="video/*,.mp4,.mov,.avi"
                    maxSize={50}
                    bucketName="course-materials"
                    folder="previews"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video_preview_url_manual">Or Enter Video URL</Label>
                  <Input
                    id="video_preview_url_manual"
                    {...register('video_preview_url')}
                    placeholder="https://example.com/preview.mp4"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Published</Label>
                  <p className="text-sm text-muted-foreground">
                    Make this course visible to students
                  </p>
                </div>
                <Switch
                  checked={watch('is_published')}
                  onCheckedChange={(checked) => setValue('is_published', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label>Featured</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this course in featured sections
                  </p>
                </div>
                <Switch
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : course ? 'Update Course' : 'Create Course'}
        </Button>
      </div>
    </form>
  );
};