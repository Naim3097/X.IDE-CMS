'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useLogin } from '@/features/auth/hooks/useLogin';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useLogin();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            AXTRA
          </h1>
          <p className="text-muted-foreground">
            Content System Login
          </p>
        </div>

        <Card className="feature-card border-t-4 border-t-primary">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email" 
                    className="pl-10 bg-white/50"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 bg-white/50"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-sm text-center text-muted-foreground border-t border-border/50 pt-6 bg-secondary/20">
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Demo Credentials:</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-white/50 p-2 rounded border border-border/50 cursor-pointer hover:bg-white hover:border-primary/50 transition-colors" onClick={() => { setEmail('admin@demo.com'); setPassword('password'); }}>
                  <span className="block font-medium text-primary">Agency</span>
                  admin@demo.com
                </div>
                <div className="bg-white/50 p-2 rounded border border-border/50 cursor-pointer hover:bg-white hover:border-primary/50 transition-colors" onClick={() => { setEmail('client@demo.com'); setPassword('password'); }}>
                  <span className="block font-medium text-primary">Client</span>
                  client@demo.com
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
