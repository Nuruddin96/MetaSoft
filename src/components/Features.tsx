import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Video, 
  FileText, 
  Users, 
  Award, 
  Clock, 
  Shield,
  Smartphone,
  BookOpen,
  MessageCircle
} from "lucide-react";

const features = [
  {
    icon: Video,
    title: "High-Quality Video Lessons",
    description: "Learn from crystal clear HD video content with Bengali subtitles and downloadable resources."
  },
  {
    icon: FileText,
    title: "PDF Books & Resources",
    description: "Access comprehensive PDF guides, workbooks, and resources to complement your learning."
  },
  {
    icon: Users,
    title: "Expert Instructors",
    description: "Learn from successful Bangladeshi entrepreneurs who've built million-taka businesses."
  },
  {
    icon: Award,
    title: "Certificates",
    description: "Earn verified certificates upon course completion to showcase your expertise."
  },
  {
    icon: Clock,
    title: "Lifetime Access",
    description: "Once purchased, access your courses anytime, anywhere with no time restrictions."
  },
  {
    icon: Shield,
    title: "Money-Back Guarantee",
    description: "30-day money-back guarantee if you're not satisfied with the course quality."
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Learn on-the-go with our mobile-optimized platform designed for smartphone users."
  },
  {
    icon: BookOpen,
    title: "Structured Learning",
    description: "Follow step-by-step modules designed to take you from beginner to expert level."
  },
  {
    icon: MessageCircle,
    title: "Community Support",
    description: "Join our private Facebook group and get support from instructors and fellow students."
  }
];

export const Features = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose MetaSoft BD?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to master e-commerce and build a successful online business in Bangladesh
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="border-border/50 hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card"
            >
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};