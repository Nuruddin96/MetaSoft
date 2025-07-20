import { CourseCard } from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mock data for featured courses
const featuredCourses = [
  {
    id: "1",
    title: "Complete E-commerce Business Mastery 2024",
    instructor: "Rashid Ahmed",
    price: 2500,
    originalPrice: 5000,
    rating: 4.9,
    studentsCount: 2340,
    duration: "8h 30m",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=225&fit=crop",
    category: "E-commerce",
    level: "Beginner" as const
  },
  {
    id: "2", 
    title: "Facebook & Instagram Marketing for Bangladesh",
    instructor: "Fatima Khan",
    price: 1800,
    originalPrice: 3500,
    rating: 4.8,
    studentsCount: 1856,
    duration: "6h 15m",
    thumbnail: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=400&h=225&fit=crop",
    category: "Digital Marketing",
    level: "Intermediate" as const
  },
  {
    id: "3",
    title: "Shopify Dropshipping Success Blueprint",
    instructor: "Karim Rahman",
    price: 3200,
    originalPrice: 6000,
    rating: 4.9,
    studentsCount: 987,
    duration: "12h 45m",
    thumbnail: "https://images.unsplash.com/photo-1556742111-a301076d9d18?w=400&h=225&fit=crop",
    category: "Dropshipping",
    level: "Advanced" as const
  },
  {
    id: "4",
    title: "Amazon FBA Business for Bangladeshi Entrepreneurs",
    instructor: "Nusrat Jahan",
    price: 4500,
    originalPrice: 8000,
    rating: 4.7,
    studentsCount: 1432,
    duration: "15h 20m",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=225&fit=crop",
    category: "Amazon FBA",
    level: "Advanced" as const
  },
  {
    id: "5",
    title: "Complete Digital Marketing Fundamentals",
    instructor: "Sabbir Hasan",
    price: 1500,
    originalPrice: 3000,
    rating: 4.6,
    studentsCount: 3241,
    duration: "10h 30m",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    category: "Digital Marketing",
    level: "Beginner" as const
  },
  {
    id: "6",
    title: "Local E-commerce Success in Bangladesh",
    instructor: "Mahmud Ali",
    price: 2200,
    originalPrice: 4200,
    rating: 4.8,
    studentsCount: 876,
    duration: "9h 15m",
    thumbnail: "https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?w=400&h=225&fit=crop",
    category: "Local Business",
    level: "Intermediate" as const
  }
];

export const FeaturedCourses = () => {
  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Courses
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master e-commerce with our most popular courses designed specifically for Bangladeshi entrepreneurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
        
        <div className="text-center">
          <Button size="lg" variant="outline" asChild>
            <Link to="/courses">
              View All Courses
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};