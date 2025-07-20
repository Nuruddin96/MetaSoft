import { Link } from "react-router-dom";
import { BookOpen, Facebook, Instagram, Youtube, Mail, Phone } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">MetaSoft BD</span>
            </Link>
            <p className="text-background/80 text-sm leading-relaxed">
              Bangladesh's premier e-learning platform for e-commerce entrepreneurs. Learn, grow, and succeed with our expert-led courses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-background/80 hover:text-background transition-colors">All Courses</Link></li>
              <li><Link to="/categories" className="text-background/80 hover:text-background transition-colors">Categories</Link></li>
              <li><Link to="/instructors" className="text-background/80 hover:text-background transition-colors">Instructors</Link></li>
              <li><Link to="/about" className="text-background/80 hover:text-background transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-background/80 hover:text-background transition-colors">Help Center</Link></li>
              <li><Link to="/contact" className="text-background/80 hover:text-background transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy" className="text-background/80 hover:text-background transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-background/80 hover:text-background transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-background/80">+880 1XXX-XXXXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-background/80">info@metasoftbd.com</span>
              </div>
              <div className="flex space-x-4 mt-4">
                <Facebook className="h-5 w-5 text-background/80 hover:text-background transition-colors cursor-pointer" />
                <Instagram className="h-5 w-5 text-background/80 hover:text-background transition-colors cursor-pointer" />
                <Youtube className="h-5 w-5 text-background/80 hover:text-background transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © 2024 MetaSoft BD. All rights reserved. Built for Bangladeshi entrepreneurs.
          </p>
        </div>
      </div>
    </footer>
  );
};