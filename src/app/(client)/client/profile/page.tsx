'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Palette, Globe, Mail, Hash, Linkedin, Instagram } from 'lucide-react';

export default function ClientProfilePage() {
  // Mock data - in a real app this would come from the backend
  const companyData = {
    name: 'Acme Corp',
    email: 'marketing@acme.com',
    website: 'https://acme.com',
    primaryColor: '#ff0000',
    brandVoice: 'Professional, innovative, and customer-centric.',
    instagram: '@acmecorp',
    linkedin: 'linkedin.com/company/acme'
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Company Profile</h1>
        <p className="text-muted-foreground mt-2">Your company information and branding preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Company Information */}
        <Card className="feature-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              <CardTitle>Company Details</CardTitle>
            </div>
            <CardDescription>General information about your business.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Company Name</h3>
                <p className="text-lg font-semibold text-foreground">{companyData.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                <div className="flex items-center gap-2 text-foreground">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary transition-colors">
                    {companyData.website}
                  </a>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Contact Email</h3>
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${companyData.email}`} className="hover:underline hover:text-primary transition-colors">
                    {companyData.email}
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding & Style */}
        <Card className="feature-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Branding & Style</CardTitle>
            </div>
            <CardDescription>Your brand identity settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Primary Brand Color</h3>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full border border-border shadow-sm ring-2 ring-offset-2 ring-offset-background ring-border/50" 
                    style={{ backgroundColor: companyData.primaryColor }}
                  />
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-medium">{companyData.primaryColor}</span>
                    <span className="text-xs text-muted-foreground">Hex Code</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Brand Voice / Tone</h3>
                <div className="bg-secondary/30 p-4 rounded-md border border-border/50">
                  <p className="text-foreground italic">"{companyData.brandVoice}"</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card className="feature-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-primary" />
              <CardTitle>Social Accounts</CardTitle>
            </div>
            <CardDescription>Connected social media profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-3 rounded-md bg-white/50 border border-border/50">
                <div className="p-2 bg-pink-100 text-pink-600 rounded-full">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">Instagram</h3>
                  <p className="font-medium">{companyData.instagram}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md bg-white/50 border border-border/50">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground">LinkedIn</h3>
                  <p className="font-medium">{companyData.linkedin}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
