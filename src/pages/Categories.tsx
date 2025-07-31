import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Users } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  course_count: number;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('course_categories')
        .select(`
          id,
          name,
          description,
          created_at,
          courses!inner(id)
        `);

      if (error) throw error;

      // Process data to count courses per category
      const processedCategories = data.map(category => ({
        id: category.id,
        name: category.name,
        description: category.description,
        created_at: category.created_at,
        course_count: category.courses?.length || 0
      }));

      setCategories(processedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted animate-pulse rounded mb-4 w-64 mx-auto"></div>
            <div className="h-4 bg-muted animate-pulse rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-16"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Course Categories</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our diverse range of course categories and find the perfect learning path for your goals.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Categories Available</h3>
            <p className="text-muted-foreground">
              Course categories will appear here once they are created.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="group-hover:text-primary transition-colors">
                      {category.name}
                    </span>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {category.course_count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-3">
                    {category.description || "Discover amazing courses in this category."}
                  </p>
                  <Link
                    to={`/courses?category=${encodeURIComponent(category.name)}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Courses
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}