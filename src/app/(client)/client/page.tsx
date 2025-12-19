'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useClientDashboard } from '@/features/client/hooks/useClientDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaPreview } from '@/components/media-preview';
import Link from 'next/link';
import { CheckCircle2, Clock, PenTool, AlertCircle, ImageIcon } from 'lucide-react';

function ClientDashboardContent() {
  const searchParams = useSearchParams();
  const monthIdParam = searchParams.get('monthId');
  const clientId = '1'; 
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');
  
  const { months, contentPieces, isLoading } = useClientDashboard(clientId, selectedMonthId);

  useEffect(() => {
    if (monthIdParam) {
      setSelectedMonthId(monthIdParam);
    } else if (months && months.length > 0 && !selectedMonthId) {
      setSelectedMonthId(months[0].id);
    }
  }, [monthIdParam, months, selectedMonthId]);

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Content Dashboard</h1>
          <p className="text-muted-foreground">Manage your content pipeline</p>
        </div>
        <select 
          className="flex h-10 w-[200px] items-center justify-between rounded-md border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          value={selectedMonthId} 
          onChange={(e) => setSelectedMonthId(e.target.value)}
        >
          {months?.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentPieces?.map((piece) => (
          <Card key={piece.id} className="feature-card flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl font-semibold text-foreground">C{piece.index}</CardTitle>
                <StatusBadge status={piece.status} />
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 pt-4">
              {/* Preview Section */}
              <div className="aspect-video w-full rounded-md border border-border/50 overflow-hidden">
                <MediaPreview 
                  media={piece.currentWork?.media} 
                  visualHeadline={piece.currentWork?.visualHeadline} 
                />
              </div>

              {piece.direction ? (
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-foreground">{piece.direction.topic}</p>
                  <p className="text-muted-foreground line-clamp-2">{piece.direction.style}</p>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4" />
                  <span>Needs your input</span>
                </div>
              )}
              
              <div className="mt-auto pt-2">
                {piece.status === 'waiting_for_direction' && (
                  <Link href={`/client/direction/${piece.id}`}>
                    <Button className="w-full cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                      Provide Direction
                    </Button>
                  </Link>
                )}
                
                {piece.status === 'client_review' && (
                  <Link href={`/client/review/${piece.id}`}>
                    <Button className="w-full cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                      Review Draft
                    </Button>
                  </Link>
                )}

                {piece.status === 'agency_prep' && (
                  <Button disabled variant="secondary" className="w-full cta-button bg-secondary text-secondary-foreground border border-border">
                    Agency Working
                  </Button>
                )}

                {piece.status === 'approved' && (
                  <Link href={`/client/review/${piece.id}`}>
                    <Button variant="outline" className="w-full text-muted-foreground border-border bg-secondary/50 cta-button hover:bg-secondary hover:text-foreground">
                      View & Download
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'waiting_for_direction':
      return <Badge variant="outline" className="bg-secondary/50 text-muted-foreground border-border">Needs Input</Badge>;
    case 'agency_prep':
      return <Badge variant="outline" className="bg-secondary text-foreground border-border">In Progress</Badge>;
    case 'client_review':
      return <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Review</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-primary text-primary-foreground border-primary">Approved</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ClientDashboardContent />
    </Suspense>
  );
}
