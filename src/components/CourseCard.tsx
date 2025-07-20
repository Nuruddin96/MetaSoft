
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Play } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  price: number;
  discounted_price?: number;
  rating: number;
  enrollment_count: number;
  duration_hours?: number;
  thumbnail_url?: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  short_description?: string;
}

export const CourseCard = ({ 
  id, 
  title, 
  instructor, 
  price, 
  discounted_price, 
  rating, 
  enrollment_count, 
  duration_hours, 
  thumbnail_url, 
  category, 
  level,
  short_description
}: CourseCardProps) => {
  const discount = discounted_price ? Math.round(((price - discounted_price) / price) * 100) : 0;
  const duration = duration_hours ? `${duration_hours}h` : "N/A";

  // Format level for display
  const formatLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  return (
    <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <div className="relative">
        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
          {thumbnail_url ? (
            <img 
              src={thumbnail_url} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-5 w-5 text-primary ml-0.5" />
            </div>
          </div>
        </div>
        
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground">
            {discount}% OFF
          </Badge>
        )}
        
        <Badge variant="secondary" className="absolute top-3 right-3">
          {formatLevel(level)}
        </Badge>
      </div>

      <CardHeader className="pb-3">
        <Badge variant="outline" className="w-fit text-xs">
          {category}
        </Badge>
        <h3 className="font-semibold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
          <Link to={`/course/${id}`}>
            {title}
          </Link>
        </h3>
        <p className="text-muted-foreground text-sm">by {instructor}</p>
      </CardHeader>

      <CardContent className="py-3">
        {short_description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {short_description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{enrollment_count.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center mr-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 font-medium">{rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground text-sm">
            ({enrollment_count.toLocaleString()} students)
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {discounted_price ? (
              <>
                <span className="text-2xl font-bold text-primary">
                  ৳{discounted_price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ৳{price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">
                ৳{price.toLocaleString()}
              </span>
            )}
          </div>
          
          <Button size="sm" className="bg-gradient-primary hover:opacity-90" asChild>
            <Link to={`/checkout/${id}`}>
              Enroll Now
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
