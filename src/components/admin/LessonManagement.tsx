import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  FolderOpen, 
  Folder,
  FileText,
  Video,
  Save,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CourseMaterial {
  id: string;
  title: string;
  type: string;
  duration_minutes?: number;
  order_index: number;
  is_free: boolean;
  file_url?: string;
  description?: string;
  lesson_id?: string;
  video_id?: string;
  video_platform?: string;
  content_type?: string;
  thumbnail_url?: string;
  transcript?: string;
  is_preview?: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  parent_lesson_id?: string;
  is_published: boolean;
  course_id: string;
  materials: CourseMaterial[];
  sub_lessons: Lesson[];
}

interface LessonManagementProps {
  courseId: string;
}

export const LessonManagement = ({ courseId }: LessonManagementProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [newLesson, setNewLesson] = useState({ 
    title: '', 
    description: '', 
    parent_lesson_id: null as string | null 
  });
  const [showNewLesson, setShowNewLesson] = useState(false);

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const fetchLessons = async () => {
    try {
      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      // Fetch materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index');

      if (materialsError) throw materialsError;

      // Organize lessons with sub-lessons and materials
      const lessonMap = new Map<string, Lesson>();
      
      // Create lesson objects
      lessonsData?.forEach(lesson => {
        lessonMap.set(lesson.id, {
          ...lesson,
          materials: [],
          sub_lessons: []
        });
      });

      // Add materials to lessons
      materialsData?.forEach(material => {
        if (material.lesson_id) {
          const lesson = lessonMap.get(material.lesson_id);
          if (lesson) {
            lesson.materials.push(material);
          }
        }
      });

      // Organize hierarchy
      const rootLessons: Lesson[] = [];
      lessonMap.forEach(lesson => {
        if (lesson.parent_lesson_id) {
          const parent = lessonMap.get(lesson.parent_lesson_id);
          if (parent) {
            parent.sub_lessons.push(lesson);
          }
        } else {
          rootLessons.push(lesson);
        }
      });

      setLessons(rootLessons);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
    }
  };

  const toggleExpanded = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handleCreateLesson = async () => {
    if (!newLesson.title.trim()) return;

    try {
      // Get the next order index
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('course_id', courseId)
        .eq('parent_lesson_id', newLesson.parent_lesson_id);

      const maxOrder = Math.max(...(existingLessons?.map(l => l.order_index) || [0]));

      const { error } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          title: newLesson.title,
          description: newLesson.description || null,
          order_index: maxOrder + 1,
          parent_lesson_id: newLesson.parent_lesson_id,
          is_published: true
        });

      if (error) throw error;

      toast.success('Lesson created successfully');

      setNewLesson({ title: '', description: '', parent_lesson_id: null });
      setShowNewLesson(false);
      fetchLessons();
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', lessonId);

      if (error) throw error;

      toast.success('Lesson deleted successfully');

      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Failed to delete lesson');
    }
  };

  const renderLesson = (lesson: Lesson, depth = 0) => {
    const isExpanded = expandedLessons.has(lesson.id);
    const isEditing = editingLesson === lesson.id;

    return (
      <div key={lesson.id} className="space-y-2">
        <Card className={`${depth > 0 ? 'ml-6 border-l-2 border-primary/20' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(lesson.id)}
                  className="p-0 h-6 w-6"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}

                <div className="flex-1">
                  <h4 className="font-medium">{lesson.title}</h4>
                  {lesson.description && (
                    <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {lesson.sub_lessons.length} sub-lessons
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {lesson.materials.length} materials
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewLesson(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingLesson(lesson.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteLesson(lesson.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 space-y-3">
                {/* Materials */}
                {lesson.materials.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Materials</h5>
                    <div className="space-y-1">
                      {lesson.materials.map(material => (
                        <div key={material.id} className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                          {material.type === 'video' ? (
                            <Video className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                          <span className="text-sm">{material.title}</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {material.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-lessons */}
                {lesson.sub_lessons.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-2">Sub-lessons</h5>
                    <div className="space-y-2">
                      {lesson.sub_lessons.map(subLesson => renderLesson(subLesson, depth + 1))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Course Lessons</h3>
        <Button onClick={() => setShowNewLesson(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </div>

      {/* New Lesson Form */}
      {showNewLesson && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Lesson</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Title</Label>
              <Input
                id="lesson-title"
                value={newLesson.title}
                onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                placeholder="Enter lesson title"
              />
            </div>
            <div>
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={newLesson.description}
                onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                placeholder="Enter lesson description"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreateLesson}>
                <Save className="h-4 w-4 mr-2" />
                Create Lesson
              </Button>
              <Button variant="outline" onClick={() => setShowNewLesson(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons List */}
      <div className="space-y-3">
        {lessons.length > 0 ? (
          lessons.map(lesson => renderLesson(lesson))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your course by creating lessons and organizing your content.
              </p>
              <Button onClick={() => setShowNewLesson(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Lesson
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}