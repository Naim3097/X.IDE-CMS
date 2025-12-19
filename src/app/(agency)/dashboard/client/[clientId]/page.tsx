'use client';

import { useState, useEffect } from 'react';
import { useAgencyDashboard, useCreateMonth } from '@/features/agency/hooks/useAgencyDashboard';
import { useResetContentPiece } from '@/features/agency/hooks/useContentPiece';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MediaPreview } from '@/components/media-preview';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Plus, Calendar, ImageIcon, ArrowLeft, Loader2, AlertCircle, RotateCcw, MoreVertical, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AgencyClientDashboardPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [selectedMonthId, setSelectedMonthId] = useState<string>('');
  
  const { months, contentPieces, isLoading } = useAgencyDashboard(clientId, selectedMonthId);
  const { mutate: createMonth, isPending: isCreating } = useCreateMonth();
  const { mutate: resetPiece, isPending: isResetting } = useResetContentPiece();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reset Dialog State
  const [resettingCardId, setResettingCardId] = useState<string | null>(null);
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  // Form State
  const [newMonthName, setNewMonthName] = useState('November 2025');
  const [newMonthYear, setNewMonthYear] = useState(2025);
  const [newMonthNum, setNewMonthNum] = useState(11);
  const [newAllocation, setNewAllocation] = useState(15);

  // Auto-select first month if none selected
  useEffect(() => {
    if (months && months.length > 0 && !selectedMonthId) {
      setSelectedMonthId(months[0].id);
    }
  }, [months, selectedMonthId]);

  const handleCreateMonth = () => {
    createMonth({
      clientId,
      name: newMonthName,
      year: newMonthYear,
      month: newMonthNum,
      allocation: newAllocation
    }, {
      onSuccess: (newMonth) => {
        setIsDialogOpen(false);
        setSelectedMonthId(newMonth.id);
        // Reset form defaults for next time
        setNewMonthName('December 2025');
        setNewMonthNum(12);
      }
    });
  };

  const handleResetClick = (id: string) => {
    setResettingCardId(id);
    setResetStep(1);
  };

  const confirmReset = () => {
    if (!resettingCardId) return;
    
    if (resetStep === 1) {
      setResetStep(2);
      return;
    }

    resetPiece(resettingCardId, {
      onSuccess: () => {
        setResettingCardId(null);
        setResetStep(1);
      }
    });
  };

  if (isLoading && !months) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clients
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Client Content</h1>
          <p className="text-muted-foreground mt-1">Manage content production and client approvals.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select 
              className="flex h-10 w-full md:w-[200px] items-center justify-between rounded-md border border-input bg-white/50 pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm appearance-none"
              value={selectedMonthId} 
              onChange={(e) => setSelectedMonthId(e.target.value)}
            >
              {months?.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="cta-button bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                New Month
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Content Month</DialogTitle>
                <DialogDescription>
                  Set up a new month of content. This will generate empty content cards waiting for direction.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newMonthName}
                    onChange={(e) => setNewMonthName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="allocation" className="text-right">
                    Pieces
                  </Label>
                  <Input
                    id="allocation"
                    type="number"
                    value={newAllocation}
                    onChange={(e) => setNewAllocation(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateMonth} disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Month
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={!!resettingCardId} onOpenChange={(open) => !open && setResettingCardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {resetStep === 1 ? 'Reset Content Card?' : 'FINAL WARNING'}
            </DialogTitle>
            <DialogDescription>
              {resetStep === 1 
                ? "This will clear all content direction, drafts, and agency work for this card. It will return to 'Waiting for Direction' status."
                : "Are you absolutely sure? This action cannot be undone. All history for this card will be permanently lost."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResettingCardId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmReset} disabled={isResetting}>
              {isResetting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              {resetStep === 1 ? 'Yes, Reset Card' : 'I Understand, Reset Everything'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {contentPieces?.map((piece) => (
          <Card key={piece.id} className="feature-card flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-foreground">C{piece.index}</CardTitle>
                  <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                    {piece.status.replace('_', ' ')}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleResetClick(piece.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset Card
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                <div className="space-y-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Topic</span>
                    <p className="font-medium text-foreground leading-tight line-clamp-2">{piece.direction.topic}</p>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Style</span>
                    <p className="text-sm text-muted-foreground truncate">{piece.direction.style}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 rounded-md bg-secondary/30 border border-border/50 text-muted-foreground text-sm italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                  Waiting for client direction
                </div>
              )}

              {/* Feedback Alert */}
              {piece.status === 'changes_requested' && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs p-2 rounded-md border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Client Feedback:</span>
                    <span className="line-clamp-2">{piece.drafts?.[piece.drafts.length - 1]?.feedback || 'Changes requested'}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-auto pt-2">
                <Link href={`/content/${piece.id}`} className="w-full block">
                  <Button variant="outline" className="w-full hover:bg-secondary transition-colors">
                    Open Editor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
