import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ArrowLeft, Play, CheckCircle, Lock, FileText, Video, Download, ChevronRight, ChevronDown, FolderOpen, Folder } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  parent_lesson_id?: string;
  is_published: boolean;
  materials: CourseMaterial[];
  sub_lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description?: string;
  profiles?: {
    full_name: string;
  };
}

export default function CourseLearning() {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [legacyMaterials, setLegacyMaterials] = useState<CourseMaterial[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<CourseMaterial | null>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id && user) {
      fetchCourseData();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    try {
      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!profile) return;

      // Check enrollment
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('course_id', id)
        .eq('student_id', profile.id)
        .eq('status', 'active')
        .single();

      if (!enrollmentData) {
        toast({
          title: "Access Denied",
          description: "You need to enroll in this course first",
          variant: "destructive",
        });
        return;
      }

      setEnrollment(enrollmentData);

      // Fetch course details
      const { data: courseData } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          profiles (full_name)
        `)
        .eq('id', id)
        .single();

      setCourse(courseData);

      // Fetch lessons
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      // Fetch course materials
      const { data: materialsData } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      // Organize lessons with materials
      const lessonMap = new Map<string, Lesson>();
      
      // Create lesson objects
      lessonsData?.forEach(lesson => {
        lessonMap.set(lesson.id, {
          ...lesson,
          materials: [],
          sub_lessons: []
        });
      });

      // Add materials to lessons or legacy materials
      const legacyMats: CourseMaterial[] = [];
      materialsData?.forEach(material => {
        if (material.lesson_id && lessonMap.has(material.lesson_id)) {
          const lesson = lessonMap.get(material.lesson_id);
          if (lesson) {
            lesson.materials.push(material);
          }
        } else {
          legacyMats.push(material);
        }
      });

      // Organize lesson hierarchy
      const rootLessons: Lesson[] = [];
      lessonMap.forEach(lesson => {
        if (lesson.parent_lesson_id && lessonMap.has(lesson.parent_lesson_id)) {
          const parent = lessonMap.get(lesson.parent_lesson_id);
          if (parent) {
            parent.sub_lessons.push(lesson);
          }
        } else {
          rootLessons.push(lesson);
        }
      });

      setLessons(rootLessons);
      setLegacyMaterials(legacyMats);
      
      // Set first material as current (from lessons or legacy)
      const allMaterials = [...rootLessons.flatMap(l => getAllMaterials(l)), ...legacyMats];
      if (allMaterials.length > 0) {
        setCurrentMaterial(allMaterials[0]);
      }

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "Failed to load course content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAllMaterials = (lesson: Lesson): CourseMaterial[] => {
    const materials = [...lesson.materials];
    lesson.sub_lessons.forEach(subLesson => {
      materials.push(...getAllMaterials(subLesson));
    });
    return materials;
  };

  const handleMaterialClick = (material: CourseMaterial) => {
    setCurrentMaterial(material);
  };

  const toggleLessonExpanded = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const renderLesson = (lesson: Lesson, depth = 0) => {
    const isExpanded = expandedLessons.has(lesson.id);
    
    return (
      <div key={lesson.id}>
        <Collapsible open={isExpanded} onOpenChange={() => toggleLessonExpanded(lesson.id)}>
          <CollapsibleTrigger asChild>
            <button className={`w-full text-left p-3 border-b hover:bg-accent transition-colors flex items-center ${depth > 0 ? 'ml-4' : ''}`}>
              <div className="flex items-center space-x-2 flex-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                {isExpanded ? (
                  <FolderOpen className="h-4 w-4 text-primary" />
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium text-sm">{lesson.title}</span>
                <Badge variant="outline" className="text-xs ml-auto">
                  {lesson.materials.length + lesson.sub_lessons.reduce((sum, sub) => sum + getAllMaterials(sub).length, 0)} items
                </Badge>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="space-y-1">
              {/* Render materials */}
              {lesson.materials.map((material, index) => (
                <button
                  key={material.id}
                  onClick={() => handleMaterialClick(material)}
                  className={`w-full text-left p-3 ml-6 border-b hover:bg-accent transition-colors ${
                    currentMaterial?.id === material.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {material.is_free ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                          {getTypeIcon(material.type)}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm leading-tight">
                        {material.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {material.type}
                        </Badge>
                        {material.duration_minutes && (
                          <span className="text-xs text-muted-foreground">
                            {material.duration_minutes}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {/* Render sub-lessons */}
              {lesson.sub_lessons.map(subLesson => renderLesson(subLesson, depth + 1))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getGoogleDriveEmbedUrl = (url: string) => {
    const regex = /\/file\/d\/([a-zA-Z0-9-_]+)/;
    const match = url.match(regex);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-card rounded w-32" />
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 h-96 bg-card rounded" />
              <div className="h-96 bg-card rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Course Not Available</h2>
            <p className="text-muted-foreground mb-6">
              You don't have access to this course or it doesn't exist.
            </p>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <p className="text-muted-foreground">by {course.profiles?.full_name}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm font-medium">{Math.round(enrollment.progress)}%</span>
            </div>
            <Progress value={enrollment.progress} className="h-2" />
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {currentMaterial ? (
                  <>
                    {currentMaterial.type === 'video' && currentMaterial.file_url ? (
                      <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
                        {currentMaterial.file_url.includes('youtube.com') || currentMaterial.file_url.includes('youtu.be') ? (
                          <iframe
                            className="w-full h-full"
                            src={getYouTubeEmbedUrl(currentMaterial.file_url)}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentMaterial.title}
                          />
                        ) : currentMaterial.file_url.includes('drive.google.com') ? (
                          <iframe
                            className="w-full h-full"
                            src={getGoogleDriveEmbedUrl(currentMaterial.file_url)}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={currentMaterial.title}
                          />
                        ) : (
                          <video 
                            controls 
                            className="w-full h-full"
                            src={currentMaterial.file_url}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center">
                        <div className="text-center text-primary-foreground">
                          {getTypeIcon(currentMaterial.type)}
                          <p className="mt-2">Content Preview</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold">{currentMaterial.title}</h2>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="capitalize">
                              {currentMaterial.type}
                            </Badge>
                            {currentMaterial.duration_minutes && (
                              <span>{currentMaterial.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                        
                        {currentMaterial.file_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={currentMaterial.file_url} download>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                      
                      {currentMaterial.description && (
                        <div>
                          <h3 className="font-semibold mb-2">Description</h3>
                          <p className="text-muted-foreground">{currentMaterial.description}</p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="p-12 text-center">
                    <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Content Selected</h3>
                    <p className="text-muted-foreground">
                      Select a lesson from the course modules to start learning
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Modules Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Course Modules
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {lessons.length > 0 || legacyMaterials.length > 0 ? (
                  <div className="space-y-1">
                    {/* Render structured lessons */}
                    {lessons.map(lesson => renderLesson(lesson))}
                    
                    {/* Render legacy materials */}
                    {legacyMaterials.length > 0 && (
                      <div>
                        <div className="p-3 bg-muted/30 border-b">
                          <span className="text-sm font-medium text-muted-foreground">Legacy Materials</span>
                        </div>
                        {legacyMaterials.map((material, index) => (
                          <button
                            key={material.id}
                            onClick={() => handleMaterialClick(material)}
                            className={`w-full text-left p-3 border-b hover:bg-accent transition-colors ${
                              currentMaterial?.id === material.id ? 'bg-accent' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {material.is_free ? (
                                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                    {getTypeIcon(material.type)}
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                    <Lock className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm leading-tight">
                                  {material.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs capitalize">
                                    {material.type}
                                  </Badge>
                                  {material.duration_minutes && (
                                    <span className="text-xs text-muted-foreground">
                                      {material.duration_minutes}m
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No course content available yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}