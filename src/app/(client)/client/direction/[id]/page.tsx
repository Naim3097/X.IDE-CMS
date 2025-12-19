'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContentPiece } from '@/features/agency/hooks/useContentPiece'; // Reusing hook
import { useClientActions } from '@/features/client/hooks/useClientActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { ContentDirection } from '@/lib/types';
import { ArrowLeft, Send, Lightbulb, PenTool, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function ProvideDirectionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: piece, isLoading } = useContentPiece(id);
  const { submitDirection, isSubmittingDirection } = useClientActions();

  const [direction, setDirection] = useState<ContentDirection>({
    topic: '',
    style: '',
    references: ''
  });

  useEffect(() => {
    if (piece?.direction) {
      setDirection(piece.direction);
    }
  }, [piece]);

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!piece) return <div className="p-8 text-center text-muted-foreground">Content piece not found</div>;

  const handleSubmit = () => {
    if (!direction.topic) {
      alert('Please provide a topic.');
      return;
    }
    
    submitDirection({ id: piece.id, direction }, {
      onSuccess: () => {
        alert('Direction submitted! Agency will be notified.');
        router.push(`/client?monthId=${piece.monthId}`);
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl min-h-screen">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors">
        Back to Dashboard
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Provide Content Direction</h1>
        <p className="text-muted-foreground mt-2">C{piece.index} - Help us create the perfect content for you.</p>
      </div>
      
      <Card className="feature-card">
        <CardHeader className="pb-6 border-b border-border/50">
          <CardTitle className="text-xl">Content Brief</CardTitle>
          <CardDescription>
            Fill in the details below to guide our creative team.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-foreground" />
              <Label htmlFor="topic" className="text-base font-semibold">Topic / Core Idea</Label>
            </div>
            <Input 
              id="topic" 
              placeholder="e.g., 3 Tips for Better Sleep"
              value={direction.topic}
              onChange={(e) => setDirection({...direction, topic: e.target.value})}
              className="bg-white/50 border-input focus:bg-white transition-colors h-12 text-lg"
            />
            <p className="text-sm text-muted-foreground pl-7">What is the main subject or key takeaway of this post?</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-foreground" />
              <Label htmlFor="style" className="text-base font-semibold">Style / Tone</Label>
            </div>
            <Input 
              id="style" 
              placeholder="e.g., Educational, Humorous, Professional"
              value={direction.style}
              onChange={(e) => setDirection({...direction, style: e.target.value})}
              className="bg-white/50 border-input focus:bg-white transition-colors h-12"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-foreground" />
              <Label htmlFor="references" className="text-base font-semibold">References / Inspiration (Optional)</Label>
            </div>
            <Input 
              id="references" 
              placeholder="Link to a similar post or image..."
              value={direction.references || ''}
              onChange={(e) => setDirection({...direction, references: e.target.value})}
              className="bg-white/50 border-input focus:bg-white transition-colors h-12"
            />
          </div>

          <div className="pt-4">
            <Button onClick={handleSubmit} disabled={isSubmittingDirection} className="w-full h-12 text-lg cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
              {isSubmittingDirection ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
              {isSubmittingDirection ? 'Submitting...' : 'Submit Direction'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
