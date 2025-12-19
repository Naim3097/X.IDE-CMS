'use client';

import { useParams, useRouter } from 'next/navigation';
import { useContentPiece, useUpdateContentPiece, useSubmitDraft } from '@/features/agency/hooks/useContentPiece';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { AgencyWork, MediaItem } from '@/lib/types';
import { Upload, Loader2, X, ArrowLeft, Save, Send, ImageIcon, Video, History, MessageSquare } from 'lucide-react';
import { storage } from '@/lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ContentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: piece, isLoading } = useContentPiece(id);
  const { mutate: saveWork, isPending: isSaving } = useUpdateContentPiece();
  const { mutate: submitDraft, isPending: isSubmitting } = useSubmitDraft();

  const [work, setWork] = useState<AgencyWork>({
    visualHeadline: '',
    copywriting: '',
    media: []
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (piece?.currentWork) {
      setWork(piece.currentWork);
    }
  }, [piece]);

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!piece) return <div className="p-8 text-center text-muted-foreground">Content piece not found</div>;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      const newMediaItems: MediaItem[] = [];
      
      for (const file of Array.from(files)) {
        // Create a reference to 'content/<id>/<timestamp>_<filename>'
        const storageRef = ref(storage, `content/${id}/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        newMediaItems.push({
          url,
          type: file.type.startsWith('video/') ? 'video' : 'image'
        });
      }

      setWork(prev => ({ 
        ...prev, 
        media: [...(prev.media || []), ...newMediaItems] 
      }));
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setWork(prev => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    saveWork({ id, work }, {
      onSuccess: () => {
        // In a real app, use a toast
        alert('Work saved successfully! Person B can now see these changes.');
      }
    });
  };

  const handleSubmitDraft = () => {
    if (!work.media || work.media.length === 0) {
      alert('Error: Person B must upload visuals before submitting.');
      return;
    }
    
    submitDraft({ 
      id, 
      work, 
      currentDraftsCount: piece.drafts?.length || 0 
    }, {
      onSuccess: () => {
        alert('Draft submitted successfully!');
        // Redirect to client dashboard if clientId is available
        if ((piece as any).clientId) {
          router.push(`/dashboard/client/${(piece as any).clientId}`);
        } else {
          router.push('/dashboard');
        }
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 hover:pl-0 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors">
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              C{piece.index}
            </h1>
            <Badge variant="outline" className="text-sm py-1 px-3 bg-white/50 backdrop-blur-sm">
              {piece.status.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              Working on Draft #{(piece.drafts?.length || 0) + 1}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSave} className="bg-white/50 backdrop-blur-sm hover:bg-white/80">
            Save Progress
          </Button>
          <Button onClick={handleSubmitDraft} className="cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
            <Send className="w-4 h-4 mr-2" />
            Submit Draft #{(piece.drafts?.length || 0) + 1}
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <div className="space-y-8">
          {/* Person A Workspace */}
          <Card className="feature-card">
            <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
              <CardTitle className="text-xl text-foreground">Person A: Copy & Concept</CardTitle>
              <Button size="sm" variant="outline" onClick={handleSave} disabled={isSaving} className="h-8">
                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Save className="w-3 h-3 mr-1" />}
                Save Copy
              </Button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="headline" className="text-base font-medium">Visual Headline (Text on Image)</Label>
                <Input 
                  id="headline" 
                  value={work.visualHeadline || ''} 
                  onChange={(e) => setWork({...work, visualHeadline: e.target.value})}
                  placeholder="e.g., 'Stop Wasting Time on X'"
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copy" className="text-base font-medium">Caption / Copywriting</Label>
                <textarea 
                  id="copy" 
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                  value={work.copywriting || ''} 
                  onChange={(e) => setWork({...work, copywriting: e.target.value})}
                  placeholder="Write the post caption here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Person B Workspace */}
          <Card className="feature-card">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-xl text-foreground">Person B: Visuals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Upload Visuals</Label>
                
                {/* Upload Area */}
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="dropzone-file" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-secondary/30 hover:bg-secondary/50 transition-colors border-border ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-8 h-8 mb-2 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                            <Upload className="w-5 h-5 text-foreground" />
                          </div>
                          <p className="text-sm text-foreground font-medium">Click to upload</p>
                          <p className="text-xs text-muted-foreground">Images or Videos</p>
                        </>
                      )}
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} multiple accept="image/*,video/*" />
                  </label>
                </div>

                {/* Uploaded Files Grid */}
                {work.media && work.media.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {work.media.map((item, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border shadow-sm group bg-secondary/30">
                        <div className="absolute top-1 right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-6 w-6 rounded-full shadow-md"
                            onClick={() => handleRemoveFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        {item.type === 'video' ? (
                          <video 
                            src={item.url} 
                            className="w-full h-full object-cover" 
                            controls 
                            playsInline
                          />
                        ) : (
                          <img src={item.url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                        )}
                        
                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 backdrop-blur-sm">
                          <p className="text-[10px] text-white text-center capitalize">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Client Direction & Feedback */}
        <div className="space-y-6">
          {/* Feedback History */}
          {piece.drafts && piece.drafts.length > 0 && (
            <Card className="feature-card border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-900/10">
              <CardHeader className="pb-3 border-b border-amber-100 dark:border-amber-900/50">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500">
                  <History className="w-5 h-5" />
                  <CardTitle className="text-lg">Feedback History</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4 max-h-[300px] overflow-y-auto">
                {piece.drafts.slice().reverse().map((draft) => (
                  draft.feedback && (
                    <div key={draft.number} className="p-3 bg-white dark:bg-card rounded-md border border-amber-100 dark:border-amber-900/30 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="text-xs font-medium bg-amber-50 text-amber-700 border-amber-200">
                          Draft #{draft.number}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(draft.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2 items-start">
                        <MessageSquare className="w-3 h-3 mt-1 text-muted-foreground shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">
                          {draft.feedback}
                        </p>
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="feature-card h-fit sticky top-6">
            <CardHeader className="pb-4 border-b border-border/50 bg-secondary/20">
              <CardTitle className="text-lg">Client Direction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {piece.direction ? (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Topic</Label>
                    <p className="font-medium text-lg leading-tight">{piece.direction.topic}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Style / Tone</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{piece.direction.style}</p>
                  </div>
                  {piece.direction.references && (
                    <div className="space-y-1">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">References</Label>
                      <a href="#" className="text-sm text-foreground hover:underline block truncate">
                        {piece.direction.references}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 px-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-muted-foreground font-medium">Client has not provided direction yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
