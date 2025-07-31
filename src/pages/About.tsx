import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Target, Heart, Star } from "lucide-react";

export default function About() {
  const stats = [
    { icon: Users, label: "Students", value: "10,000+" },
    { icon: BookOpen, label: "Courses", value: "200+" },
    { icon: Award, label: "Certificates", value: "5,000+" },
    { icon: Star, label: "Rating", value: "4.9/5" }
  ];

  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for excellence in every course, ensuring high-quality content and engaging learning experiences."
    },
    {
      icon: Heart,
      title: "Accessibility",
      description: "Education should be accessible to everyone. We provide affordable courses with lifetime access."
    },
    {
      icon: Users,
      title: "Community",
      description: "Learn together with our vibrant community of students and expert instructors from around the world."
    }
  ];

  const team = [
    {
      name: "John Doe",
      role: "Founder & CEO",
      description: "Passionate educator with 15+ years of experience in online learning platforms."
    },
    {
      name: "Jane Smith",
      role: "Head of Curriculum",
      description: "Expert in educational technology and curriculum development with a focus on practical skills."
    },
    {
      name: "Mike Johnson",
      role: "Lead Instructor",
      description: "Industry veteran with extensive experience in teaching and mentoring students worldwide."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-hero py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Our Platform
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            We're on a mission to make quality education accessible to everyone, 
            anywhere in the world. Join millions of learners who are transforming 
            their careers and lives through our comprehensive courses.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We believe that education is the key to unlocking human potential. Our platform 
              provides world-class courses designed by industry experts, making it easy for 
              anyone to learn new skills, advance their careers, and achieve their goals.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="border-none shadow-md">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our team of passionate educators and industry experts are committed 
              to delivering the best learning experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center border-none shadow-md">
                <CardContent className="p-6">
                  <div className="w-20 h-20 bg-gradient-hero rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="secondary" className="mb-3">
                    {member.role}
                  </Badge>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already transforming their careers 
            with our comprehensive courses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Browse Courses
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}