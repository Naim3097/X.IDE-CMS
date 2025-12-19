'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContentPiece } from '@/features/agency/hooks/useContentPiece';
import { useClientActions } from '@/features/client/hooks/useClientActions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MediaPreview } from '@/components/media-preview';
import { useState } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, MessageSquare, Download, Loader2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ReviewDraftPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: piece, isLoading } = useContentPiece(id);
  const { approveContent, requestChanges, isApproving, isRequesting } = useClientActions();
  const [feedback, setFeedback] = useState('');

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!piece) return <div className="p-8 text-center text-muted-foreground">Content piece not found</div>;

  const handleApprove = () => {
    if (confirm('Are you sure you want to approve this content?')) {
      approveContent(piece.id, {
        onSuccess: () => {
          alert('Content Approved! It will be scheduled for publishing.');
          router.push(`/client?monthId=${piece.monthId}`);
        }
      });
    }
  };

  const handleRequestChanges = () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for the changes.');
      return;
    }
    requestChanges({ id: piece.id, feedback }, {
      onSuccess: () => {
        alert('Feedback sent to the agency. They will work on the next draft.');
        router.push(`/client?monthId=${piece.monthId}`);
      }
    });
  };

  const handleDownload = async (index?: number) => {
    if (!piece.currentWork.media || piece.currentWork.media.length === 0) {
      alert('No media to download.');
      return;
    }

    const downloadItem = async (item: any, i: number) => {
      try {
        // Fetch the blob first to force download instead of opening in new tab
        const response = await fetch(item.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `content-${piece.id}-media-${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (e) {
        // Fallback to direct link
        const link = document.createElement('a');
        link.href = item.url;
        link.download = `content-${piece.id}-media-${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };
    
    if (typeof index === 'number') {
      // Download specific item
      await downloadItem(piece.currentWork.media[index], index);
    } else {
      // Download all with delay
      for (let i = 0; i < piece.currentWork.media.length; i++) {
        await downloadItem(piece.currentWork.media[i], i);
        if (i < piece.currentWork.media.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl min-h-screen">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors">
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {piece.status === 'approved' ? 'Approved Content' : 'Review Draft'}
          </h1>
          <p className="text-muted-foreground mt-1">C{piece.index} - Draft #{piece.drafts?.length || 0}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Always show download button if media exists */}
          {piece.currentWork.media && piece.currentWork.media.length > 0 && (
            piece.currentWork.media.length === 1 ? (
              <Button variant="outline" className="flex-1 md:flex-none hover:bg-secondary" onClick={() => handleDownload(0)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 md:flex-none hover:bg-secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Download ({piece.currentWork.media.length})
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDownload()}>
                    Download All (Zip-like)
                  </DropdownMenuItem>
                  {piece.currentWork.media.map((_, i) => (
                    <DropdownMenuItem key={i} onClick={() => handleDownload(i)}>
                      Download Visual {i + 1}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}

          {piece.status === 'approved' ? (
            <div className="flex items-center gap-2 text-green-600 font-medium px-4">
              <CheckCircle2 className="w-5 h-5" />
              <span>Approved</span>
            </div>
          ) : (
            <>
              <Button variant="outline" className="flex-1 md:flex-none hover:bg-secondary" onClick={() => document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Request Changes
              </Button>
              <Button 
                className="flex-1 md:flex-none cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" 
                onClick={handleApprove}
                disabled={isApproving || isRequesting}
              >
                {isApproving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve Content'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Preview Section */}
        <div className="space-y-6">
          <Card className="feature-card overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border/50 pb-4">
              <CardTitle className="text-xl">Visual Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 h-full">
                {/* Media Preview */}
                <div className="bg-secondary/10 p-6 flex items-center justify-center min-h-[400px] border-r border-border/50">
                  <div className="relative w-full max-w-sm aspect-[4/5] bg-white shadow-lg rounded-lg overflow-hidden border border-border/50">
                    <MediaPreview 
                      media={piece.currentWork.media} 
                      visualHeadline={piece.currentWork.visualHeadline} 
                    />
                  </div>
                </div>
                
                {/* Copy Preview */}
                <div className="p-6 md:p-8 bg-white">
                  <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary" />
                    <div className="h-4 w-24 bg-secondary rounded" />
                  </div>
                  <div className="space-y-4">
                    <div className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                      {piece.currentWork.copywriting || <span className="italic text-muted-foreground">No copy provided</span>}
                    </div>
                    <div className="pt-4 text-sm text-muted-foreground font-medium">
                      #marketing #growth #business
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6" id="feedback-section">
          <Card className="feature-card h-fit sticky top-6">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg">Feedback & Changes</CardTitle>
              <CardDescription>
                If you'd like changes, please describe them below.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="feedback" className="text-base font-medium">Your Feedback</Label>
                <textarea 
                  id="feedback" 
                  className="flex min-h-[150px] w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g., The headline is too aggressive, please make it softer..."
                />
              </div>
              <Button 
                onClick={handleRequestChanges} 
                variant="outline" 
                className="w-full"
                disabled={isApproving || isRequesting}
              >
                {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
              </Button>
            </CardContent>
          </Card>

          {/* Feedback History */}
          {piece.drafts && piece.drafts.length > 0 && (
            <Card className="feature-card">
              <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-lg">Revision History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {piece.drafts.map((draft, i) => (
                  <div key={i} className="relative pl-6 pb-6 border-l border-border last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary" />
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-sm">Draft {i + 1}</span>
                      <span className="text-xs text-muted-foreground capitalize">{draft.status.replace('_', ' ')}</span>
                    </div>
                    {draft.feedback && (
                      <div className="bg-secondary/30 p-3 rounded-md text-sm text-muted-foreground italic">
                        "{draft.feedback}"
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
