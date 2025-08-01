import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Save, Users, BookOpen, Award, Star, Target, Heart } from "lucide-react";

interface AboutPageSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  stats: any;
  team_members: any;
  values: any;
  is_active: boolean;
}

const iconMap = {
  Users, BookOpen, Award, Star, Target, Heart
};

export default function AboutPageManagement() {
  const [sections, setSections] = useState<AboutPageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('about_page_content')
        .select('*')
        .order('section_key', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to load about page content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSection = (sectionKey: string, field: string, value: any) => {
    setSections(prev => prev.map(section => 
      section.section_key === sectionKey 
        ? { ...section, [field]: value }
        : section
    ));
  };

  const updateArrayItem = (sectionKey: string, arrayName: string, index: number, field: string, value: any) => {
    setSections(prev => prev.map(section => {
      if (section.section_key === sectionKey) {
        const array = [...(section[arrayName as keyof AboutPageSection] as any[] || [])];
        array[index] = { ...array[index], [field]: value };
        return { ...section, [arrayName]: array };
      }
      return section;
    }));
  };

  const addArrayItem = (sectionKey: string, arrayName: string, defaultItem: any) => {
    setSections(prev => prev.map(section => {
      if (section.section_key === sectionKey) {
        const array = [...(section[arrayName as keyof AboutPageSection] as any[] || [])];
        array.push(defaultItem);
        return { ...section, [arrayName]: array };
      }
      return section;
    }));
  };

  const removeArrayItem = (sectionKey: string, arrayName: string, index: number) => {
    setSections(prev => prev.map(section => {
      if (section.section_key === sectionKey) {
        const array = [...(section[arrayName as keyof AboutPageSection] as any[] || [])];
        array.splice(index, 1);
        return { ...section, [arrayName]: array };
      }
      return section;
    }));
  };

  const saveAllSections = async () => {
    setSaving(true);
    try {
      for (const section of sections) {
        const { error } = await supabase
          .from('about_page_content')
          .update({
            title: section.title,
            subtitle: section.subtitle,
            content: section.content,
            stats: section.stats,
            team_members: section.team_members,
            values: section.values,
            is_active: section.is_active
          })
          .eq('section_key', section.section_key);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "About page content updated successfully",
      });
    } catch (error) {
      console.error('Error saving sections:', error);
      toast({
        title: "Error",
        description: "Failed to save about page content",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  const heroSection = sections.find(s => s.section_key === 'hero');
  const missionSection = sections.find(s => s.section_key === 'mission');
  const statsSection = sections.find(s => s.section_key === 'stats');
  const valuesSection = sections.find(s => s.section_key === 'values');
  const teamSection = sections.find(s => s.section_key === 'team');
  const ctaSection = sections.find(s => s.section_key === 'cta');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">About Page Management</h1>
            <p className="text-muted-foreground">
              Manage the content displayed on the About page
            </p>
          </div>
          <Button onClick={saveAllSections} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>

        {/* Hero Section */}
        {heroSection && (
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Title</Label>
                <Input
                  id="hero-title"
                  value={heroSection.title || ''}
                  onChange={(e) => updateSection('hero', 'title', e.target.value)}
                  placeholder="About Our Platform"
                />
              </div>
              <div>
                <Label htmlFor="hero-content">Description</Label>
                <Textarea
                  id="hero-content"
                  value={heroSection.content || ''}
                  onChange={(e) => updateSection('hero', 'content', e.target.value)}
                  placeholder="Hero section description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mission Section */}
        {missionSection && (
          <Card>
            <CardHeader>
              <CardTitle>Mission Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mission-title">Title</Label>
                <Input
                  id="mission-title"
                  value={missionSection.title || ''}
                  onChange={(e) => updateSection('mission', 'title', e.target.value)}
                  placeholder="Our Mission"
                />
              </div>
              <div>
                <Label htmlFor="mission-content">Content</Label>
                <Textarea
                  id="mission-content"
                  value={missionSection.content || ''}
                  onChange={(e) => updateSection('mission', 'content', e.target.value)}
                  placeholder="Mission statement"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Section */}
        {statsSection && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(statsSection.stats || []).map((stat: any, index: number) => (
                <div key={index} className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={stat.label || ''}
                      onChange={(e) => updateArrayItem('stats', 'stats', index, 'label', e.target.value)}
                      placeholder="Students"
                    />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input
                      value={stat.value || ''}
                      onChange={(e) => updateArrayItem('stats', 'stats', index, 'value', e.target.value)}
                      placeholder="10,000+"
                    />
                  </div>
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={stat.icon || ''}
                      onChange={(e) => updateArrayItem('stats', 'stats', index, 'icon', e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select Icon</option>
                      {Object.keys(iconMap).map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('stats', 'stats', index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('stats', 'stats', { label: '', value: '', icon: 'Users' })}
              >
                Add Statistic
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Values Section */}
        {valuesSection && (
          <Card>
            <CardHeader>
              <CardTitle>Values Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(valuesSection.values || []).map((value: any, index: number) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={value.title || ''}
                        onChange={(e) => updateArrayItem('values', 'values', index, 'title', e.target.value)}
                        placeholder="Excellence"
                      />
                    </div>
                    <div>
                      <Label>Icon</Label>
                      <select
                        value={value.icon || ''}
                        onChange={(e) => updateArrayItem('values', 'values', index, 'icon', e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select Icon</option>
                        {Object.keys(iconMap).map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={value.description || ''}
                      onChange={(e) => updateArrayItem('values', 'values', index, 'description', e.target.value)}
                      placeholder="Value description"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('values', 'values', index)}
                  >
                    Remove Value
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('values', 'values', { title: '', description: '', icon: 'Target' })}
              >
                Add Value
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Team Section */}
        {teamSection && (
          <Card>
            <CardHeader>
              <CardTitle>Team Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="team-title">Title</Label>
                  <Input
                    id="team-title"
                    value={teamSection.title || ''}
                    onChange={(e) => updateSection('team', 'title', e.target.value)}
                    placeholder="Meet Our Team"
                  />
                </div>
                <div>
                  <Label htmlFor="team-subtitle">Subtitle</Label>
                  <Input
                    id="team-subtitle"
                    value={teamSection.subtitle || ''}
                    onChange={(e) => updateSection('team', 'subtitle', e.target.value)}
                    placeholder="Team subtitle"
                  />
                </div>
              </div>

              {(teamSection.team_members || []).map((member: any, index: number) => (
                <div key={index} className="space-y-3 p-4 border rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={member.name || ''}
                        onChange={(e) => updateArrayItem('team', 'team_members', index, 'name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={member.role || ''}
                        onChange={(e) => updateArrayItem('team', 'team_members', index, 'role', e.target.value)}
                        placeholder="Founder & CEO"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={member.description || ''}
                      onChange={(e) => updateArrayItem('team', 'team_members', index, 'description', e.target.value)}
                      placeholder="Team member description"
                      rows={2}
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeArrayItem('team', 'team_members', index)}
                  >
                    Remove Member
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => addArrayItem('team', 'team_members', { name: '', role: '', description: '' })}
              >
                Add Team Member
              </Button>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        {ctaSection && (
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cta-title">Title</Label>
                <Input
                  id="cta-title"
                  value={ctaSection.title || ''}
                  onChange={(e) => updateSection('cta', 'title', e.target.value)}
                  placeholder="Ready to Start Learning?"
                />
              </div>
              <div>
                <Label htmlFor="cta-subtitle">Subtitle</Label>
                <Textarea
                  id="cta-subtitle"
                  value={ctaSection.subtitle || ''}
                  onChange={(e) => updateSection('cta', 'subtitle', e.target.value)}
                  placeholder="CTA description"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button onClick={saveAllSections} disabled={saving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}