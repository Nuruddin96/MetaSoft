import { Link } from "react-router-dom";
import { BookOpen, Facebook, Instagram, Youtube, Mail, Phone, Linkedin, Twitter } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const Footer = () => {
  const { settings } = useSiteSettings();
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
              <span className="text-xl font-bold">{settings.site_name || "MetaSoft BD"}</span>
            </Link>
            <p className="text-background/80 text-sm leading-relaxed">
              {settings.footer_description || "Bangladesh's premier e-learning platform for e-commerce entrepreneurs. Learn, grow, and succeed with our expert-led courses."}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="text-background/80 hover:text-background transition-colors">All Courses</Link></li>
              <li><Link to="/dashboard" className="text-background/80 hover:text-background transition-colors">Dashboard</Link></li>
              <li><Link to="/auth" className="text-background/80 hover:text-background transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              {settings.social_facebook && settings.social_facebook !== '""' && (
                <a
                  href={typeof settings.social_facebook === 'string' ? settings.social_facebook : settings.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.social_instagram && settings.social_instagram !== '""' && (
                <a
                  href={typeof settings.social_instagram === 'string' ? settings.social_instagram : settings.social_instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.social_youtube && settings.social_youtube !== '""' && (
                <a
                  href={typeof settings.social_youtube === 'string' ? settings.social_youtube : settings.social_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {settings.social_linkedin && settings.social_linkedin !== '""' && (
                <a
                  href={typeof settings.social_linkedin === 'string' ? settings.social_linkedin : settings.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {settings.social_twitter && settings.social_twitter !== '""' && (
                <a
                  href={typeof settings.social_twitter === 'string' ? settings.social_twitter : settings.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-background transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Get in Touch</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-background/80">{settings.footer_contact_phone || "+880 1XXX-XXXXXX"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-background/80">{settings.footer_contact_email || "info@metasoftbd.com"}</span>
              </div>
              {settings.footer_address && (
                <div className="text-background/80 text-sm mt-2">
                  {settings.footer_address}
                </div>
              )}
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